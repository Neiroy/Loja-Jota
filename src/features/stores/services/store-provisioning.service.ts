import 'server-only';

import { slugify } from '@/lib/utils/slugify';
import {
  StoreProvisionerError,
  requireStoreProvisioner,
} from '@/lib/tenant/require-store-provisioner';
import * as authAdminRepository from '@/repositories/auth-admin.repository';
import * as profilesAdminRepository from '@/repositories/profiles-admin.repository';
import * as storesAdminRepository from '@/repositories/stores-admin.repository';
import {
  provisionStoreSchema,
  type ProvisionStoreInput,
} from '@/features/stores/schemas/store.schema';
import type {
  ProvisionStoreResult,
  StoreListRow,
} from '@/features/stores/types/store-provisioning.types';

export class StoreProvisioningServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'FORBIDDEN'
      | 'DISABLED'
      | 'VALIDATION'
      | 'DUPLICATE_SLUG'
      | 'DUPLICATE_EMAIL'
      | 'STORE_CREATE'
      | 'USER_CREATE'
      | 'PROFILE_LINK'
      | 'DATABASE'
  ) {
    super(message);
    this.name = 'StoreProvisioningServiceError';
  }
}

function mapProvisionerError(error: unknown): never {
  if (error instanceof StoreProvisionerError) {
    const code =
      error.code === 'UNAUTHENTICATED' || error.code === 'FORBIDDEN'
        ? 'FORBIDDEN'
        : error.code;

    throw new StoreProvisioningServiceError(error.message, code);
  }

  throw error;
}

function isDuplicateSlugError(error: { code?: string; message?: string }) {
  return (
    error.code === '23505' &&
    (error.message?.includes('stores_slug') ||
      error.message?.includes('slug') ||
      error.message?.includes('idx_'))
  );
}

function isDuplicateEmailError(message?: string) {
  if (!message) {
    return false;
  }

  const normalized = message.toLowerCase();

  return (
    normalized.includes('already registered') ||
    normalized.includes('already been registered') ||
    normalized.includes('duplicate') ||
    normalized.includes('user already exists')
  );
}

function buildUserCountMap(rows: Array<{ store_id: string }>) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    counts.set(row.store_id, (counts.get(row.store_id) ?? 0) + 1);
  }

  return counts;
}

function resolveSlug(input: ProvisionStoreInput) {
  const baseSlug = input.slug?.trim()
    ? slugify(input.slug)
    : slugify(input.name);
  return slugify(baseSlug);
}

async function rollbackFailedProvision(storeId: string, userId: string) {
  const profileResult = await profilesAdminRepository.deleteById(userId);

  if (profileResult.error && process.env.NODE_ENV === 'development') {
    console.error(
      '[provisionStore] Falha ao remover profile parcial:',
      profileResult.error
    );
  }

  const authResult = await authAdminRepository.deleteUser(userId);

  if (authResult.error && process.env.NODE_ENV === 'development') {
    console.error(
      '[provisionStore] Falha ao remover usuário Auth:',
      authResult.error
    );
  }

  const storeResult = await storesAdminRepository.deleteById(storeId);

  if (storeResult.error && process.env.NODE_ENV === 'development') {
    console.error(
      '[provisionStore] Falha ao remover loja criada:',
      storeResult.error
    );
  }
}

export async function listStores(): Promise<StoreListRow[]> {
  try {
    await requireStoreProvisioner();
  } catch (error) {
    mapProvisionerError(error);
  }

  const [storesResult, profilesResult] = await Promise.all([
    storesAdminRepository.findAll(),
    storesAdminRepository.countUsersGroupedByStore(),
  ]);

  if (storesResult.error) {
    throw new StoreProvisioningServiceError(
      'Não foi possível carregar as lojas.',
      'DATABASE'
    );
  }

  if (profilesResult.error) {
    throw new StoreProvisioningServiceError(
      'Não foi possível carregar as lojas.',
      'DATABASE'
    );
  }

  const userCounts = buildUserCountMap(profilesResult.data ?? []);

  return (storesResult.data ?? []).map((store) => ({
    id: store.id,
    name: store.name,
    slug: store.slug,
    is_active: store.is_active,
    created_at: store.created_at,
    user_count: userCounts.get(store.id) ?? 0,
  }));
}

export async function provisionStore(
  input: unknown
): Promise<ProvisionStoreResult> {
  try {
    await requireStoreProvisioner();
  } catch (error) {
    mapProvisionerError(error);
  }

  const parsed = provisionStoreSchema.safeParse(input);

  if (!parsed.success) {
    throw new StoreProvisioningServiceError(
      'Dados inválidos para criar a loja.',
      'VALIDATION'
    );
  }

  const payload = parsed.data;
  const slug = resolveSlug(payload);

  const { data: existingSlug } = await storesAdminRepository.findBySlug(slug);

  if (existingSlug) {
    throw new StoreProvisioningServiceError(
      'Já existe uma loja com esse slug.',
      'DUPLICATE_SLUG'
    );
  }

  const { data: store, error: storeError } = await storesAdminRepository.insert(
    {
      name: payload.name.trim(),
      slug,
    }
  );

  if (storeError || !store) {
    if (isDuplicateSlugError(storeError ?? {})) {
      throw new StoreProvisioningServiceError(
        'Já existe uma loja com esse slug.',
        'DUPLICATE_SLUG'
      );
    }

    throw new StoreProvisioningServiceError(
      'Não foi possível criar a loja. Tente novamente.',
      'STORE_CREATE'
    );
  }

  const { data: authData, error: authError } =
    await authAdminRepository.createUser({
      email: payload.email,
      password: payload.password,
      fullName: payload.full_name,
      role: payload.role,
      storeId: store.id,
    });

  if (authError || !authData.user) {
    await storesAdminRepository.deleteById(store.id);

    if (isDuplicateEmailError(authError?.message)) {
      throw new StoreProvisioningServiceError(
        'Já existe um usuário com esse e-mail.',
        'DUPLICATE_EMAIL'
      );
    }

    throw new StoreProvisioningServiceError(
      'Não foi possível criar o usuário de acesso.',
      'USER_CREATE'
    );
  }

  const { data: profile, error: profileError } =
    await profilesAdminRepository.ensureProfile({
      id: authData.user.id,
      full_name: payload.full_name,
      role: payload.role,
      store_id: store.id,
    });

  if (profileError || !profile || profile.store_id !== store.id) {
    await rollbackFailedProvision(store.id, authData.user.id);

    throw new StoreProvisioningServiceError(
      'Não foi possível vincular a conta à loja. Tente novamente.',
      'PROFILE_LINK'
    );
  }

  return {
    store_id: store.id,
    store_name: store.name,
    user_email: payload.email,
  };
}
