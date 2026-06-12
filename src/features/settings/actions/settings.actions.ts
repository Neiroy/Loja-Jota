'use server';

import * as settingsService from '@/features/settings/services/settings.service';
import { getEnvironmentLabel } from '@/features/settings/utils/get-environment-label';
import type { SettingsOverview } from '@/types/settings.types';

const FALLBACK_OVERVIEW: SettingsOverview = {
  store: {
    name: 'Loja não identificada',
    type: 'Sistema interno',
    status: 'Ativo',
    environment: 'Desenvolvimento',
    monogram: 'L',
    logoUrl: null,
  },
  account: {
    fullName: 'Usuário',
    email: '—',
    roleLabel: 'Operador',
    authProvider: 'Supabase Auth',
    canManageStores: false,
  },
  preferences: {
    creditTermDays: 30,
    currency: 'Real brasileiro (BRL)',
    language: 'Português (Brasil)',
    stockControl: 'Ativo',
  },
  modules: ['Dashboard', 'Clientes', 'Produtos', 'Vendas', 'Fiados'],
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

export async function getSettingsOverview(): Promise<SettingsOverview> {
  try {
    return await settingsService.getOverview();
  } catch {
    return {
      ...FALLBACK_OVERVIEW,
      store: {
        ...FALLBACK_OVERVIEW.store,
        environment: getEnvironmentLabel(),
      },
    };
  }
}
