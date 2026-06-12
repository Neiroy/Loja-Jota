'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { deleteProductAction } from '@/features/products/actions/product.actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DeleteProductButtonProps = {
  productId: string;
  productName: string;
};

export function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteProductAction(productId);

      if (!result.success) {
        toast.error(result.error ?? 'Não foi possível excluir o produto.');
        return;
      }

      setOpen(false);
      toast.success(`${productName} foi excluído.`);
      router.push('/produtos');
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
        {isPending ? 'Processando...' : 'Excluir produto'}
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Excluir produto?"
        description="Essa ação só será permitida se o produto não possuir vendas vinculadas."
        confirmLabel="Excluir produto"
        destructive
        isConfirming={isPending}
        onConfirm={handleConfirm}
      />
    </>
  );
}
