-- Migration: RLS multi-tenant
-- Fase 12 — Multi-loja / Multi-tenant
-- Pré-requisito: 009_store_id_not_null_and_indexes.sql
-- Aplicar manualmente no SQL Editor do Supabase (homologação primeiro).
--
-- Política de exclusão mantida:
-- - Sem DELETE em tabelas financeiras e operacionais
-- - sale_items sem UPDATE (imutabilidade histórica)

-- ---------------------------------------------------------------------------
-- Helper: loja do usuário autenticado
-- ---------------------------------------------------------------------------

create or replace function public.current_user_store_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select store_id
  from public.profiles
  where id = auth.uid();
$$;

comment on function public.current_user_store_id() is
  'Retorna store_id do profile do usuário autenticado. NULL se sem profile ou sem loja.';

revoke all on function public.current_user_store_id() from public;
grant execute on function public.current_user_store_id() to authenticated;

-- ---------------------------------------------------------------------------
-- stores — usuário vê apenas a própria loja
-- ---------------------------------------------------------------------------

drop policy if exists "users_select_own_store" on public.stores;

create policy "users_select_own_store"
on public.stores
for select
to authenticated
using (
  id = public.current_user_store_id()
  and public.current_user_store_id() is not null
);

-- Sem INSERT/UPDATE/DELETE em stores pelo app (cadastro manual no MVP).

-- ---------------------------------------------------------------------------
-- profiles — mantém acesso ao próprio profile
-- (store_id não deve ser alterado pelo app; ver Etapa C no código)
-- ---------------------------------------------------------------------------

drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------

drop policy if exists "authenticated_select_customers" on public.customers;
drop policy if exists "authenticated_insert_customers" on public.customers;
drop policy if exists "authenticated_update_customers" on public.customers;

create policy "tenant_select_customers"
on public.customers
for select
to authenticated
using (
  store_id = public.current_user_store_id()
  and public.current_user_store_id() is not null
);

create policy "tenant_insert_customers"
on public.customers
for insert
to authenticated
with check (
  store_id = public.current_user_store_id()
  and public.current_user_store_id() is not null
);

create policy "tenant_update_customers"
on public.customers
for update
to authenticated
using (
  store_id = public.current_user_store_id()
  and public.current_user_store_id() is not null
)
with check (
  store_id = public.current_user_store_id()
  and public.current_user_store_id() is not null
);

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------

drop policy if exists "authenticated_select_products" on public.products;
drop policy if exists "authenticated_insert_products" on public.products;
drop policy if exists "authenticated_update_products" on public.products;

create policy "tenant_select_products"
on public.products
for select
to authenticated
using (
  store_id = public.current_user_store_id()
  and public.current_user_store_id() is not null
);

create policy "tenant_insert_products"
on public.products
for insert
to authenticated
with check (
  store_id = public.current_user_store_id()
  and public.current_user_store_id() is not null
);

create policy "tenant_update_products"
on public.products
for update
to authenticated
using (
  store_id = public.current_user_store_id()
  and public.current_user_store_id() is not null
)
with check (
  store_id = public.current_user_store_id()
  and public.current_user_store_id() is not null
);

-- ---------------------------------------------------------------------------
-- sales
-- ---------------------------------------------------------------------------

drop policy if exists "authenticated_select_sales" on public.sales;
drop policy if exists "authenticated_insert_sales" on public.sales;
drop policy if exists "authenticated_update_sales" on public.sales;

create policy "tenant_select_sales"
on public.sales
for select
to authenticated
using (
  store_id = public.current_user_store_id()
  and public.current_user_store_id() is not null
);

create policy "tenant_insert_sales"
on public.sales
for insert
to authenticated
with check (
  store_id = public.current_user_store_id()
  and public.current_user_store_id() is not null
);

create policy "tenant_update_sales"
on public.sales
for update
to authenticated
using (
  store_id = public.current_user_store_id()
  and public.current_user_store_id() is not null
)
with check (
  store_id = public.current_user_store_id()
  and public.current_user_store_id() is not null
);

-- ---------------------------------------------------------------------------
-- sale_items (sem UPDATE)
-- ---------------------------------------------------------------------------

drop policy if exists "authenticated_select_sale_items" on public.sale_items;
drop policy if exists "authenticated_insert_sale_items" on public.sale_items;

create policy "tenant_select_sale_items"
on public.sale_items
for select
to authenticated
using (
  store_id = public.current_user_store_id()
  and public.current_user_store_id() is not null
);

create policy "tenant_insert_sale_items"
on public.sale_items
for insert
to authenticated
with check (
  store_id = public.current_user_store_id()
  and public.current_user_store_id() is not null
);

-- ---------------------------------------------------------------------------
-- receivables
-- ---------------------------------------------------------------------------

drop policy if exists "authenticated_select_receivables" on public.receivables;
drop policy if exists "authenticated_insert_receivables" on public.receivables;
drop policy if exists "authenticated_update_receivables" on public.receivables;

create policy "tenant_select_receivables"
on public.receivables
for select
to authenticated
using (
  store_id = public.current_user_store_id()
  and public.current_user_store_id() is not null
);

create policy "tenant_insert_receivables"
on public.receivables
for insert
to authenticated
with check (
  store_id = public.current_user_store_id()
  and public.current_user_store_id() is not null
);

create policy "tenant_update_receivables"
on public.receivables
for update
to authenticated
using (
  store_id = public.current_user_store_id()
  and public.current_user_store_id() is not null
)
with check (
  store_id = public.current_user_store_id()
  and public.current_user_store_id() is not null
);
