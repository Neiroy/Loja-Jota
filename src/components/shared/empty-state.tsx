import type { LucideIcon } from 'lucide-react';
import { InboxIcon } from 'lucide-react';

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
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-200 bg-white px-6 py-12 text-center shadow-sm',
        className
      )}
    >
      <div className="mb-4 rounded-full bg-stone-100 p-3 text-stone-500">
        <Icon className="size-5" />
      </div>
      <h3 className="text-sm font-medium text-stone-900">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-stone-500">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
