-- Migration: enums e tabelas principais
-- Sistema interno de controle da loja (uso autenticado)
-- Pré-requisito: 001_profiles.sql aplicada
-- Referência: docs/DATABASE_SPEC.md
-- Aplicar manualmente no SQL Editor do Supabase.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.payment_method as enum (
    'cash',
    'pix',
    'card',
    'credit_30_days'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.sale_payment_status as enum (
    'paid',
    'pending',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.receivable_status as enum (
    'open',
    'paid',
    'overdue',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  cpf text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  size text,
  color text,
  sale_price numeric(12, 2) not null,
  stock_quantity integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_sale_price_non_negative check (sale_price >= 0),
  constraint products_stock_quantity_non_negative check (stock_quantity >= 0)
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id),
  sale_date date not null default current_date,
  subtotal numeric(12, 2) not null,
  discount numeric(12, 2) not null default 0,
  total numeric(12, 2) not null,
  payment_method public.payment_method not null,
  payment_status public.sale_payment_status not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sales_subtotal_non_negative check (subtotal >= 0),
  constraint sales_discount_non_negative check (discount >= 0),
  constraint sales_total_non_negative check (total >= 0),
  constraint sales_discount_lte_subtotal check (discount <= subtotal),
  constraint sales_total_calculation check (total = subtotal - discount)
);

create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales (id) on delete restrict,
  product_id uuid not null references public.products (id),
  quantity integer not null,
  unit_price numeric(12, 2) not null,
  total numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  constraint sale_items_quantity_positive check (quantity > 0),
  constraint sale_items_unit_price_non_negative check (unit_price >= 0),
  constraint sale_items_total_non_negative check (total >= 0),
  constraint sale_items_total_calculation check (total = quantity * unit_price)
);

create table if not exists public.receivables (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null unique references public.sales (id) on delete restrict,
  customer_id uuid not null references public.customers (id),
  amount numeric(12, 2) not null,
  due_date date not null,
  status public.receivable_status not null,
  paid_at timestamptz,
  payment_method public.payment_method,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint receivables_amount_positive check (amount > 0),
  constraint receivables_settlement_payment_method_check check (
    payment_method is null
    or payment_method in ('cash', 'pix', 'card')
  )
);

-- ---------------------------------------------------------------------------
-- Índices
-- ---------------------------------------------------------------------------

create index if not exists idx_customers_is_active
  on public.customers (is_active);

create unique index if not exists idx_customers_cpf
  on public.customers (cpf)
  where cpf is not null;

create index if not exists idx_products_is_active
  on public.products (is_active);

create index if not exists idx_sales_customer_id
  on public.sales (customer_id);

create index if not exists idx_sales_sale_date
  on public.sales (sale_date desc);

create index if not exists idx_sales_payment_status
  on public.sales (payment_status);

create index if not exists idx_sale_items_sale_id
  on public.sale_items (sale_id);

create index if not exists idx_sale_items_product_id
  on public.sale_items (product_id);

create index if not exists idx_receivables_customer_id
  on public.receivables (customer_id);

create index if not exists idx_receivables_status
  on public.receivables (status);

create index if not exists idx_receivables_due_date
  on public.receivables (due_date)
  where status in ('open', 'overdue');

-- ---------------------------------------------------------------------------
-- Triggers updated_at (reutiliza public.set_updated_at de 001_profiles.sql)
-- ---------------------------------------------------------------------------

drop trigger if exists customers_set_updated_at on public.customers;

create trigger customers_set_updated_at
before update on public.customers
for each row
execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;

create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists sales_set_updated_at on public.sales;

create trigger sales_set_updated_at
before update on public.sales
for each row
execute function public.set_updated_at();

drop trigger if exists receivables_set_updated_at on public.receivables;

create trigger receivables_set_updated_at
before update on public.receivables
for each row
execute function public.set_updated_at();
