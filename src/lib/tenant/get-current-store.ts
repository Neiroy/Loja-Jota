import { cache } from 'react';

import * as authRepository from '@/repositories/auth.repository';
import * as profilesRepository from '@/repositories/profiles.repository';
import * as storesRepository from '@/repositories/stores.repository';
import type { Profile } from '@/types/profile.types';

import { StoreContextError } from './store-errors';

export const DEFAULT_STORE_DISPLAY_NAME = 'Loja';

export function getStoreMonogram(displayName: string): string {
  const trimmed = displayName.trim();

  if (!trimmed || trimmed === DEFAULT_STORE_DISPLAY_NAME) {
    return 'L';
  }

  const words = trimmed.split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase();
}

export type StoreContext = {
  storeId: string;
  userId: string;
  profile: Profile;
};

export const getCurrentStoreId = cache(async (): Promise<string> => {
  const context = await requireStoreProfile();
  return context.storeId;
});

export const requireStoreProfile = cache(async (): Promise<StoreContext> => {
  const { user, error: authError } = await authRepository.getUser();

  if (authError || !user) {
    throw new StoreContextError('Usuário não autenticado.', 'UNAUTHENTICATED');
  }

  const { data: profile, error: profileError } =
    await profilesRepository.findById(user.id);

  if (profileError) {
    throw new StoreContextError(
      'Não foi possível carregar o perfil do usuário.',
      'NO_PROFILE'
    );
  }

  if (!profile) {
    throw new StoreContextError(
      'Conta não vinculada a uma loja. Contate o administrador.',
      'NO_PROFILE'
    );
  }

  if (!profile.store_id) {
    throw new StoreContextError(
      'Conta não vinculada a uma loja. Contate o administrador.',
      'NO_STORE'
    );
  }

  return {
    storeId: profile.store_id,
    userId: user.id,
    profile,
  };
});

export const getCurrentStoreDisplayName = cache(async (): Promise<string> => {
  try {
    const storeId = await getCurrentStoreId();
    const { data: store, error } = await storesRepository.findById(storeId);

    if (error || !store?.name?.trim()) {
      return DEFAULT_STORE_DISPLAY_NAME;
    }

    return store.name.trim();
  } catch {
    return DEFAULT_STORE_DISPLAY_NAME;
  }
});
