-- Migration: RLS e policies MVP
-- Sistema interno: apenas usuários autenticados da loja
-- Pré-requisito: 002_enums_and_tables.sql aplicada
-- Referência: docs/SECURITY_SPEC.md
-- Aplicar manualmente no SQL Editor do Supabase.
--
-- Política de exclusão:
-- - Sem policies DELETE em tabelas financeiras (sales, sale_items, receivables)
-- - Sem policies DELETE em customers e products (preferir is_active = false)
-- - sale_items sem UPDATE (imutabilidade histórica)

-- ---------------------------------------------------------------------------
-- Habilitar RLS
-- ---------------------------------------------------------------------------

alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.receivables enable row level security;

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------

drop policy if exists "authenticated_select_customers" on public.customers;
drop policy if exists "authenticated_insert_customers" on public.customers;
drop policy if exists "authenticated_update_customers" on public.customers;

create policy "authenticated_select_customers"
on public.customers
for select
to authenticated
using (auth.uid() is not null);

create policy "authenticated_insert_customers"
on public.customers
for insert
to authenticated
with check (auth.uid() is not null);

create policy "authenticated_update_customers"
on public.customers
for update
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------

drop policy if exists "authenticated_select_products" on public.products;
drop policy if exists "authenticated_insert_products" on public.products;
drop policy if exists "authenticated_update_products" on public.products;

create policy "authenticated_select_products"
on public.products
for select
to authenticated
using (auth.uid() is not null);

create policy "authenticated_insert_products"
on public.products
for insert
to authenticated
with check (auth.uid() is not null);

create policy "authenticated_update_products"
on public.products
for update
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- sales
-- ---------------------------------------------------------------------------

drop policy if exists "authenticated_select_sales" on public.sales;
drop policy if exists "authenticated_insert_sales" on public.sales;
drop policy if exists "authenticated_update_sales" on public.sales;

create policy "authenticated_select_sales"
on public.sales
for select
to authenticated
using (auth.uid() is not null);

create policy "authenticated_insert_sales"
on public.sales
for insert
to authenticated
with check (auth.uid() is not null);

create policy "authenticated_update_sales"
on public.sales
for update
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- sale_items (sem UPDATE — imutável após criação)
-- ---------------------------------------------------------------------------

drop policy if exists "authenticated_select_sale_items" on public.sale_items;
drop policy if exists "authenticated_insert_sale_items" on public.sale_items;

create policy "authenticated_select_sale_items"
on public.sale_items
for select
to authenticated
using (auth.uid() is not null);

create policy "authenticated_insert_sale_items"
on public.sale_items
for insert
to authenticated
with check (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- receivables
-- ---------------------------------------------------------------------------

drop policy if exists "authenticated_select_receivables" on public.receivables;
drop policy if exists "authenticated_insert_receivables" on public.receivables;
drop policy if exists "authenticated_update_receivables" on public.receivables;

create policy "authenticated_select_receivables"
on public.receivables
for select
to authenticated
using (auth.uid() is not null);

create policy "authenticated_insert_receivables"
on public.receivables
for insert
to authenticated
with check (auth.uid() is not null);

create policy "authenticated_update_receivables"
on public.receivables
for update
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);
