import Link from 'next/link';

import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { ReceivableStatusBadge } from '@/features/receivables/components/receivable-status-badge';
import { formatReceivableDate } from '@/features/receivables/utils/format-receivable-date';
import { formatProductPrice } from '@/features/products/utils/format-product-price';
import type { ReceivableListRow } from '@/types/receivable.types';

const columns: DataTableColumn<ReceivableListRow>[] = [
  {
    key: 'customer_name',
    header: 'Cliente',
    cell: (receivable) => (
      <span
        className="block max-w-[10rem] truncate font-medium sm:max-w-[14rem] lg:max-w-[12rem]"
        title={receivable.customer_name}
      >
        {receivable.customer_name}
      </span>
    ),
  },
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
    cell: (receivable) => formatReceivableDate(receivable.due_date),
  },
  {
    key: 'status',
    header: 'Status',
    cell: (receivable) => <ReceivableStatusBadge status={receivable.status} />,
  },
  {
    key: 'sale_date',
    header: 'Venda',
    className: 'hidden md:table-cell',
    cell: (receivable) => formatReceivableDate(receivable.sale_date),
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

type ReceivablesTableProps = {
  receivables: ReceivableListRow[];
  emptyMessage?: string;
};

export function ReceivablesTable({
  receivables,
  emptyMessage = 'Nenhum fiado encontrado.',
}: ReceivablesTableProps) {
  return (
    <DataTable
      columns={columns}
      data={receivables}
      getRowKey={(receivable) => receivable.id}
      emptyMessage={emptyMessage}
    />
  );
}
