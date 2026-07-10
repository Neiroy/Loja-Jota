import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 min-h-28 w-full min-w-0 rounded-lg border border-stone-200/70 bg-white px-3.5 py-3 text-sm text-stone-900 shadow-[inset_0_1px_2px_rgba(28,25,23,0.02)] transition-[border-color,box-shadow] outline-none placeholder:text-stone-400 focus-visible:border-stone-400 focus-visible:ring-2 focus-visible:ring-stone-400/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-2',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
