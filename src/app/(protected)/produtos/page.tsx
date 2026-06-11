import Link from 'next/link';
import { Suspense } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ListErrorAlert } from '@/components/shared/list-error-alert';
import { TableSkeleton } from '@/components/shared/table-skeleton';
import { listProducts } from '@/features/products/actions/product.actions';
import { ProductsFilters } from '@/features/products/components/products-filters';
import { ProductsTable } from '@/features/products/components/products-table';
import { parseListProductsParams } from '@/features/products/utils/parse-list-products-params';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ProdutosPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProdutosPage({
  searchParams,
}: ProdutosPageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = parseListProductsParams(resolvedSearchParams);
  const { items: products, error } = await listProducts(filters);
  const hasFilters = Boolean(filters.search) || filters.status !== 'all';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos"
        description="Controle de estoque e catálogo interno de produtos."
        action={
          <Link href="/produtos/novo" className={cn(buttonVariants())}>
            Novo produto
          </Link>
        }
      />

      <Suspense fallback={<TableSkeleton columns={6} />}>
        <ProductsFilters
          search={filters.search ?? ''}
          status={filters.status ?? 'all'}
        />
      </Suspense>

      {error ? <ListErrorAlert message={error} /> : null}

      {!error && products.length === 0 ? (
        hasFilters ? (
          <EmptyState
            title="Nenhum produto encontrado"
            description="Ajuste a busca ou o filtro de status para ver outros resultados."
          />
        ) : (
          <EmptyState
            title="Nenhum produto cadastrado"
            description="Cadastre o primeiro produto para começar o controle de estoque."
            action={
              <Link href="/produtos/novo" className={cn(buttonVariants())}>
                Cadastrar produto
              </Link>
            }
          />
        )
      ) : null}

      {!error && products.length > 0 ? (
        <ProductsTable products={products} />
      ) : null}
    </div>
  );
}
