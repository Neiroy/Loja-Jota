import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 min-h-24 w-full min-w-0 rounded-lg border border-stone-200/80 bg-white px-3 py-2.5 text-sm text-stone-900 transition-colors outline-none placeholder:text-stone-400 focus-visible:border-stone-400 focus-visible:ring-2 focus-visible:ring-stone-400/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-2',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
