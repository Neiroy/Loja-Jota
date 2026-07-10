import Link from 'next/link';
import { Suspense } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ListErrorAlert } from '@/components/shared/list-error-alert';
import { TableSkeleton } from '@/components/shared/table-skeleton';
import { listSales } from '@/features/sales/actions/sale.actions';
import { SalesFilters } from '@/features/sales/components/sales-filters';
import { SalesTable } from '@/features/sales/components/sales-table';
import { parseListSalesParams } from '@/features/sales/utils/parse-list-sales-params';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PaymentMethod } from '@/schemas/sale.schema';

type VendasPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function VendasPage({ searchParams }: VendasPageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = parseListSalesParams(resolvedSearchParams);
  const { items: sales, error } = await listSales(filters);
  const hasFilters =
    Boolean(filters.search) ||
    Boolean(filters.payment_method) ||
    filters.payment_status !== 'all';

  return (
    <div className="page-stack">
      <PageHeader
        title="Vendas"
        description="Registro interno de vendas da loja."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/vendas/lancar-antiga"
              className={cn(buttonVariants({ variant: 'outline' }))}
            >
              Lançar venda antiga
            </Link>
            <Link href="/vendas/nova" className={cn(buttonVariants())}>
              Nova venda
            </Link>
          </div>
        }
      />

      <Suspense fallback={<TableSkeleton columns={6} />}>
        <SalesFilters
          search={filters.search ?? ''}
          paymentMethod={
            (filters.payment_method as PaymentMethod | undefined) ?? 'all'
          }
          paymentStatus={filters.payment_status ?? 'all'}
        />
      </Suspense>

      {error ? <ListErrorAlert message={error} /> : null}

      {!error && sales.length === 0 ? (
        hasFilters ? (
          <EmptyState
            title="Nenhuma venda encontrada"
            description="Ajuste a busca ou os filtros para ver outros resultados."
          />
        ) : (
          <EmptyState
            title="Nenhuma venda registrada"
            description="Registre a primeira venda interna da loja."
            action={
              <Link href="/vendas/nova" className={cn(buttonVariants())}>
                Registrar venda
              </Link>
            }
          />
        )
      ) : null}

      {!error && sales.length > 0 ? <SalesTable sales={sales} /> : null}
    </div>
  );
}
