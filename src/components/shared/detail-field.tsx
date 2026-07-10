import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type DetailFieldProps = {
  label: string;
  value: ReactNode;
  className?: string;
};

export function DetailField({ label, value, className }: DetailFieldProps) {
  return (
    <div className={className}>
      <div className="space-y-1.5">
        <p
          className={cn(
            'text-[10.5px] font-medium tracking-[0.08em] text-stone-500 uppercase'
          )}
        >
          {label}
        </p>
        <div className="min-w-0 text-sm leading-relaxed break-words text-stone-900">
          {value}
        </div>
      </div>
    </div>
  );
}
