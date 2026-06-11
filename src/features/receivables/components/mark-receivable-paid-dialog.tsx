'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { markReceivablePaidAction } from '@/features/receivables/actions/receivable.actions';
import { PAYMENT_METHOD_LABELS } from '@/features/sales/utils/payment-method-labels';
import { formatProductPrice } from '@/features/products/utils/format-product-price';
import type { ReceivableSettlementMethod } from '@/schemas/receivable.schema';

const SETTLEMENT_OPTIONS: ReceivableSettlementMethod[] = [
  'cash',
  'pix',
  'card',
];

type MarkReceivablePaidDialogProps = {
  receivableId: string;
  customerName: string;
  amount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MarkReceivablePaidDialog({
  receivableId,
  customerName,
  amount,
  open,
  onOpenChange,
}: MarkReceivablePaidDialogProps) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] =
    useState<ReceivableSettlementMethod>('pix');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);

    startTransition(async () => {
      const result = await markReceivablePaidAction({
        receivable_id: receivableId,
        payment_method: paymentMethod,
      });

      if (!result.success) {
        const message = result.error ?? 'Não foi possível quitar o fiado.';
        setError(message);
        toast.error(message);
        return;
      }

      onOpenChange(false);
      toast.success(`Fiado de ${customerName} quitado com sucesso.`);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quitar fiado</DialogTitle>
          <DialogDescription>
            Registrar quitação de {formatProductPrice(amount)} para{' '}
            {customerName}. O estoque não será alterado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label>Forma de pagamento da quitação *</Label>
          <div className="grid gap-2">
            {SETTLEMENT_OPTIONS.map((method) => (
              <label
                key={method}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm"
              >
                <input
                  type="radio"
                  name="settlement_payment_method"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={() => setPaymentMethod(method)}
                  disabled={isPending}
                  className="size-4"
                />
                <span>{PAYMENT_METHOD_LABELS[method]}</span>
              </label>
            ))}
          </div>
        </div>

        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isPending}>
            {isPending ? 'Quitando...' : 'Confirmar quitação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
