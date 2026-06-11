import type { ProfileRole } from '@/types/database.types';

const ROLE_LABELS: Record<ProfileRole, string> = {
  admin: 'Administrador',
  operator: 'Operador',
};

export function formatProfileRole(role: ProfileRole | null | undefined) {
  if (!role) {
    return ROLE_LABELS.operator;
  }

  return ROLE_LABELS[role] ?? ROLE_LABELS.operator;
}
