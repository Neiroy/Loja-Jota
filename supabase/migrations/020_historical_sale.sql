-- Migration: vendas históricas (caderno) sem produtos e sem estoque
-- Pré-requisito: 019_lock_profile_insert.sql
-- Aplicar manualmente no SQL Editor do Supabase (homologação primeiro).
--
-- Permite registrar vendas antigas apenas com dados financeiros.
-- Não cria sale_items e não altera products.

-- ---------------------------------------------------------------------------
-- Colunas em sales
-- ---------------------------------------------------------------------------

alter table public.sales
  add column if not exists is_historical boolean not null default false,
  add column if not exists notes text null;

comment on column public.sales.is_historical is
  'Venda lançada manualmente a partir de histórico/caderno. Sem itens e sem baixa de estoque.';

comment on column public.sales.notes is
  'Observação opcional do lançamento histórico.';

-- ---------------------------------------------------------------------------
-- RPC create_historical_sale
-- ---------------------------------------------------------------------------

create or replace function public.create_historical_sale(
  p_customer_id uuid,
  p_sale_date date,
  p_total numeric,
  p_down_payment numeric,
  p_payment_method public.payment_method,
  p_pending_installments integer,
  p_first_due_date date,
  p_notes text default null
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
  text
) is
  'Registra venda histórica sem itens e sem baixa de estoque. Cria receivables do saldo pendente.';

revoke all on function public.create_historical_sale(
  uuid,
  date,
  numeric,
  numeric,
  public.payment_method,
  integer,
  date,
  text
) from public;

grant execute on function public.create_historical_sale(
  uuid,
  date,
  numeric,
  numeric,
  public.payment_method,
  integer,
  date,
  text
) to authenticated;
