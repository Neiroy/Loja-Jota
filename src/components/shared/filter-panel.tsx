import type { ComponentProps } from 'react';

import { surfaceCardClassName } from '@/lib/surface';
import { cn } from '@/lib/utils';

type FilterPanelProps = ComponentProps<'form'>;

export function FilterPanel({
  className,
  children,
  ...props
}: FilterPanelProps) {
  return (
    <form
      className={cn(
        surfaceCardClassName,
        'flex flex-col gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-5 sm:p-5 lg:p-6',
        className
      )}
      {...props}
    >
      {children}
    </form>
  );
}
