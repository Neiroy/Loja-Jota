import type { LucideIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type DashboardCardProps = {
  label: string;
  value: string;
  icon?: LucideIcon;
  className?: string;
};

export function DashboardCard({
  label,
  value,
  icon: Icon,
  className,
}: DashboardCardProps) {
  return (
    <Card
      className={cn('border-stone-200 bg-white shadow-sm ring-0', className)}
    >
      <CardContent className="flex items-start justify-between gap-4 p-6">
        <div className="space-y-2">
          <p className="text-sm text-stone-500">{label}</p>
          <p className="text-3xl font-semibold tracking-tight text-stone-900">
            {value}
          </p>
        </div>
        {Icon ? (
          <div className="rounded-lg bg-stone-100 p-2 text-stone-600">
            <Icon className="size-4" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
