import Link from 'next/link';

import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { ProductStatusBadge } from '@/features/products/components/product-status-badge';
import { ProductStockBadge } from '@/features/products/components/product-stock-badge';
import { formatProductPrice } from '@/features/products/utils/format-product-price';
import { tableActionLinkClassName } from '@/lib/surface';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product.types';

const columns: DataTableColumn<Product>[] = [
  {
    key: 'name',
    header: 'Nome',
    cell: (product) => (
      <span
        className={cn(
          'block max-w-[10rem] truncate sm:max-w-[14rem] lg:max-w-[12rem]',
          'font-medium',
          product.is_active ? 'text-stone-900' : 'text-stone-500'
        )}
        title={product.name}
      >
        {product.name}
      </span>
    ),
  },
  {
    key: 'category',
    header: 'Categoria',
    className: 'hidden md:table-cell',
    cell: (product) => (
      <span className={product.is_active ? undefined : 'text-stone-500'}>
        {product.category ?? '—'}
      </span>
    ),
  },
  {
    key: 'size',
    header: 'Tamanho',
    className: 'hidden md:table-cell',
    cell: (product) => (
      <span className={product.is_active ? undefined : 'text-stone-500'}>
        {product.size ?? '—'}
      </span>
    ),
  },
  {
    key: 'color',
    header: 'Cor',
    className: 'hidden md:table-cell',
    cell: (product) => (
      <span className={product.is_active ? undefined : 'text-stone-500'}>
        {product.color ?? '—'}
      </span>
    ),
  },
  {
    key: 'sale_price',
    header: 'Preço',
    cell: (product) => (
      <span className={product.is_active ? undefined : 'text-stone-500'}>
        {formatProductPrice(product.sale_price)}
      </span>
    ),
  },
  {
    key: 'stock_quantity',
    header: 'Estoque',
    cell: (product) => (
      <div className="flex items-center gap-2">
        <span className={product.is_active ? undefined : 'text-stone-500'}>
          {product.stock_quantity}
        </span>
        <ProductStockBadge quantity={product.stock_quantity} compact />
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    cell: (product) => <ProductStatusBadge isActive={product.is_active} />,
  },
  {
    key: 'actions',
    header: '',
    className: 'text-right',
    cell: (product) => (
      <Link
        href={`/produtos/${product.id}`}
        className={tableActionLinkClassName}
      >
        Ver detalhes
      </Link>
    ),
  },
];

type ProductsTableProps = {
  products: Product[];
  emptyMessage?: string;
};

export function ProductsTable({
  products,
  emptyMessage = 'Nenhum produto encontrado.',
}: ProductsTableProps) {
  return (
    <DataTable
      columns={columns}
      data={products}
      getRowKey={(product) => product.id}
      emptyMessage={emptyMessage}
    />
  );
}
