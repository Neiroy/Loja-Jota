-- Migration: loja padrão + backfill de store_id
-- Fase 12 — Multi-loja / Multi-tenant
-- Pré-requisito: 007_add_store_id_columns.sql
-- Aplicar manualmente no SQL Editor do Supabase (homologação primeiro).
--
-- Cria a loja "Loja Jota" e vincula todos os registros existentes a ela.
-- Idempotente: pode ser reexecutado com segurança (usa slug 'loja-jota').

do $$
declare
  v_default_store_id uuid;
begin
  insert into public.stores (name, slug, is_active)
  values ('Loja Jota', 'loja-jota', true)
  on conflict (slug) do update
    set
      name = excluded.name,
      is_active = true
  returning id into v_default_store_id;

  if v_default_store_id is null then
    select id into v_default_store_id
    from public.stores
    where slug = 'loja-jota';
  end if;

  if v_default_store_id is null then
    raise exception 'Não foi possível resolver a loja padrão (slug: loja-jota).';
  end if;

  update public.customers
  set store_id = v_default_store_id
  where store_id is null;

  update public.products
  set store_id = v_default_store_id
  where store_id is null;

  update public.sales
  set store_id = v_default_store_id
  where store_id is null;

  update public.sale_items as si
  set store_id = s.store_id
  from public.sales as s
  where si.sale_id = s.id
    and si.store_id is null;

  update public.receivables
  set store_id = v_default_store_id
  where store_id is null;

  update public.profiles
  set store_id = v_default_store_id
  where store_id is null;

  raise notice 'Backfill concluído. Loja padrão: %', v_default_store_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Validação pós-backfill (deve retornar 0 linhas em cada query)
-- ---------------------------------------------------------------------------

-- select count(*) as customers_sem_loja from public.customers where store_id is null;
-- select count(*) as products_sem_loja from public.products where store_id is null;
-- select count(*) as sales_sem_loja from public.sales where store_id is null;
-- select count(*) as sale_items_sem_loja from public.sale_items where store_id is null;
-- select count(*) as receivables_sem_loja from public.receivables where store_id is null;
-- select count(*) as profiles_sem_loja from public.profiles where store_id is null;
