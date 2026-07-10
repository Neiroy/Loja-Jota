import { cva, type VariantProps } from 'class-variance-authority';

import { badgeBaseClassName } from '@/lib/surface';
import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(badgeBaseClassName, {
  variants: {
    variant: {
      paid: 'border-emerald-200/90 bg-emerald-50 text-emerald-800',
      open: 'border-orange-200/90 bg-orange-50 text-orange-800',
      overdue: 'border-red-300/90 bg-red-50 text-red-800',
      cancelled: 'border-red-200/70 bg-red-50/80 text-red-700',
    },
  },
  defaultVariants: {
    variant: 'open',
  },
});

const statusLabels = {
  paid: 'Pago',
  open: 'Em aberto',
  overdue: 'Vencido',
  cancelled: 'Cancelado',
} as const;

export type StatusBadgeVariant = keyof typeof statusLabels;

type StatusBadgeProps = {
  variant: StatusBadgeVariant;
  label?: string;
  className?: string;
} & VariantProps<typeof statusBadgeVariants>;

export function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ variant }), className)}>
      {label ?? statusLabels[variant]}
    </span>
  );
}
