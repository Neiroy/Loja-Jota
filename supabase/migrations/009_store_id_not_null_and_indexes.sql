-- Migration: store_id NOT NULL + índices multi-tenant
-- Fase 12 — Multi-loja / Multi-tenant
-- Pré-requisito: 008_backfill_default_store.sql (nenhum store_id NULL)
-- Aplicar manualmente no SQL Editor do Supabase (homologação primeiro).
--
-- IMPORTANTE: só execute após confirmar que o backfill zerou todos os NULLs.

-- ---------------------------------------------------------------------------
-- NOT NULL
-- ---------------------------------------------------------------------------

alter table public.profiles
  alter column store_id set not null;

alter table public.customers
  alter column store_id set not null;

alter table public.products
  alter column store_id set not null;

alter table public.sales
  alter column store_id set not null;

alter table public.sale_items
  alter column store_id set not null;

alter table public.receivables
  alter column store_id set not null;

-- ---------------------------------------------------------------------------
-- CPF único por loja (substitui índice global)
-- ---------------------------------------------------------------------------

drop index if exists public.idx_customers_cpf;

create unique index if not exists idx_customers_store_cpf
  on public.customers (store_id, cpf)
  where cpf is not null;

-- ---------------------------------------------------------------------------
-- Índices por store_id
-- ---------------------------------------------------------------------------

create index if not exists idx_profiles_store_id
  on public.profiles (store_id);

create index if not exists idx_customers_store_id
  on public.customers (store_id);

create index if not exists idx_customers_store_active
  on public.customers (store_id, is_active);

create index if not exists idx_products_store_id
  on public.products (store_id);

create index if not exists idx_products_store_active
  on public.products (store_id, is_active);

create index if not exists idx_sales_store_id
  on public.sales (store_id);

create index if not exists idx_sales_store_sale_date
  on public.sales (store_id, sale_date desc);

create index if not exists idx_sales_store_payment_status
  on public.sales (store_id, payment_status);

create index if not exists idx_sale_items_store_id
  on public.sale_items (store_id);

create index if not exists idx_receivables_store_id
  on public.receivables (store_id);

create index if not exists idx_receivables_store_status
  on public.receivables (store_id, status);

create index if not exists idx_receivables_store_due_date_open
  on public.receivables (store_id, due_date)
  where status in ('open', 'overdue');
