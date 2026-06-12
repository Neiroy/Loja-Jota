-- Migration: stores (multi-tenant)
-- Fase 12 — Multi-loja / Multi-tenant
-- Pré-requisito: 001_profiles.sql, 002_enums_and_tables.sql, 003_rls_policies.sql
-- Aplicar manualmente no SQL Editor do Supabase (homologação primeiro).
--
-- ATENÇÃO:
-- - Faça backup antes de aplicar em produção.
-- - Aplique as migrations 006–012 em ordem numérica, na mesma janela de manutenção.
-- - Não pule etapas.

-- ---------------------------------------------------------------------------
-- Tabela de lojas (tenants)
-- ---------------------------------------------------------------------------

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stores_name_not_blank check (char_length(trim(name)) > 0)
);

comment on table public.stores is
  'Lojas (tenants). Cadastro de novas lojas é manual via Supabase/SQL no MVP.';

-- ---------------------------------------------------------------------------
-- Trigger updated_at
-- ---------------------------------------------------------------------------

drop trigger if exists stores_set_updated_at on public.stores;

create trigger stores_set_updated_at
before update on public.stores
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS (policies completas em 010_rls_multi_tenant.sql)
-- ---------------------------------------------------------------------------

alter table public.stores enable row level security;
