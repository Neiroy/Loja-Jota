-- Migration: cartão débito/crédito e parcelamento informativo
-- Pré-requisito: 011_rpc_multi_tenant.sql
-- Aplicar manualmente no SQL Editor do Supabase (homologação primeiro).
--
-- Adiciona metadados de cartão em sales sem alterar payment_method = 'card'.
-- Parcelamento de cartão crédito é apenas informativo (venda continua paid).

-- ---------------------------------------------------------------------------
-- Enum card_payment_type
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.card_payment_type as enum ('debit', 'credit');
exception
  when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Colunas em sales
-- ---------------------------------------------------------------------------

alter table public.sales
  add column if not exists card_payment_type public.card_payment_type null,
  add column if not exists installments_count integer null;

alter table public.sales
  drop constraint if exists sales_card_payment_consistency;

alter table public.sales
  add constraint sales_card_payment_consistency check (
    (
      payment_method <> 'card'
      and card_payment_type is null
      and installments_count is null
    )
    or (
      payment_method = 'card'
      and card_payment_type = 'debit'
      and installments_count is null
    )
    or (
      payment_method = 'card'
      and card_payment_type = 'credit'
      and installments_count in (1, 2, 3, 4, 5, 6, 10, 12)
    )
    or (
      payment_method = 'card'
      and card_payment_type is null
      and installments_count is null
    )
  );

-- ---------------------------------------------------------------------------
-- RPC create_sale_with_items (parâmetros opcionais de cartão no final)
-- ---------------------------------------------------------------------------

drop function if exists public.create_sale_with_items(
  uuid,
  numeric,
  public.payment_method,
  jsonb
);

create or replace function public.create_sale_with_items(
  p_customer_id uuid,
  p_discount numeric,
  p_payment_method public.payment_method,
  p_items jsonb,
  p_card_payment_type public.card_payment_type default null,
  p_installments_count integer default null
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_store_id uuid;
  v_sale_id uuid;
  v_sale_date date := current_date;
  v_subtotal numeric(12, 2) := 0;
  v_total numeric(12, 2);
  v_payment_status public.sale_payment_status;
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_unit_price numeric(12, 2);
  v_item_total numeric(12, 2);
  v_product_name text;
  v_stock integer;
  v_is_active boolean;
  v_seen_products uuid[] := '{}';
begin
  v_store_id := public.current_user_store_id();

  if v_store_id is null then
    raise exception 'Usuário não vinculado a uma loja.';
  end if;

  if p_discount is null or p_discount < 0 then
    raise exception 'Desconto deve ser maior ou igual a zero.';
  end if;

  if p_payment_method <> 'card' then
    if p_card_payment_type is not null or p_installments_count is not null then
      raise exception
        'Campos de cartão só são permitidos quando a forma de pagamento é cartão.';
    end if;
  else
    if p_card_payment_type is null then
      raise exception 'Tipo do cartão é obrigatório para pagamento com cartão.';
    end if;

    if p_card_payment_type = 'debit' then
      if p_installments_count is not null then
        raise exception 'Cartão débito não permite parcelamento.';
      end if;
    elsif p_card_payment_type = 'credit' then
      if p_installments_count is null then
        raise exception 'Quantidade de parcelas é obrigatória para cartão crédito.';
      end if;

      if p_installments_count not in (1, 2, 3, 4, 5, 6, 10, 12) then
        raise exception 'Quantidade de parcelas inválida.';
      end if;
    end if;
  end if;

  if not exists (
    select 1
    from public.customers
    where id = p_customer_id
      and store_id = v_store_id
      and is_active = true
  ) then
    raise exception 'Cliente não encontrado ou inativo.';
  end if;

  if p_items is null
    or jsonb_typeof(p_items) <> 'array'
    or jsonb_array_length(p_items) = 0 then
    raise exception 'A venda deve ter pelo menos um item.';
  end if;

  for v_item in
    select value
    from jsonb_array_elements(p_items) as t(value)
  loop
    begin
      v_product_id := (v_item->>'product_id')::uuid;
    exception
      when others then
        raise exception 'Produto inválido no item da venda.';
    end;

    begin
      v_quantity := (v_item->>'quantity')::integer;
    exception
      when others then
        raise exception 'Quantidade inválida no item da venda.';
    end;

    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Quantidade deve ser maior que zero.';
    end if;

    if v_product_id = any (v_seen_products) then
      raise exception
        'Produto duplicado na venda. Agrupe a quantidade em um único item.';
    end if;

    v_seen_products := array_append(v_seen_products, v_product_id);

    select
      p.name,
      p.sale_price,
      p.stock_quantity,
      p.is_active
    into
      v_product_name,
      v_unit_price,
      v_stock,
      v_is_active
    from public.products as p
    where p.id = v_product_id
      and p.store_id = v_store_id
    for update;

    if not found then
      raise exception 'Produto não encontrado.';
    end if;

    if not v_is_active then
      raise exception 'Produto "%" está inativo.', v_product_name;
    end if;

    if v_stock < v_quantity then
      raise exception 'Estoque insuficiente para o produto "%".', v_product_name;
    end if;

    v_item_total := round(v_unit_price * v_quantity, 2);
    v_subtotal := v_subtotal + v_item_total;
  end loop;

  if p_discount > v_subtotal then
    raise exception 'Desconto não pode ser maior que o subtotal.';
  end if;

  v_total := round(v_subtotal - p_discount, 2);

  if v_total < 0 then
    raise exception 'Total da venda não pode ser negativo.';
  end if;

  if p_payment_method = 'credit_30_days' then
    v_payment_status := 'pending';

    if v_total <= 0 then
      raise exception 'Venda fiada deve ter total maior que zero.';
    end if;
  else
    v_payment_status := 'paid';
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
    installments_count
  )
  values (
    v_store_id,
    p_customer_id,
    v_sale_date,
    v_subtotal,
    p_discount,
    v_total,
    p_payment_method,
    v_payment_status,
    p_card_payment_type,
    p_installments_count
  )
  returning id into v_sale_id;

  for v_item in
    select value
    from jsonb_array_elements(p_items) as t(value)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;

    select p.sale_price, p.name
    into v_unit_price, v_product_name
    from public.products as p
    where p.id = v_product_id
      and p.store_id = v_store_id
    for update;

    v_item_total := round(v_unit_price * v_quantity, 2);

    insert into public.sale_items (
      store_id,
      sale_id,
      product_id,
      quantity,
      unit_price,
      total
    )
    values (
      v_store_id,
      v_sale_id,
      v_product_id,
      v_quantity,
      v_unit_price,
      v_item_total
    );

    update public.products
    set stock_quantity = stock_quantity - v_quantity
    where id = v_product_id
      and store_id = v_store_id
      and stock_quantity >= v_quantity;

    if not found then
      raise exception 'Estoque insuficiente para o produto "%".', v_product_name;
    end if;
  end loop;

  if p_payment_method = 'credit_30_days' then
    insert into public.receivables (
      store_id,
      sale_id,
      customer_id,
      amount,
      due_date,
      status
    )
    values (
      v_store_id,
      v_sale_id,
      p_customer_id,
      v_total,
      v_sale_date + 30,
      'open'
    );
  end if;

  return v_sale_id;
end;
$$;

revoke all on function public.create_sale_with_items(
  uuid,
  numeric,
  public.payment_method,
  jsonb,
  public.card_payment_type,
  integer
) from public;

grant execute on function public.create_sale_with_items(
  uuid,
  numeric,
  public.payment_method,
  jsonb,
  public.card_payment_type,
  integer
) to authenticated;
