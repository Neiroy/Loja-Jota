-- Migration: logo da loja (store-logos)
-- Fase 14 — Branding por loja
-- Pré-requisito: 012_update_handle_new_user.sql
-- Aplicar manualmente no SQL Editor do Supabase (homologação primeiro).

-- ---------------------------------------------------------------------------
-- Campo logo_path em stores
-- ---------------------------------------------------------------------------

alter table public.stores
add column if not exists logo_path text null;

comment on column public.stores.logo_path is
  'Path relativo no bucket store-logos. Ex.: {store_id}/logo.png';

-- ---------------------------------------------------------------------------
-- stores — permitir UPDATE da própria loja (logo_path via app)
-- ---------------------------------------------------------------------------

drop policy if exists "users_update_own_store" on public.stores;

create policy "users_update_own_store"
on public.stores
for update
to authenticated
using (
  id = public.current_user_store_id()
  and public.current_user_store_id() is not null
)
with check (
  id = public.current_user_store_id()
  and public.current_user_store_id() is not null
);

-- ---------------------------------------------------------------------------
-- Bucket store-logos (público para leitura via URL em <img>)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'store-logos',
  'store-logos',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- Storage policies — path: {store_id}/logo.{ext}
-- ---------------------------------------------------------------------------

drop policy if exists "store_logos_select_own" on storage.objects;
drop policy if exists "store_logos_insert_own" on storage.objects;
drop policy if exists "store_logos_update_own" on storage.objects;
drop policy if exists "store_logos_delete_own" on storage.objects;

create policy "store_logos_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'store-logos'
  and (storage.foldername(name))[1] = public.current_user_store_id()::text
);

create policy "store_logos_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'store-logos'
  and (storage.foldername(name))[1] = public.current_user_store_id()::text
);

create policy "store_logos_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'store-logos'
  and (storage.foldername(name))[1] = public.current_user_store_id()::text
)
with check (
  bucket_id = 'store-logos'
  and (storage.foldername(name))[1] = public.current_user_store_id()::text
);

create policy "store_logos_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'store-logos'
  and (storage.foldername(name))[1] = public.current_user_store_id()::text
);
