import Link from 'next/link';
import { Suspense } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ListErrorAlert } from '@/components/shared/list-error-alert';
import { TableSkeleton } from '@/components/shared/table-skeleton';
import { listReceivables } from '@/features/receivables/actions/receivable.actions';
import { ReceivablesFilters } from '@/features/receivables/components/receivables-filters';
import { ReceivablesTable } from '@/features/receivables/components/receivables-table';
import { parseListReceivablesParams } from '@/features/receivables/utils/parse-list-receivables-params';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type FiadosPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FiadosPage({ searchParams }: FiadosPageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = parseListReceivablesParams(resolvedSearchParams);
  const { items: receivables, error } = await listReceivables(filters);
  const hasFilters =
    Boolean(filters.search) || (filters.status ?? 'all') !== 'all';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fiados"
        description="Controle de contas a receber com vencimento em 30 dias."
      />

      <Suspense fallback={<TableSkeleton columns={5} />}>
        <ReceivablesFilters
          search={filters.search ?? ''}
          status={filters.status ?? 'all'}
        />
      </Suspense>

      {error ? <ListErrorAlert message={error} /> : null}

      {!error && receivables.length === 0 ? (
        <EmptyState
          title={
            hasFilters ? 'Nenhum fiado encontrado' : 'Nenhum fiado registrado'
          }
          description={
            hasFilters
              ? 'Ajuste a busca ou os filtros para ver outros resultados.'
              : 'Fiados são criados automaticamente em vendas com pagamento em 30 dias.'
          }
          action={
            hasFilters ? undefined : (
              <Link href="/vendas/nova" className={cn(buttonVariants())}>
                Registrar venda fiada
              </Link>
            )
          }
        />
      ) : null}

      {!error && receivables.length > 0 ? (
        <ReceivablesTable receivables={receivables} />
      ) : null}
    </div>
  );
}
