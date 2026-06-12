import { requireStoreProfile } from '@/lib/tenant/get-current-store';

export type StoreProvisionerErrorCode =
  | 'DISABLED'
  | 'FORBIDDEN'
  | 'UNAUTHENTICATED';

export class StoreProvisionerError extends Error {
  constructor(
    message: string,
    public readonly code: StoreProvisionerErrorCode
  ) {
    super(message);
    this.name = 'StoreProvisionerError';
  }
}

export async function requireStoreProvisioner() {
  if (process.env.STORE_PROVISIONING_ENABLED !== 'true') {
    throw new StoreProvisionerError(
      'Provisionamento de lojas não está habilitado neste ambiente.',
      'DISABLED'
    );
  }

  const context = await requireStoreProfile();

  if (context.profile.role !== 'admin') {
    throw new StoreProvisionerError(
      'Você não tem permissão para criar lojas.',
      'FORBIDDEN'
    );
  }

  return context;
}

export async function canManageStores(): Promise<boolean> {
  try {
    await requireStoreProvisioner();
    return true;
  } catch {
    return false;
  }
}
