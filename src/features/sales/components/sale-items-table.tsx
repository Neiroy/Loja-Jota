import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { FormSection } from '@/components/shared/form-section';
import { formatProductPrice } from '@/features/products/utils/format-product-price';
import type {
  HistoricalSaleItemRow,
  SaleItemWithProduct,
} from '@/types/sale.types';

function formatProductDetails(item: SaleItemWithProduct) {
  const details = [item.product_category, item.product_size, item.product_color]
    .filter(Boolean)
    .join(' · ');

  return details ? `${item.product_name} (${details})` : item.product_name;
}

const normalColumns: DataTableColumn<SaleItemWithProduct>[] = [
  {
    key: 'product_name',
    header: 'Produto',
    cell: (item) => (
      <span className="font-medium">{formatProductDetails(item)}</span>
    ),
  },
  {
    key: 'quantity',
    header: 'Qtd.',
    cell: (item) => item.quantity,
  },
  {
    key: 'unit_price',
    header: 'Preço unit.',
    cell: (item) => formatProductPrice(item.unit_price),
  },
  {
    key: 'total',
    header: 'Total',
    cell: (item) => formatProductPrice(item.total),
  },
];

const historicalColumns: DataTableColumn<HistoricalSaleItemRow>[] = [
  {
    key: 'description',
    header: 'Produto',
    cell: (item) => <span className="font-medium">{item.description}</span>,
  },
  {
    key: 'quantity',
    header: 'Qtd.',
    cell: (item) => item.quantity,
  },
  {
    key: 'unit_price',
    header: 'Preço unit.',
    cell: (item) => formatProductPrice(item.unit_price),
  },
  {
    key: 'total',
    header: 'Total',
    cell: (item) => formatProductPrice(item.total),
  },
];

type SaleItemsTableProps = {
  items: SaleItemWithProduct[];
  historicalItems?: HistoricalSaleItemRow[];
  isHistorical?: boolean;
};

export function SaleItemsTable({
  items,
  historicalItems = [],
  isHistorical = false,
}: SaleItemsTableProps) {
  if (isHistorical) {
    return (
      <FormSection title="Itens da venda">
        <DataTable
          columns={historicalColumns}
          data={historicalItems}
          getRowKey={(item) => item.id}
          emptyMessage="Venda histórica lançada manualmente, sem produtos vinculados."
        />
      </FormSection>
    );
  }

  return (
    <FormSection title="Itens da venda">
      <DataTable
        columns={normalColumns}
        data={items}
        getRowKey={(item) => item.id}
        emptyMessage="Nenhum item encontrado."
      />
    </FormSection>
  );
}
