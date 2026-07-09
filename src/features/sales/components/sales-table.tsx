import Link from 'next/link';

import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { PaymentMethodBadge } from '@/features/sales/components/payment-method-badge';
import { SalePaymentStatusBadge } from '@/features/sales/components/sale-payment-status-badge';
import { formatSaleDate } from '@/features/sales/utils/format-sale-date';
import { formatProductPrice } from '@/features/products/utils/format-product-price';
import type { SaleListRow } from '@/types/sale.types';

const columns: DataTableColumn<SaleListRow>[] = [
  {
    key: 'sale_date',
    header: 'Data',
    cell: (sale) => formatSaleDate(sale.sale_date),
  },
  {
    key: 'customer_name',
    header: 'Cliente',
    cell: (sale) => <span className="font-medium">{sale.customer_name}</span>,
  },
  {
    key: 'total',
    header: 'Total',
    cell: (sale) => formatProductPrice(sale.total),
  },
  {
    key: 'payment_method',
    header: 'Pagamento',
    cell: (sale) => (
      <PaymentMethodBadge
        method={sale.payment_method}
        cardPaymentType={sale.card_payment_type}
        installmentsCount={sale.installments_count}
      />
    ),
  },
  {
    key: 'payment_status',
    header: 'Status',
    cell: (sale) => <SalePaymentStatusBadge status={sale.payment_status} />,
  },
  {
    key: 'actions',
    header: '',
    className: 'text-right',
    cell: (sale) => (
      <Link
        href={`/vendas/${sale.id}`}
        className="text-sm font-medium text-stone-700 hover:text-stone-900 hover:underline"
      >
        Ver detalhes
      </Link>
    ),
  },
];

type SalesTableProps = {
  sales: SaleListRow[];
  emptyMessage?: string;
};

export function SalesTable({
  sales,
  emptyMessage = 'Nenhuma venda encontrada.',
}: SalesTableProps) {
  return (
    <DataTable
      columns={columns}
      data={sales}
      getRowKey={(sale) => sale.id}
      emptyMessage={emptyMessage}
    />
  );
}
