import 'server-only';

import * as authRepository from '@/repositories/auth.repository';
import * as profilesRepository from '@/repositories/profiles.repository';
import * as storesRepository from '@/repositories/stores.repository';

export type ValidSession = {
  valid: true;
  userId: string;
  storeId: string;
};

export type InvalidSession = {
  valid: false;
  reason: 'unauthenticated' | 'no_store' | 'inactive_store';
};

export type EnsureValidSessionResult = ValidSession | InvalidSession;

async function resolveStoreAccess(storeId: string) {
  const { data: store, error } = await storesRepository.findById(storeId);

  if (error || !store) {
    return 'no_store' as const;
  }

  if (!store.is_active) {
    return 'inactive_store' as const;
  }

  return 'active' as const;
}

export async function ensureValidSession(): Promise<EnsureValidSessionResult> {
  const { user, error: authError } = await authRepository.getUser();

  if (authError || !user) {
    return { valid: false, reason: 'unauthenticated' };
  }

  const { data: profile, error: profileError } =
    await profilesRepository.findById(user.id);

  if (profileError || !profile?.store_id) {
    return { valid: false, reason: 'no_store' };
  }

  const storeAccess = await resolveStoreAccess(profile.store_id);

  if (storeAccess === 'no_store') {
    return { valid: false, reason: 'no_store' };
  }

  if (storeAccess === 'inactive_store') {
    return { valid: false, reason: 'inactive_store' };
  }

  return {
    valid: true,
    userId: user.id,
    storeId: profile.store_id,
  };
}

export async function ensureValidSessionOrSignOut(): Promise<EnsureValidSessionResult> {
  const result = await ensureValidSession();

  if (!result.valid) {
    await authRepository.signOut();
  }

  return result;
}
