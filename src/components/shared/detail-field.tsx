import type { ReactNode } from 'react';

type DetailFieldProps = {
  label: string;
  value: ReactNode;
  className?: string;
};

export function DetailField({ label, value, className }: DetailFieldProps) {
  return (
    <div className={className}>
      <div className="space-y-1">
        <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">
          {label}
        </p>
        <div className="text-sm text-stone-900">{value}</div>
      </div>
    </div>
  );
}
