-- Migration: itens informativos de vendas históricas
-- Pré-requisito: 020_historical_sale.sql
-- Aplicar manualmente no SQL Editor do Supabase (homologação primeiro).
--
-- Cria historical_sale_items (snapshot textual, sem estoque).
-- Atualiza create_historical_sale para aceitar p_items jsonb.
-- Não altera sale_items, products nem create_sale_with_items.

-- ---------------------------------------------------------------------------
-- Tabela historical_sale_items
-- ---------------------------------------------------------------------------

create table if not exists public.historical_sale_items (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete restrict,
  sale_id uuid not null references public.sales (id) on delete cascade,
  product_id uuid null references public.products (id) on delete set null,
  description text not null,
  quantity integer not null,
  unit_price numeric(12, 2) not null,
  total numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  constraint historical_sale_items_description_not_blank
    check (length(trim(description)) > 0),
  constraint historical_sale_items_quantity_positive
    check (quantity > 0),
  constraint historical_sale_items_unit_price_non_negative
    check (unit_price >= 0),
  constraint historical_sale_items_total_non_negative
    check (total >= 0),
  constraint historical_sale_items_total_calculation
    check (total = round(quantity * unit_price, 2))
);

comment on table public.historical_sale_items is
  'Itens informativos de vendas históricas. Não baixam estoque e não usam sale_items.';

comment on column public.historical_sale_items.product_id is
  'Referência opcional ao catálogo (snapshot). Nunca usada para estoque.';

comment on column public.historical_sale_items.description is
  'Nome/descrição do produto no momento do lançamento histórico.';

create index if not exists idx_historical_sale_items_store_id
  on public.historical_sale_items (store_id);

create index if not exists idx_historical_sale_items_sale_id
  on public.historical_sale_items (sale_id);

-- ---------------------------------------------------------------------------
-- RLS (somente esta tabela)
-- ---------------------------------------------------------------------------

alter table public.historical_sale_items enable row level security;

drop policy if exists "tenant_select_historical_sale_items"
  on public.historical_sale_items;
drop policy if exists "tenant_insert_historical_sale_items"
  on public.historical_sale_items;

create policy "tenant_select_historical_sale_items"
on public.historical_sale_items
for select
to authenticated
using (
  store_id = public.current_user_store_id()
  and public.current_user_store_id() is not null
);

create policy "tenant_insert_historical_sale_items"
on public.historical_sale_items
for insert
to authenticated
with check (
  store_id = public.current_user_store_id()
  and public.current_user_store_id() is not null
);

-- ---------------------------------------------------------------------------
-- RPC create_historical_sale (substitui assinatura da 020)
-- ---------------------------------------------------------------------------

drop function if exists public.create_historical_sale(
  uuid,
  date,
  numeric,
  numeric,
  public.payment_method,
  integer,
  date,
  text
);

