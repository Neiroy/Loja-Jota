import Link from 'next/link';

import { EmptyState } from '@/components/shared/empty-state';
import { FormSection } from '@/components/shared/form-section';
import { formatSaleDate } from '@/features/sales/utils/format-sale-date';
import { formatProductPrice } from '@/features/products/utils/format-product-price';
import { StatusBadge } from '@/components/shared/status-badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SaleDetail } from '@/types/sale.types';

type SaleReceivableSummaryProps = {
  sale: SaleDetail;
};

function mapReceivableStatus(
  status: NonNullable<SaleDetail['receivable']>['status']
) {
  if (status === 'open' || status === 'overdue') {
    return 'open' as const;
  }

  if (status === 'paid') {
    return 'paid' as const;
  }

  return 'cancelled' as const;
}

function getReceivableLabel(
  status: NonNullable<SaleDetail['receivable']>['status']
) {
  if (status === 'open') {
    return 'Em aberto';
  }

  if (status === 'overdue') {
    return 'Vencido';
  }

  if (status === 'paid') {
    return 'Pago';
  }

  return 'Cancelado';
}

export function SaleReceivableSummary({ sale }: SaleReceivableSummaryProps) {
  if (sale.payment_method !== 'credit_30_days') {
    return null;
  }

  if (!sale.receivable) {
    return (
      <FormSection title="Fiado">
        <EmptyState
          title="Recebível não encontrado"
          description="Esta venda fiada deveria ter um recebível associado."
        />
      </FormSection>
    );
  }

  return (
    <FormSection
      title="Fiado"
      description="Conta a receber vinculada a esta venda fiada."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">
            Valor em aberto
          </p>
          <p className="text-sm text-stone-900">
            {formatProductPrice(sale.receivable.amount)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">
            Vencimento
          </p>
          <p className="text-sm text-stone-900">
            {formatSaleDate(sale.receivable.due_date)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">
            Status do fiado
          </p>
          <StatusBadge
            variant={mapReceivableStatus(sale.receivable.status)}
            label={getReceivableLabel(sale.receivable.status)}
          />
        </div>
      </div>

      <div className="mt-4 border-t border-stone-100 pt-4">
        <Link
          href={`/fiados/${sale.receivable.id}`}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          Ver fiado
        </Link>
      </div>
    </FormSection>
  );
}
