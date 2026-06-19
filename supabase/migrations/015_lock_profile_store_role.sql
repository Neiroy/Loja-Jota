-- Migration: impedir alteração de store_id e role em profiles
-- Pré-requisito: 010_rls_multi_tenant.sql
-- Aplicar manualmente no SQL Editor do Supabase (homologação primeiro).
--
-- Defesa principal: trigger BEFORE UPDATE bloqueia mudança de store_id/role
-- para usuários autenticados via API (anon key + JWT de usuário).
--
-- Bypass intencional (documentado):
-- - JWT role = service_role → provisionamento admin (profiles-admin.repository)
-- - auth.uid() IS NULL → SQL Editor / conexão postgres sem contexto de usuário
--
-- A policy de UPDATE permanece simples (auth.uid() = id) para evitar recursão
-- de RLS ao subconsultar public.profiles dentro da própria tabela profiles.
--
-- INSERT (handle_new_user, provisionamento) não é afetado — bloqueio só em UPDATE.

create or replace function public.prevent_profile_tenant_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_jwt_role text;
begin
  v_jwt_role := coalesce(auth.jwt() ->> 'role', '');

  if v_jwt_role = 'service_role' or auth.uid() is null then
    return new;
  end if;

  if old.store_id is distinct from new.store_id then
    raise exception
      'Alteração de loja (store_id) não permitida para este usuário.';
  end if;

  if old.role is distinct from new.role then
    raise exception
      'Alteração de perfil (role) não permitida para este usuário.';
  end if;

  return new;
end;
$$;

comment on function public.prevent_profile_tenant_role_change() is
  'Bloqueia UPDATE de store_id/role em profiles para usuários autenticados. '
  'Service role e SQL Editor (sem auth.uid) podem alterar para operações admin.';

drop trigger if exists profiles_prevent_tenant_role_change on public.profiles;

create trigger profiles_prevent_tenant_role_change
before update on public.profiles
for each row
execute function public.prevent_profile_tenant_role_change();

drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
