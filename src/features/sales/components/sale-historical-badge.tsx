import { badgeBaseClassName } from '@/lib/surface';
import { cn } from '@/lib/utils';

type SaleHistoricalBadgeProps = {
  compact?: boolean;
  className?: string;
};

export function SaleHistoricalBadge({
  compact = false,
  className,
}: SaleHistoricalBadgeProps) {
  return (
    <span
      className={cn(
        badgeBaseClassName,
        'border-stone-300/80 bg-stone-100 text-stone-700',
        className
      )}
    >
      {compact ? 'Hist.' : 'Histórica'}
    </span>
  );
}
