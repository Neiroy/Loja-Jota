'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { setCustomerStatusAction } from '@/features/customers/actions/customer.actions';
import { Button } from '@/components/ui/button';

type ToggleCustomerStatusButtonProps = {
  customerId: string;
  isActive: boolean;
  customerName: string;
};

export function ToggleCustomerStatusButton({
  customerId,
  isActive,
  customerName,
}: ToggleCustomerStatusButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);

    startTransition(async () => {
      const result = await setCustomerStatusAction(customerId, !isActive);

      if (!result.success) {
        const message = result.error ?? 'Não foi possível alterar o status.';
        setError(message);
        toast.error(message);
        return;
      }

      setOpen(false);
      toast.success(
        isActive
          ? `${customerName} foi inativado.`
          : `${customerName} foi reativado.`
      );
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={isActive ? 'outline' : 'default'}
        onClick={() => setOpen(true)}
        disabled={isPending}
      >
        {isPending
          ? 'Processando...'
          : isActive
            ? 'Inativar cliente'
            : 'Reativar cliente'}
      </Button>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={isActive ? 'Inativar cliente' : 'Reativar cliente'}
        description={
          isActive
            ? `${customerName} deixará de receber novas vendas enquanto estiver inativo. O histórico será mantido.`
            : `${customerName} voltará a ficar disponível para novas vendas.`
        }
        confirmLabel={isActive ? 'Inativar' : 'Reativar'}
        destructive={isActive}
        isConfirming={isPending}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
