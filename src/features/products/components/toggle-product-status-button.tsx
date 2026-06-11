'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { setProductStatusAction } from '@/features/products/actions/product.actions';
import { Button } from '@/components/ui/button';

type ToggleProductStatusButtonProps = {
  productId: string;
  isActive: boolean;
  productName: string;
};

export function ToggleProductStatusButton({
  productId,
  isActive,
  productName,
}: ToggleProductStatusButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);

    startTransition(async () => {
      const result = await setProductStatusAction(productId, !isActive);

      if (!result.success) {
        const message = result.error ?? 'Não foi possível alterar o status.';
        setError(message);
        toast.error(message);
        return;
      }

      setOpen(false);
      toast.success(
        isActive
          ? `${productName} foi inativado.`
          : `${productName} foi reativado.`
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
            ? 'Inativar produto'
            : 'Reativar produto'}
      </Button>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={isActive ? 'Inativar produto' : 'Reativar produto'}
        description={
          isActive
            ? `${productName} não poderá ser usado em novas vendas enquanto estiver inativo.`
            : `${productName} voltará a ficar disponível para novas vendas.`
        }
        confirmLabel={isActive ? 'Inativar' : 'Reativar'}
        destructive={isActive}
        isConfirming={isPending}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
