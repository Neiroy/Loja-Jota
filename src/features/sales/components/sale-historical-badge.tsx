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
        'border-purple-200/90 bg-purple-50 text-purple-800',
        className
      )}
    >
      {compact ? 'Hist.' : 'Histórica'}
    </span>
  );
}
