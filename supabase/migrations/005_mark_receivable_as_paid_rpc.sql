-- Migration: RPC mark_receivable_as_paid
-- Sistema interno de controle da loja (uso autenticado)
-- Pré-requisito: 001, 002, 003 e 004 aplicadas
-- Referência: docs/DATABASE_SPEC.md, docs/BUSINESS_RULES.md
-- Aplicar manualmente no SQL Editor do Supabase.

create or replace function public.mark_receivable_as_paid(
  p_receivable_id uuid,
  p_payment_method public.payment_method
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_receivable public.receivables%rowtype;
begin
  if p_payment_method not in ('cash', 'pix', 'card') then
    raise exception
      'Forma de pagamento inválida. Use dinheiro, Pix ou cartão.';
  end if;

  select *
  into v_receivable
  from public.receivables
  where id = p_receivable_id
  for update;

  if not found then
    raise exception 'Fiado não encontrado.';
  end if;

  if v_receivable.status = 'paid' then
    raise exception 'Fiado já está quitado.';
  end if;

  if v_receivable.status = 'cancelled' then
    raise exception 'Fiado cancelado não pode ser quitado.';
  end if;

  if v_receivable.status not in ('open', 'overdue') then
    raise exception 'Fiado não pode ser quitado no status atual.';
  end if;

  update public.receivables
  set
    status = 'paid',
    paid_at = now(),
    payment_method = p_payment_method
  where id = p_receivable_id;

  update public.sales
  set payment_status = 'paid'
  where id = v_receivable.sale_id;

  if not found then
    raise exception 'Venda vinculada ao fiado não foi encontrada.';
  end if;

  return p_receivable_id;
end;
$$;

revoke all on function public.mark_receivable_as_paid(
  uuid,
  public.payment_method
) from public;

grant execute on function public.mark_receivable_as_paid(
  uuid,
  public.payment_method
) to authenticated;
