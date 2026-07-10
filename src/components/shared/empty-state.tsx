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
        'flex flex-col items-center justify-center border-dashed border-stone-200/70 px-6 py-16 text-center sm:py-20',
        className
      )}
    >
      <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-stone-100/80 ring-1 ring-stone-200/50">
        <Icon className="size-5 text-stone-500" strokeWidth={1.75} />
      </div>
      <h3 className="text-base font-semibold tracking-tight text-stone-950">
        {title}
      </h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone-500">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