create or replace function public.create_historical_sale(
  p_customer_id uuid,
  p_sale_date date,
  p_total numeric,
  p_down_payment numeric,
  p_payment_method public.payment_method,
  p_pending_installments integer,
  p_first_due_date date,
  p_notes text default null,
  p_items jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_store_id uuid;
  v_sale_id uuid;
  v_remaining numeric(12, 2);
  v_payment_status public.sale_payment_status;
  v_down_payment numeric(12, 2);
  v_installment_amount numeric(12, 2);
  v_installments_sum numeric(12, 2) := 0;
  v_installment_index integer;
  v_customer_active boolean;
  v_items jsonb;
  v_item jsonb;
  v_item_index integer := 0;
  v_description text;
  v_quantity integer;
  v_unit_price numeric(12, 2);
  v_item_total numeric(12, 2);
  v_product_id uuid;
  v_product_exists boolean;
begin
  v_store_id := public.current_user_store_id();

  if v_store_id is null then
    raise exception 'Usuário não vinculado a uma loja.';
  end if;

  if p_total is null or p_total <= 0 then
    raise exception 'Total da venda deve ser maior que zero.';
  end if;

  v_down_payment := coalesce(p_down_payment, 0);

  if v_down_payment < 0 then
    raise exception 'Valor já pago deve ser maior ou igual a zero.';
  end if;

  if v_down_payment > p_total then
    raise exception 'Valor já pago não pode ser maior que o total da venda.';
  end if;

  if p_sale_date is null or p_sale_date > current_date then
    raise exception 'Data da venda não pode ser futura.';
  end if;

  select c.is_active
  into v_customer_active
  from public.customers as c
  where c.id = p_customer_id
    and c.store_id = v_store_id;

  if not found or not v_customer_active then
    raise exception 'Cliente não encontrado ou inativo.';
  end if;

  v_items := coalesce(p_items, '[]'::jsonb);

  if jsonb_typeof(v_items) <> 'array' then
    raise exception 'Itens históricos inválidos.';
  end if;

  v_remaining := round(p_total - v_down_payment, 2);

  if v_remaining = 0 then
    v_payment_status := 'paid';

    if coalesce(p_pending_installments, 0) > 0 then
      raise exception
        'Venda quitada não deve ter parcelas pendentes.';
    end if;
  elsif v_down_payment = 0 then
    v_payment_status := 'pending';
  else
    v_payment_status := 'partially_paid';
  end if;

  if v_remaining > 0 then
    if p_pending_installments is null or p_pending_installments < 1 then
      raise exception 'Quantidade de parcelas pendentes é obrigatória.';
    end if;

    if p_first_due_date is null then
      raise exception 'Data do primeiro vencimento é obrigatória.';
    end if;
  end if;

  insert into public.sales (
    store_id,
    customer_id,
    sale_date,
    subtotal,
    discount,
    total,
    payment_method,
    payment_status,
    card_payment_type,
    installments_count,
    down_payment,
    financing_installments_count,
    is_historical,
    notes
  )
  values (
    v_store_id,
    p_customer_id,
    p_sale_date,
    p_total,
    0,
    p_total,
    p_payment_method,
    v_payment_status,
    null,
    null,
    v_down_payment,
    case
      when v_remaining > 0 then p_pending_installments
      else null
    end,
    true,
    nullif(trim(p_notes), '')
  )
  returning id into v_sale_id;

  if v_remaining > 0 then
    v_installment_amount := round(
      v_remaining / p_pending_installments,
      2
    );

    for v_installment_index in 1..p_pending_installments loop
      if v_installment_index < p_pending_installments then
        v_installments_sum := v_installments_sum + v_installment_amount;
      else
        v_installment_amount := round(
          v_remaining - v_installments_sum,
          2
        );
      end if;

      insert into public.receivables (
        store_id,
        sale_id,
        customer_id,
        amount,
        due_date,
        status,
        installment_number,
        installments_total
      )
      values (
        v_store_id,
        v_sale_id,
        p_customer_id,
        v_installment_amount,
        (
          p_first_due_date
          + ((v_installment_index - 1) || ' months')::interval
        )::date,
        'open',
        v_installment_index,
        p_pending_installments
      );
    end loop;
  end if;

  for v_item in
    select value
    from jsonb_array_elements(v_items) as t(value)
  loop
    v_item_index := v_item_index + 1;

    v_description := nullif(trim(coalesce(v_item->>'description', '')), '');
    v_quantity := nullif(v_item->>'quantity', '')::integer;
    v_unit_price := nullif(v_item->>'unit_price', '')::numeric;
    v_product_id := nullif(v_item->>'product_id', '')::uuid;

    if v_description is null then
      raise exception
        'Descrição do produto histórico é obrigatória (item %).',
        v_item_index;
    end if;

    if v_quantity is null or v_quantity < 1 then
      raise exception
        'Quantidade do produto histórico deve ser maior que zero (item %).',
        v_item_index;
    end if;

    if v_unit_price is null or v_unit_price < 0 then
      raise exception
        'Valor unitário do produto histórico inválido (item %).',
        v_item_index;
    end if;

    v_item_total := round(v_quantity * v_unit_price, 2);

    if v_product_id is not null then
      select exists (
        select 1
        from public.products as p
        where p.id = v_product_id
          and p.store_id = v_store_id
      )
      into v_product_exists;

      if not v_product_exists then
        raise exception
          'Produto histórico não encontrado nesta loja (item %).',
          v_item_index;
      end if;
    end if;

    insert into public.historical_sale_items (
      store_id,
      sale_id,
      product_id,
      description,
      quantity,
      unit_price,
      total
    )
    values (
      v_store_id,
      v_sale_id,
      v_product_id,
      v_description,
      v_quantity,
      round(v_unit_price, 2),
      v_item_total
    );
  end loop;

  return v_sale_id;
end;
$$;

comment on function public.create_historical_sale(
  uuid,
  date,
  numeric,
  numeric,
  public.payment_method,
  integer,
  date,
  text,
  jsonb
) is
  'Registra venda histórica sem sale_items e sem baixa de estoque. Aceita itens informativos opcionais e cria receivables do saldo.';

revoke all on function public.create_historical_sale(
  uuid,
  date,
  numeric,
  numeric,
  public.payment_method,
  integer,
  date,
  text,
  jsonb
) from public;

grant execute on function public.create_historical_sale(
  uuid,
  date,
  numeric,
  numeric,
  public.payment_method,
  integer,
  date,
  text,
  jsonb
) to authenticated;
