-- Migration: trigger handle_new_user (store_id obrigatório via metadata)
-- Fase 12 — Multi-loja / Multi-tenant
-- Pré-requisito: 011_rpc_multi_tenant.sql
-- Aplicar manualmente no SQL Editor do Supabase (homologação primeiro).
--
-- Comportamento:
-- - Profile só é criado se raw_user_meta_data.store_id existir e for loja ativa.
-- - Usuário sem store_id no metadata NÃO recebe profile (não acessa o painel).
-- - Signup público deve estar desabilitado no Supabase Auth.
--
-- Provisionamento manual de novo usuário (exemplo):
--   1. INSERT INTO stores ... (ou usar loja existente)
--   2. Criar usuário no Dashboard com User Metadata: { "store_id": "<uuid>", "full_name": "Nome" }
--   3. O trigger cria o profile vinculado à loja.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_store_id uuid;
  v_full_name text;
begin
  v_full_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    'Usuário'
  );

  begin
    v_store_id := nullif(trim(new.raw_user_meta_data ->> 'store_id'), '')::uuid;
  exception
    when others then
      v_store_id := null;
  end;

  if v_store_id is null then
    raise warning
      'Usuário % criado sem store_id no metadata. Profile não foi criado.',
      new.id;
    return new;
  end if;

  if not exists (
    select 1
    from public.stores
    where id = v_store_id
      and is_active = true
  ) then
    raise warning
      'Usuário % com store_id inválido ou inativo (%). Profile não foi criado.',
      new.id,
      v_store_id;
    return new;
  end if;

  insert into public.profiles (id, full_name, role, store_id)
  values (
    new.id,
    v_full_name,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'role'), ''), 'operator'),
    v_store_id
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Trigger já existe em 001_profiles.sql; apenas garantir que está ativo.
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
