import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/layout/page-header';
import { getSale } from '@/features/sales/actions/sale.actions';
import { SaleDetailCard } from '@/features/sales/components/sale-detail-card';
import { SaleItemsTable } from '@/features/sales/components/sale-items-table';
import { SaleReceivableSummary } from '@/features/sales/components/sale-receivable-summary';
import { formatSaleDate } from '@/features/sales/utils/format-sale-date';

type VendaDetalhePageProps = {
  params: Promise<{ id: string }>;
};

export default async function VendaDetalhePage({
  params,
}: VendaDetalhePageProps) {
  const { id } = await params;
  const sale = await getSale(id);

  if (!sale) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Venda de ${formatSaleDate(sale.sale_date)}`}
        description={`Cliente: ${sale.customer_name}`}
      />
      <SaleDetailCard sale={sale} />
      <SaleItemsTable items={sale.items} />
      <SaleReceivableSummary sale={sale} />
    </div>
  );
}
