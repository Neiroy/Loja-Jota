import { AlertCircle } from 'lucide-react';

type ListErrorAlertProps = {
  message?: string;
};

export function ListErrorAlert({
  message = 'Não foi possível carregar os dados. Tente novamente.',
}: ListErrorAlertProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
