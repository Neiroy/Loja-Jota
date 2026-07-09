import Link from 'next/link';

import { FormSection } from '@/components/shared/form-section';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { ReceivableStatusBadge } from '@/features/receivables/components/receivable-status-badge';
import { formatSaleDate } from '@/features/sales/utils/format-sale-date';
import { formatProductPrice } from '@/features/products/utils/format-product-price';
import type { SaleDetail } from '@/types/sale.types';

type SaleReceivableSummaryProps = {
  sale: SaleDetail;
};

const columns: DataTableColumn<SaleDetail['receivables'][number]>[] = [
  {
    key: 'installment',
    header: 'Parcela',
    cell: (receivable) =>
      receivable.installments_total > 1
        ? `${receivable.installment_number}/${receivable.installments_total}`
        : 'Única',
  },
  {
    key: 'amount',
    header: 'Valor',
    cell: (receivable) => formatProductPrice(receivable.amount),
  },
  {
    key: 'due_date',
    header: 'Vencimento',
    cell: (receivable) => formatSaleDate(receivable.due_date),
  },
  {
    key: 'status',
    header: 'Status',
    cell: (receivable) => <ReceivableStatusBadge status={receivable.status} />,
  },
  {
    key: 'actions',
    header: '',
    className: 'text-right',
    cell: (receivable) => (
      <Link
        href={`/fiados/${receivable.id}`}
        className="text-sm font-medium text-stone-700 hover:text-stone-900 hover:underline"
      >
        Ver fiado
      </Link>
    ),
  },
];

export function SaleReceivableSummary({ sale }: SaleReceivableSummaryProps) {
  if (sale.receivables.length === 0) {
    return null;
  }

  const title =
    sale.payment_method === 'credit_30_days' ? 'Fiado' : 'Parcelas a receber';

  const description =
    sale.payment_method === 'credit_30_days'
      ? 'Conta a receber vinculada a esta venda fiada.'
      : 'Parcelas geradas para esta venda parcelada.';

  return (
    <FormSection title={title} description={description}>
      {sale.down_payment > 0 ? (
        <p className="mb-4 text-sm text-stone-600">
          Entrada registrada: {formatProductPrice(sale.down_payment)}
        </p>
      ) : null}

      <DataTable
        className="border-0 bg-transparent shadow-none"
        columns={columns}
        data={sale.receivables}
        getRowKey={(receivable) => receivable.id}
        emptyMessage="Nenhuma parcela encontrada."
      />
    </FormSection>
  );
}
