import { cn } from '@/lib/utils';

type CustomerStatusBadgeProps = {
  isActive: boolean;
  className?: string;
};

export function CustomerStatusBadge({
  isActive,
  className,
}: CustomerStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        isActive
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-stone-200/80 bg-stone-100 text-stone-600',
        className
      )}
    >
      {isActive ? 'Ativo' : 'Inativo'}
    </span>
  );
}
