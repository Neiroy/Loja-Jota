import Link from 'next/link';

import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { ReceivableStatusBadge } from '@/features/receivables/components/receivable-status-badge';
import { formatReceivableDate } from '@/features/receivables/utils/format-receivable-date';
import { formatProductPrice } from '@/features/products/utils/format-product-price';
import type { UpcomingReceivableRow } from '@/types/dashboard.types';

const columns: DataTableColumn<UpcomingReceivableRow>[] = [
  {
    key: 'customer_name',
    header: 'Cliente',
    cell: (receivable) => (
      <span className="font-medium">{receivable.customer_name}</span>
    ),
  },
  {
    key: 'amount',
    header: 'Valor',
    cell: (receivable) => formatProductPrice(receivable.amount),
  },
  {
    key: 'due_date',
    header: 'Vencimento',
    cell: (receivable) => formatReceivableDate(receivable.due_date),
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
        Ver detalhes
      </Link>
    ),
  },
];

type UpcomingReceivablesCardProps = {
  receivables: UpcomingReceivableRow[];
};

export function UpcomingReceivablesCard({
  receivables,
}: UpcomingReceivablesCardProps) {
  if (receivables.length === 0) {
    return (
      <EmptyState
        className="border-0 bg-transparent shadow-none"
        title="Nenhum fiado próximo do vencimento"
        description="Não há fiados em aberto vencendo nos próximos 7 dias."
      />
    );
  }

  return (
    <DataTable
      className="border-0 bg-transparent shadow-none"
      columns={columns}
      data={receivables}
      getRowKey={(receivable) => receivable.id}
      emptyMessage="Nenhum fiado próximo do vencimento."
    />
  );
}
