'use client';

import Link from 'next/link';
import { useState } from 'react';

import { FormSection } from '@/components/shared/form-section';
import { MarkReceivablePaidDialog } from '@/features/receivables/components/mark-receivable-paid-dialog';
import { ReceivableStatusBadge } from '@/features/receivables/components/receivable-status-badge';
import {
  formatReceivableDate,
  formatReceivableDateTime,
} from '@/features/receivables/utils/format-receivable-date';
import { PaymentMethodBadge } from '@/features/sales/components/payment-method-badge';
import { SalePaymentStatusBadge } from '@/features/sales/components/sale-payment-status-badge';
import { formatProductPrice } from '@/features/products/utils/format-product-price';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ReceivableDetail } from '@/types/receivable.types';

type DetailFieldProps = {
  label: string;
  value: React.ReactNode;
};

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">
        {label}
      </p>
      <div className="text-sm text-stone-900">{value}</div>
    </div>
  );
}

type ReceivableDetailCardProps = {
  receivable: ReceivableDetail;
};

export function ReceivableDetailCard({
  receivable,
}: ReceivableDetailCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const canSettle =
    receivable.status === 'open' || receivable.status === 'overdue';

  return (
    <>
      <FormSection
        title="Informações do fiado"
        description="Controle interno de contas a receber com vencimento em 30 dias."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <DetailField
            label="Cliente"
            value={
              <Link
                href={`/clientes/${receivable.customer_id}`}
                className={cn(
                  buttonVariants({ variant: 'link' }),
                  'h-auto p-0 text-sm'
                )}
              >
                {receivable.customer_name}
              </Link>
            }
          />
          <DetailField
            label="Venda vinculada"
            value={
              <Link
                href={`/vendas/${receivable.sale_id}`}
                className={cn(
                  buttonVariants({ variant: 'link' }),
                  'h-auto p-0 text-sm'
                )}
              >
                Venda de {formatReceivableDate(receivable.sale_date)}
              </Link>
            }
          />
          <DetailField
            label="Valor do fiado"
            value={formatProductPrice(receivable.amount)}
          />
          <DetailField
            label="Total da venda"
            value={formatProductPrice(receivable.sale_total)}
          />
          <DetailField
            label="Vencimento"
            value={formatReceivableDate(receivable.due_date)}
          />
          <DetailField
            label="Status do fiado"
            value={<ReceivableStatusBadge status={receivable.status} />}
          />
          <DetailField
            label="Status da venda"
            value={
              <SalePaymentStatusBadge status={receivable.sale_payment_status} />
            }
          />
          {receivable.paid_at ? (
            <DetailField
              label="Quitado em"
              value={formatReceivableDateTime(receivable.paid_at)}
            />
          ) : null}
          {receivable.payment_method ? (
            <DetailField
              label="Forma de quitação"
              value={<PaymentMethodBadge method={receivable.payment_method} />}
            />
          ) : null}
          <DetailField
            label="Registrado em"
            value={formatReceivableDateTime(receivable.created_at)}
          />
        </div>

        {canSettle ? (
          <div className="mt-6 border-t border-stone-100 pt-4">
            <Button type="button" onClick={() => setDialogOpen(true)}>
              Quitar fiado
            </Button>
          </div>
        ) : null}
      </FormSection>

      <MarkReceivablePaidDialog
        receivableId={receivable.id}
        customerName={receivable.customer_name}
        amount={receivable.amount}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
