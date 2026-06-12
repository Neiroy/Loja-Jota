import type { ProfileRole } from '@/types/database.types';

export type SettingsEnvironmentLabel =
  | 'Produção'
  | 'Homologação'
  | 'Desenvolvimento';

export type SettingsOverview = {
  store: {
    name: string;
    type: string;
    status: string;
    environment: SettingsEnvironmentLabel;
  };
  account: {
    fullName: string;
    email: string;
    roleLabel: string;
    authProvider: string;
    canManageStores: boolean;
  };
  preferences: {
    creditTermDays: number;
    currency: string;
    language: string;
    stockControl: string;
  };
  modules: string[];
  security: {
    protectedRoutes: string;
    rls: string;
    users: string;
    serviceRole: string;
  };
  about: {
    version: string;
    hosting: string;
    database: string;
  };
};

export type { ProfileRole };
