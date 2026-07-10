import Link from 'next/link';

import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ListErrorAlert } from '@/components/shared/list-error-alert';
import { listCustomers } from '@/features/customers/actions/customer.actions';
import { listProducts } from '@/features/products/actions/product.actions';
import { HistoricalSaleForm } from '@/features/sales/components/historical-sale-form';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default async function LancarVendaAntigaPage() {
  const [
    { items: customers, error: customersError },
    { items: products, error: productsError },
  ] = await Promise.all([
    listCustomers({ status: 'active' }),
    listProducts({ status: 'active' }),
  ]);

  const error = customersError ?? productsError;
  const missingCustomers = !error && customers.length === 0;

  return (
    <div className="page-stack">
      <PageHeader
        title="Lançar venda antiga"
        description="Registre vendas do caderno com saldo a receber. Produtos são opcionais e não alteram o estoque."
      />

      {error ? <ListErrorAlert message={error} /> : null}

      {missingCustomers ? (
        <EmptyState
          title="Cliente necessário"
          description="Cadastre pelo menos um cliente ativo antes de lançar uma venda antiga."
          action={
            <Link href="/clientes/novo" className={cn(buttonVariants())}>
              Cadastrar cliente
            </Link>
          }
        />
      ) : null}

      {!error && !missingCustomers ? (
        <HistoricalSaleForm customers={customers} products={products} />
      ) : null}
    </div>
  );
}
