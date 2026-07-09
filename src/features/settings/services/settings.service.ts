import { formatProfileRole } from '@/features/settings/utils/format-profile-role';
import { getEnvironmentLabel } from '@/features/settings/utils/get-environment-label';
import { getCurrentStoreBranding } from '@/lib/tenant/get-current-store';
import { canManageStores } from '@/lib/tenant/require-store-provisioner';
import * as authRepository from '@/repositories/auth.repository';
import * as profilesRepository from '@/repositories/profiles.repository';
import type { SettingsOverview } from '@/types/settings.types';

const ACTIVE_MODULES = [
  'Dashboard',
  'Clientes',
  'Produtos',
  'Vendas',
  'Fiados',
] as const;

function resolveFullName(
  profileName: string | undefined,
  metadataName: string | undefined,
  email: string | undefined
) {
  if (profileName?.trim()) {
    return profileName.trim();
  }

  if (metadataName?.trim()) {
    return metadataName.trim();
  }

  if (email?.trim()) {
    return email.split('@')[0] ?? 'Usuário';
  }

  return 'Usuário';
}

function buildOverview(
  branding: Awaited<ReturnType<typeof getCurrentStoreBranding>>,
  account: SettingsOverview['account']
): SettingsOverview {
  return {
    store: {
      name: branding.storeName,
      type: 'Sistema interno',
      status: 'Ativo',
      environment: getEnvironmentLabel(),
      monogram: branding.storeMonogram,
      logoUrl: branding.logoUrl,
    },
    account,
    preferences: {
      creditTermDays: 30,
      currency: 'Real brasileiro (BRL)',
      language: 'Português (Brasil)',
      stockControl: 'Ativo',
    },
    modules: [...ACTIVE_MODULES],
    security: {
      protectedRoutes: 'Ativo',
      rls: 'Ativo',
      users: 'Internos (cadastro manual)',
      serviceRole:
        'Utilizada apenas em rotinas administrativas seguras no servidor.',
    },
  };
}

export async function getOverview(): Promise<SettingsOverview> {
  const branding = await getCurrentStoreBranding();

  const { user } = await authRepository.getUser();

  const email = user?.email ?? '—';
  const metadataName =
    typeof user?.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : undefined;

  let roleLabel = formatProfileRole('operator');
  let fullName = resolveFullName(undefined, metadataName, email);
  let manageStores = false;

  if (user?.id) {
    const { data: profile } = await profilesRepository.findById(user.id);

    if (profile) {
      fullName = resolveFullName(profile.full_name, metadataName, email);
      roleLabel = formatProfileRole(profile.role);
    }
  }

  manageStores = await canManageStores();

  return buildOverview(branding, {
    fullName,
    email,
    roleLabel,
    authProvider: 'Supabase Auth',
    canManageStores: manageStores,
  });
}
