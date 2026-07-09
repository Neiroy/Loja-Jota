import Link from 'next/link';

import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { PaymentMethodBadge } from '@/features/sales/components/payment-method-badge';
import { SalePaymentStatusBadge } from '@/features/sales/components/sale-payment-status-badge';
import { formatSaleDate } from '@/features/sales/utils/format-sale-date';
import { formatProductPrice } from '@/features/products/utils/format-product-price';
import type { RecentSaleRow } from '@/types/dashboard.types';

const columns: DataTableColumn<RecentSaleRow>[] = [
  {
    key: 'customer_name',
    header: 'Cliente',
    cell: (sale) => (
      <span
        className="block max-w-[10rem] truncate font-medium sm:max-w-[14rem] lg:max-w-[12rem]"
        title={sale.customer_name}
      >
        {sale.customer_name}
      </span>
    ),
  },
  {
    key: 'total',
    header: 'Valor',
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
        financingInstallmentsCount={sale.financing_installments_count}
        compact
      />
    ),
  },
  {
    key: 'payment_status',
    header: 'Status',
    cell: (sale) => (
      <SalePaymentStatusBadge status={sale.payment_status} compact />
    ),
  },
  {
    key: 'sale_date',
    header: 'Data',
    cell: (sale) => formatSaleDate(sale.sale_date),
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

type RecentSalesCardProps = {
  sales: RecentSaleRow[];
};

export function RecentSalesCard({ sales }: RecentSalesCardProps) {
  if (sales.length === 0) {
    return (
      <EmptyState
        className="border-0 bg-transparent shadow-none"
        title="Nenhuma venda registrada"
        description="As vendas recentes aparecerão aqui após o primeiro registro."
      />
    );
  }

  return (
    <DataTable
      className="border-0 bg-transparent shadow-none"
      columns={columns}
      data={sales}
      getRowKey={(sale) => sale.id}
      emptyMessage="Nenhuma venda registrada."
    />
  );
}
