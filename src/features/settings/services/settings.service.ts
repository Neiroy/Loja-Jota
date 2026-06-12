import { formatProfileRole } from '@/features/settings/utils/format-profile-role';
import { getEnvironmentLabel } from '@/features/settings/utils/get-environment-label';
import { getCurrentStoreDisplayName } from '@/lib/tenant/get-current-store';
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
  storeName: string,
  account: SettingsOverview['account']
): SettingsOverview {
  return {
    store: {
      name: storeName,
      type: 'Sistema interno',
      status: 'Ativo',
      environment: getEnvironmentLabel(),
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
      serviceRole: 'Não utilizada no app',
    },
    about: {
      version: 'MVP interno',
      hosting: 'Vercel',
      database: 'Supabase',
    },
  };
}

export async function getOverview(): Promise<SettingsOverview> {
  const storeName = await getCurrentStoreDisplayName();

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

  return buildOverview(storeName, {
    fullName,
    email,
    roleLabel,
    authProvider: 'Supabase Auth',
    canManageStores: manageStores,
  });
}
