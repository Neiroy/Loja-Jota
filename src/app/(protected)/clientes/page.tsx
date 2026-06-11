import Link from 'next/link';
import { Suspense } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ListErrorAlert } from '@/components/shared/list-error-alert';
import { TableSkeleton } from '@/components/shared/table-skeleton';
import { listCustomers } from '@/features/customers/actions/customer.actions';
import { parseListCustomersParams } from '@/features/customers/utils/parse-list-customers-params';
import { CustomersFilters } from '@/features/customers/components/customers-filters';
import { CustomersTable } from '@/features/customers/components/customers-table';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ClientesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ClientesPage({
  searchParams,
}: ClientesPageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = parseListCustomersParams(resolvedSearchParams);
  const { items: customers, error } = await listCustomers(filters);
  const hasFilters = Boolean(filters.search) || filters.status !== 'all';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Cadastro e histórico financeiro dos clientes da loja."
        action={
          <Link href="/clientes/novo" className={cn(buttonVariants())}>
            Novo cliente
          </Link>
        }
      />

      <Suspense fallback={<TableSkeleton columns={5} />}>
        <CustomersFilters
          search={filters.search ?? ''}
          status={filters.status ?? 'all'}
        />
      </Suspense>

      {error ? <ListErrorAlert message={error} /> : null}

      {!error && customers.length === 0 ? (
        hasFilters ? (
          <EmptyState
            title="Nenhum cliente encontrado"
            description="Ajuste a busca ou o filtro de status para ver outros resultados."
          />
        ) : (
          <EmptyState
            title="Nenhum cliente cadastrado"
            description="Cadastre o primeiro cliente para começar o controle interno da loja."
            action={
              <Link href="/clientes/novo" className={cn(buttonVariants())}>
                Cadastrar cliente
              </Link>
            }
          />
        )
      ) : null}

      {!error && customers.length > 0 ? (
        <CustomersTable customers={customers} />
      ) : null}
    </div>
  );
}
