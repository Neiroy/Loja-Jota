import type { User } from '@supabase/supabase-js';

import { LOGIN_ERROR_MESSAGES } from '@/lib/auth/login-error-messages';
import { StoreContextError } from '@/lib/tenant/store-errors';
import * as authRepository from '@/repositories/auth.repository';
import * as profilesRepository from '@/repositories/profiles.repository';
import * as storesRepository from '@/repositories/stores.repository';
import type { LoginInput } from '@/schemas/auth.schema';
import type { AuthUser } from '@/types/auth.types';

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public readonly code: 'INVALID_CREDENTIALS' | 'NO_STORE' | 'INACTIVE_STORE'
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

function isNoStoreError(error: unknown): boolean {
  if (error instanceof AuthServiceError) {
    return error.code === 'NO_STORE';
  }

  if (error instanceof StoreContextError) {
    return error.code === 'NO_STORE' || error.code === 'NO_PROFILE';
  }

  return false;
}

function isInactiveStoreError(error: unknown): boolean {
  if (error instanceof AuthServiceError) {
    return error.code === 'INACTIVE_STORE';
  }

  if (error instanceof StoreContextError) {
    return error.code === 'INACTIVE_STORE';
  }

  return false;
}

async function signOutAndThrowNoStore(): Promise<never> {
  await authRepository.signOut();
  throw new AuthServiceError(LOGIN_ERROR_MESSAGES.no_store, 'NO_STORE');
}

async function signOutAndThrowInactiveStore(): Promise<never> {
  await authRepository.signOut();
  throw new AuthServiceError(
    LOGIN_ERROR_MESSAGES.inactive_store,
    'INACTIVE_STORE'
  );
}

async function ensureStoreIsAccessible(storeId: string) {
  const { data: store, error: storeError } =
    await storesRepository.findById(storeId);

  if (storeError || !store) {
    await signOutAndThrowNoStore();
  } else if (!store.is_active) {
    await signOutAndThrowInactiveStore();
  }
}

async function ensureProfileWithStore(user: AuthUser) {
  const { error: syncError } = await profilesRepository.syncFullNameOnLogin(
    user.id,
    user.fullName
  );

  if (syncError) {
    if (isProfileNotFoundError(syncError)) {
      await signOutAndThrowNoStore();
    }

    throw new AuthServiceError(
      LOGIN_ERROR_MESSAGES.invalid_credentials,
      'INVALID_CREDENTIALS'
    );
  }

  const { data: profile, error: profileError } =
    await profilesRepository.findById(user.id);

  if (profileError || !profile?.store_id) {
    await signOutAndThrowNoStore();
  } else {
    await ensureStoreIsAccessible(profile.store_id);
  }
}

export async function login(input: LoginInput): Promise<AuthUser> {
  const { data, error } = await authRepository.signInWithPassword(
    input.email,
    input.password
  );

  if (error || !data.user) {
    throw new AuthServiceError(
      LOGIN_ERROR_MESSAGES.invalid_credentials,
      'INVALID_CREDENTIALS'
    );
  }

  const user = mapUser(data.user);

  try {
    await ensureProfileWithStore(user);
  } catch (error) {
    if (
      error instanceof AuthServiceError &&
      (error.code === 'NO_STORE' || error.code === 'INACTIVE_STORE')
    ) {
      throw error;
    }

    if (isInactiveStoreError(error)) {
      await signOutAndThrowInactiveStore();
    }

    if (isNoStoreError(error)) {
      await signOutAndThrowNoStore();
    }

    if (error instanceof AuthServiceError) {
      throw error;
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
