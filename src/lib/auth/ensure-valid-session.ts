import 'server-only';

import * as authRepository from '@/repositories/auth.repository';
import * as profilesRepository from '@/repositories/profiles.repository';

export type ValidSession = {
  valid: true;
  userId: string;
  storeId: string;
};

export type InvalidSession = {
  valid: false;
  reason: 'unauthenticated' | 'no_store';
};

export type EnsureValidSessionResult = ValidSession | InvalidSession;

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
