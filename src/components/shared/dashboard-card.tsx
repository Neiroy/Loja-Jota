import type { LucideIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { surfaceCardClassName } from '@/lib/surface';
import { cn } from '@/lib/utils';

type DashboardCardProps = {
  label: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  className?: string;
};

export function DashboardCard({
  label,
  value,
  subtitle,
  icon: Icon,
  className,
}: DashboardCardProps) {
  return (
    <Card
      className={cn(
        surfaceCardClassName,
        'h-full gap-0 py-0 transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-[0_2px_4px_rgba(28,25,23,0.03),0_10px_28px_rgba(28,25,23,0.05)]',
        className
      )}
    >
      <CardContent className="flex h-full min-h-[8rem] flex-col justify-between gap-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2.5">
            <p className="text-[11px] font-medium tracking-[0.08em] text-stone-500 uppercase">
              {label}
            </p>
            <p className="text-[1.65rem] leading-none font-semibold tracking-tight text-stone-950 sm:text-[1.85rem]">
              {value}
            </p>
          </div>
          {Icon ? (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-stone-100/80 ring-1 ring-stone-200/40">
              <Icon
                className="size-[1.125rem] text-stone-500"
                strokeWidth={1.75}
              />
            </div>
          ) : null}
        </div>
        {subtitle ? (
          <p className="text-xs text-stone-500 capitalize">{subtitle}</p>
        ) : (
          <span className="sr-only">Sem detalhe adicional</span>
        )}
      </CardContent>
    </Card>
  );
}
