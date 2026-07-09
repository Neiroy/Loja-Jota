-- Migration: bloquear INSERT manual em profiles por usuários authenticated
-- Pré-requisito: 015_lock_profile_store_role.sql
-- Aplicar manualmente no SQL Editor do Supabase (homologação primeiro).
--
-- Problema corrigido:
-- A policy "Users can insert own profile" (010) permitia INSERT com store_id/role
-- arbitrários, contornando o isolamento multi-loja.
--
-- Após esta migration, profile só pode ser criado por:
-- - trigger handle_new_user / on_auth_user_created (SECURITY DEFINER, 012)
-- - service_role (provisionamento admin via profiles-admin.repository)
--
-- UPDATE de store_id/role continua protegido pela migration 015.

drop policy if exists "Users can insert own profile" on public.profiles;

-- Sem policy de INSERT para authenticated: RLS nega INSERT via API/JWT de usuário.
-- SELECT e UPDATE permanecem conforme 010/015.
