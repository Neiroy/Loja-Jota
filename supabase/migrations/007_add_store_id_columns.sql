-- Migration: colunas store_id (nullable — backfill em 008)
-- Fase 12 — Multi-loja / Multi-tenant
-- Pré-requisito: 006_stores.sql
-- Aplicar manualmente no SQL Editor do Supabase (homologação primeiro).

-- ---------------------------------------------------------------------------
-- profiles.store_id
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists store_id uuid references public.stores (id);

-- ---------------------------------------------------------------------------
-- Tabelas operacionais
-- ---------------------------------------------------------------------------

alter table public.customers
  add column if not exists store_id uuid references public.stores (id);

alter table public.products
  add column if not exists store_id uuid references public.stores (id);

alter table public.sales
  add column if not exists store_id uuid references public.stores (id);

alter table public.sale_items
  add column if not exists store_id uuid references public.stores (id);

alter table public.receivables
  add column if not exists store_id uuid references public.stores (id);

comment on column public.profiles.store_id is
  'Loja do usuário. Obrigatório após backfill (009). Usuário sem loja não acessa o painel.';

comment on column public.customers.store_id is 'Tenant — isolamento por loja.';
comment on column public.products.store_id is 'Tenant — isolamento por loja.';
comment on column public.sales.store_id is 'Tenant — isolamento por loja.';
comment on column public.sale_items.store_id is 'Tenant — denormalizado para RLS.';
comment on column public.receivables.store_id is 'Tenant — isolamento por loja.';
