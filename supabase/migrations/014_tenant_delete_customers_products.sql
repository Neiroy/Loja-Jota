-- Migration: DELETE policies para customers e products
-- Corrige exclusão definitiva quando não há histórico financeiro vinculado.
-- Pré-requisito: 013_store_logo.sql
-- Aplicar manualmente no SQL Editor do Supabase (homologação primeiro).
--
-- Sem estas policies, DELETE via app retorna sucesso com 0 linhas (RLS bloqueia).

-- ---------------------------------------------------------------------------
-- customers — DELETE apenas da própria loja
-- ---------------------------------------------------------------------------

drop policy if exists "tenant_delete_customers" on public.customers;

create policy "tenant_delete_customers"
on public.customers
for delete
to authenticated
using (
  store_id = public.current_user_store_id()
  and public.current_user_store_id() is not null
);

-- ---------------------------------------------------------------------------
-- products — DELETE apenas da própria loja
-- ---------------------------------------------------------------------------

drop policy if exists "tenant_delete_products" on public.products;

create policy "tenant_delete_products"
on public.products
for delete
to authenticated
using (
  store_id = public.current_user_store_id()
  and public.current_user_store_id() is not null
);
