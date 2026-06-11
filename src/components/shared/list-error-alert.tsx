import { AlertCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

type ListErrorAlertProps = {
  message?: string;
  className?: string;
};

export function ListErrorAlert({
  message = 'Não foi possível carregar os dados. Tente novamente.',
  className,
}: ListErrorAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3.5 text-sm text-red-800',
        className
      )}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" />
      <p>{message}</p>
    </div>
  );
}
