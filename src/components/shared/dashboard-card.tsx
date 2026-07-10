import type { LucideIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
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
        'h-full border-stone-200/60 shadow-[0_1px_2px_rgba(28,25,23,0.03),0_6px_24px_rgba(28,25,23,0.04)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(28,25,23,0.05),0_12px_28px_rgba(28,25,23,0.06)]',
        className
      )}
    >
      <CardContent className="flex h-full min-h-[8rem] flex-col justify-between gap-4 p-5 sm:p-6 lg:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-medium text-stone-500">{label}</p>
            <p className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl lg:text-[1.875rem] lg:leading-none">
              {value}
            </p>
          </div>
          {Icon ? (
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-stone-100/90 ring-1 ring-stone-200/50">
              <Icon className="size-5 text-stone-600" />
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
