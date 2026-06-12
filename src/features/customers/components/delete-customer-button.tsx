'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { deleteCustomerAction } from '@/features/customers/actions/customer.actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DeleteCustomerButtonProps = {
  customerId: string;
  customerName: string;
};

export function DeleteCustomerButton({
  customerId,
  customerName,
}: DeleteCustomerButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteCustomerAction(customerId);

      if (!result.success) {
        toast.error(result.error ?? 'Não foi possível excluir o cliente.');
        return;
      }

      setOpen(false);
      toast.success(`${customerName} foi excluído.`);
      router.push('/clientes');
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
        {isPending ? 'Processando...' : 'Excluir cliente'}
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Excluir cliente?"
        description="Essa ação só será permitida se o cliente não possuir vendas ou fiados vinculados."
        confirmLabel="Excluir cliente"
        destructive
        isConfirming={isPending}
        onConfirm={handleConfirm}
      />
    </>
  );
}
