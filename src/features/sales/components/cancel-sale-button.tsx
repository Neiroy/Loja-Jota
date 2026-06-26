'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { cancelSaleAction } from '@/features/sales/actions/sale.actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CancelSaleButtonProps = {
  saleId: string;
};

export function CancelSaleButton({ saleId }: CancelSaleButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);

    startTransition(async () => {
      const result = await cancelSaleAction(saleId);

      if (!result.success) {
        const message = result.error ?? 'Não foi possível cancelar a venda.';
        setError(message);
        toast.error(message);
        return;
      }

      setOpen(false);
      toast.success('Venda cancelada com sucesso.');
      router.refresh();
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        disabled={isPending}
        className={cn(
          'text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5'
        )}
      >
        {isPending ? 'Processando...' : 'Cancelar venda'}
      </Button>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <ConfirmDialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!isPending) {
            setOpen(nextOpen);
            if (!nextOpen) {
              setError(null);
            }
          }
        }}
        title="Cancelar venda?"
        description="Tem certeza que deseja cancelar esta venda? O estoque dos produtos será devolvido e o histórico será mantido."
        confirmLabel="Cancelar venda"
        destructive
        isConfirming={isPending}
        onConfirm={handleConfirm}
      />
    </>
  );
}
