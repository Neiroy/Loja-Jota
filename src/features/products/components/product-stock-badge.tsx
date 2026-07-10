import { LOW_STOCK_THRESHOLD } from '@/features/products/constants/stock';
import { badgeBaseClassName } from '@/lib/surface';
import { cn } from '@/lib/utils';

type StockLevel = 'out' | 'low' | 'ok';

function getStockLevel(quantity: number): StockLevel {
  if (quantity <= 0) {
    return 'out';
  }

  if (quantity <= LOW_STOCK_THRESHOLD) {
    return 'low';
  }

  return 'ok';
}

const stockStyles: Record<StockLevel, string> = {
  out: 'border-red-300/90 bg-red-50 text-red-800',
  low: 'border-amber-300/80 bg-amber-50 text-amber-800',
  ok: 'border-emerald-200/90 bg-emerald-50 text-emerald-800',
};

const stockLabels: Record<StockLevel, string> = {
  out: 'Sem estoque',
  low: 'Estoque baixo',
  ok: 'Em estoque',
};

type ProductStockBadgeProps = {
  quantity: number;
  compact?: boolean;
  className?: string;
};

const compactStockLabels: Record<StockLevel, string> = {
  out: 'Zero',
  low: 'Baixo',
  ok: 'Em estoque',
};

export function ProductStockBadge({
  quantity,
  compact = false,
  className,
}: ProductStockBadgeProps) {
  const level = getStockLevel(quantity);

  if (compact && level === 'ok') {
    return null;
  }

  const label = compact ? compactStockLabels[level] : stockLabels[level];

  return (
    <span className={cn(badgeBaseClassName, stockStyles[level], className)}>
      {label}
    </span>
  );
}
