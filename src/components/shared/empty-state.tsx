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
        'flex flex-col items-center justify-center border-dashed px-6 py-16 text-center sm:py-20',
        className
      )}
    >
      <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-stone-100/90 ring-1 ring-stone-200/60">
        <Icon className="size-6 text-stone-500" />
      </div>
      <h3 className="text-base font-semibold text-stone-900">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-500">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-7">{action}</div> : null}
    </div>
  );
}
