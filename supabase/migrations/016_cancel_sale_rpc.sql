-- Migration: RPC cancel_sale
-- Sistema interno de controle da loja (uso autenticado)
-- Pré-requisito: 011_rpc_multi_tenant.sql
-- Referência: docs/DATABASE_SPEC.md, docs/BUSINESS_RULES.md
-- Aplicar manualmente no SQL Editor do Supabase.
--
-- Cancela venda de forma transacional:
-- - Devolve estoque dos itens
-- - Marca sales.payment_status = cancelled
-- - Marca receivables.status = cancelled quando open/overdue
-- - Não apaga registros financeiros

create or replace function public.cancel_sale(p_sale_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_store_id uuid;
  v_sale public.sales%rowtype;
  v_receivable public.receivables%rowtype;
  v_item record;
  v_has_receivable boolean := false;
begin
  v_store_id := public.current_user_store_id();

  if v_store_id is null then
    raise exception 'Usuário não vinculado a uma loja.';
  end if;

  select *
  into v_sale
  from public.sales
  where id = p_sale_id
    and store_id = v_store_id
  for update;

  if not found then
    raise exception 'Venda não encontrada.';
  end if;

  if v_sale.payment_status = 'cancelled' then
    raise exception 'Venda já está cancelada.';
  end if;

  select *
  into v_receivable
  from public.receivables
  where sale_id = p_sale_id
    and store_id = v_store_id
  for update;

  v_has_receivable := found;

  if v_has_receivable then
    if v_receivable.status = 'paid' then
      raise exception
        'Não é possível cancelar venda com fiado já quitado.';
    end if;

    if v_receivable.status = 'cancelled' then
      raise exception 'Venda já está cancelada.';
    end if;
  end if;

  for v_item in
    select
      si.product_id,
      si.quantity
    from public.sale_items as si
    where si.sale_id = p_sale_id
      and si.store_id = v_store_id
  loop
    perform 1
    from public.products as p
    where p.id = v_item.product_id
      and p.store_id = v_store_id
    for update;

    if not found then
      raise exception 'Produto vinculado à venda não foi encontrado.';
    end if;

    update public.products
    set stock_quantity = stock_quantity + v_item.quantity
    where id = v_item.product_id
      and store_id = v_store_id;
  end loop;

  update public.sales
  set payment_status = 'cancelled'
  where id = p_sale_id
    and store_id = v_store_id;

  if v_has_receivable
    and v_receivable.status in ('open', 'overdue') then
    update public.receivables
    set status = 'cancelled'
    where id = v_receivable.id
      and store_id = v_store_id;
  end if;

  return p_sale_id;
end;
$$;

comment on function public.cancel_sale(uuid) is
  'Cancela venda da loja do usuário: devolve estoque, marca sale/receivable como cancelled.';

revoke all on function public.cancel_sale(uuid) from public;

grant execute on function public.cancel_sale(uuid) to authenticated;
