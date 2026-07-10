import { badgeBaseClassName } from '@/lib/surface';
import { cn } from '@/lib/utils';
import type { SalePaymentStatus } from '@/types/sale.types';

const statusStyles: Record<SalePaymentStatus, string> = {
  paid: 'border-emerald-200/90 bg-emerald-50 text-emerald-800',
  pending: 'border-amber-300/80 bg-amber-50 text-amber-800',
  partially_paid: 'border-blue-200/90 bg-blue-50 text-blue-800',
  cancelled: 'border-red-200/80 bg-red-50 text-red-700',
};

const statusLabels: Record<SalePaymentStatus, string> = {
  paid: 'Pago',
  pending: 'Pendente',
  partially_paid: 'Parcialmente pago',
  cancelled: 'Cancelado',
};

const compactStatusLabels: Record<SalePaymentStatus, string> = {
  paid: 'Pago',
  pending: 'Pendente',
  partially_paid: 'Parcial',
  cancelled: 'Cancelado',
};

type SalePaymentStatusBadgeProps = {
  status: SalePaymentStatus;
  compact?: boolean;
  className?: string;
};

export function SalePaymentStatusBadge({
  status,
  compact = false,
  className,
}: SalePaymentStatusBadgeProps) {
  const label = compact ? compactStatusLabels[status] : statusLabels[status];
  return (
    <span className={cn(badgeBaseClassName, statusStyles[status], className)}>
      {label}
    </span>
  );
}
