import { cn } from '@/lib/utils';
import type { SalePaymentStatus } from '@/types/sale.types';

const statusStyles: Record<SalePaymentStatus, string> = {
  paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  cancelled: 'border-stone-200 bg-stone-100 text-stone-600',
};

const statusLabels: Record<SalePaymentStatus, string> = {
  paid: 'Pago',
  pending: 'Pendente',
  cancelled: 'Cancelado',
};

type SalePaymentStatusBadgeProps = {
  status: SalePaymentStatus;
  className?: string;
};

export function SalePaymentStatusBadge({
  status,
  className,
}: SalePaymentStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
