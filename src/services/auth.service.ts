import type { User } from '@supabase/supabase-js';

import * as authRepository from '@/repositories/auth.repository';
import * as profilesRepository from '@/repositories/profiles.repository';
import type { LoginInput } from '@/schemas/auth.schema';
import type { AuthUser } from '@/types/auth.types';

function mapUser(user: User): AuthUser {
  const metadataName =
    typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : null;

  return {
    id: user.id,
    email: user.email ?? '',
    fullName: metadataName ?? user.email ?? 'Usuário',
  };
}

async function ensureProfile(user: AuthUser) {
  await profilesRepository.upsertOnLogin(user.id, user.fullName);
}

export async function login(input: LoginInput): Promise<AuthUser> {
  const { data, error } = await authRepository.signInWithPassword(
    input.email,
    input.password
  );

  if (error || !data.user) {
    throw new Error('E-mail ou senha inválidos.');
  }

  const user = mapUser(data.user);
  await ensureProfile(user);

  return user;
}

export async function logout(): Promise<void> {
  const { error } = await authRepository.signOut();

  if (error) {
    throw new Error('Não foi possível encerrar a sessão.');
  }
}
