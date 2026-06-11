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
        'flex flex-col gap-4 p-5 sm:flex-row sm:items-end',
        className
      )}
      {...props}
    >
      {children}
    </form>
  );
}
