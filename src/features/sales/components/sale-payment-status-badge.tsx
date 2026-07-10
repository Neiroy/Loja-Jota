import { badgeBaseClassName } from '@/lib/surface';
import { cn } from '@/lib/utils';
import type { SalePaymentStatus } from '@/types/sale.types';

const statusStyles: Record<SalePaymentStatus, string> = {
  paid: 'border-emerald-200/80 bg-emerald-50 text-emerald-800',
  pending: 'border-amber-200/80 bg-amber-50 text-amber-800',
  partially_paid: 'border-stone-300/80 bg-stone-100 text-stone-700',
  cancelled: 'border-stone-200/80 bg-stone-100 text-stone-600',
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
