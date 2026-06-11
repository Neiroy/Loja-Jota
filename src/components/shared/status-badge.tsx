import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        open: 'border-amber-200 bg-amber-50 text-amber-700',
        overdue: 'border-red-200 bg-red-50 text-red-700',
        cancelled: 'border-stone-200 bg-stone-100 text-stone-600',
      },
    },
    defaultVariants: {
      variant: 'open',
    },
  }
);

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
