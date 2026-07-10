import { badgeBaseClassName } from '@/lib/surface';
import { cn } from '@/lib/utils';

type ProductStatusBadgeProps = {
  isActive: boolean;
  className?: string;
};

export function ProductStatusBadge({
  isActive,
  className,
}: ProductStatusBadgeProps) {
  return (
    <span
      className={cn(
        badgeBaseClassName,
        isActive
          ? 'border-emerald-200/90 bg-emerald-50 text-emerald-800'
          : 'border-stone-300/80 bg-stone-100 text-stone-600',
        className
      )}
    >
      {isActive ? 'Ativo' : 'Inativo'}
    </span>
  );
}
