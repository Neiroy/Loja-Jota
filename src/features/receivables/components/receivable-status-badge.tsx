import { StatusBadge } from '@/components/shared/status-badge';
import type { ReceivableStatus } from '@/types/database.types';

const statusLabels: Record<ReceivableStatus, string> = {
  open: 'Em aberto',
  overdue: 'Vencido',
  paid: 'Pago',
  cancelled: 'Cancelado',
};

type ReceivableStatusBadgeProps = {
  status: ReceivableStatus;
};

export function ReceivableStatusBadge({ status }: ReceivableStatusBadgeProps) {
  return <StatusBadge variant={status} label={statusLabels[status]} />;
}
