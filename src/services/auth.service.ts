import type { User } from '@supabase/supabase-js';

import { StoreContextError } from '@/lib/tenant/store-errors';
import * as authRepository from '@/repositories/auth.repository';
import * as profilesRepository from '@/repositories/profiles.repository';
import type { LoginInput } from '@/schemas/auth.schema';
import type { AuthUser } from '@/types/auth.types';

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public readonly code: 'INVALID_CREDENTIALS' | 'NO_STORE'
  ) {
    super(message);
    this.name = 'AuthServiceError';
  }
}

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

function isProfileNotFoundError(error: { code?: string; message?: string }) {
  return (
    error.code === 'PROFILE_NOT_FOUND' ||
    error.message?.includes('Perfil não encontrado')
  );
}

async function ensureProfileWithStore(user: AuthUser) {
  const { error: syncError } = await profilesRepository.syncFullNameOnLogin(
    user.id,
    user.fullName
  );

  if (syncError) {
    if (isProfileNotFoundError(syncError)) {
      throw new AuthServiceError(
        'Conta não vinculada a uma loja. Contate o administrador.',
        'NO_STORE'
      );
    }

    throw new AuthServiceError(
      'E-mail ou senha inválidos.',
      'INVALID_CREDENTIALS'
    );
  }

  const { data: profile, error: profileError } =
    await profilesRepository.findById(user.id);

  if (profileError || !profile?.store_id) {
    throw new AuthServiceError(
      'Conta não vinculada a uma loja. Contate o administrador.',
      'NO_STORE'
    );
  }
}

export async function login(input: LoginInput): Promise<AuthUser> {
  const { data, error } = await authRepository.signInWithPassword(
    input.email,
    input.password
  );

  if (error || !data.user) {
    throw new AuthServiceError(
      'E-mail ou senha inválidos.',
      'INVALID_CREDENTIALS'
    );
  }

  const user = mapUser(data.user);

  try {
    await ensureProfileWithStore(user);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      throw error;
    }

    if (error instanceof StoreContextError) {
      throw new AuthServiceError(error.message, 'NO_STORE');
    }

    throw error;
  }

  return user;
}

export async function logout(): Promise<void> {
  const { error } = await authRepository.signOut();

  if (error) {
    throw new Error('Não foi possível encerrar a sessão.');
  }
}
