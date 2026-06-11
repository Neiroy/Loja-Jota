import type { LucideIcon } from 'lucide-react';
import { InboxIcon } from 'lucide-react';

import { surfaceCardClassName } from '@/lib/surface';
import { cn } from '@/lib/utils';

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon: Icon = InboxIcon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        surfaceCardClassName,
        'flex flex-col items-center justify-center border-dashed px-6 py-14 text-center',
        className
      )}
    >
      <div className="mb-4 rounded-full bg-stone-100/80 p-3.5 text-stone-500">
        <Icon className="size-5" />
      </div>
      <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm text-stone-500">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
