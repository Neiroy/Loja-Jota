import type { SettingsEnvironmentLabel } from '@/types/settings.types';

export function getEnvironmentLabel(): SettingsEnvironmentLabel {
  const vercelEnv = process.env.VERCEL_ENV;

  if (vercelEnv === 'production') {
    return 'Produção';
  }

  if (vercelEnv === 'preview') {
    return 'Homologação';
  }

  if (process.env.NODE_ENV === 'production') {
    return 'Produção';
  }

  return 'Desenvolvimento';
}
