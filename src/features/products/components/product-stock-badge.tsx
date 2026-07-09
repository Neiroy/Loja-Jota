import { LOW_STOCK_THRESHOLD } from '@/features/products/constants/stock';
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
  out: 'border-red-200 bg-red-50 text-red-700',
  low: 'border-amber-200 bg-amber-50 text-amber-700',
  ok: 'border-emerald-200 bg-emerald-50 text-emerald-700',
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
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        stockStyles[level],
        className
      )}
    >
      {label}
    </span>
  );
}
