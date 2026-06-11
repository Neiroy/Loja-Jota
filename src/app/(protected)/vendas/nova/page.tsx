import Link from 'next/link';

import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ListErrorAlert } from '@/components/shared/list-error-alert';
import { listCustomers } from '@/features/customers/actions/customer.actions';
import { listProducts } from '@/features/products/actions/product.actions';
import { SaleForm } from '@/features/sales/components/sale-form';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default async function NovaVendaPage() {
  const [customersResult, productsResult] = await Promise.all([
    listCustomers({ status: 'active' }),
    listProducts({ status: 'active' }),
  ]);

  const loadError = customersResult.error ?? productsResult.error;
  const customers = customersResult.items;
  const products = productsResult.items;
  const missingPrerequisites =
    !loadError && (customers.length === 0 || products.length === 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova venda"
        description="Registre uma venda interna com cliente, itens, desconto e forma de pagamento."
      />

      {loadError ? <ListErrorAlert message={loadError} /> : null}

      {missingPrerequisites ? (
        <EmptyState
          title="Cadastros necessários"
          description={
            customers.length === 0 && products.length === 0
              ? 'Cadastre pelo menos um cliente ativo e um produto ativo antes de registrar uma venda.'
              : customers.length === 0
                ? 'Cadastre pelo menos um cliente ativo antes de registrar uma venda.'
                : 'Cadastre pelo menos um produto ativo antes de registrar uma venda.'
          }
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              {customers.length === 0 ? (
                <Link href="/clientes/novo" className={cn(buttonVariants())}>
                  Cadastrar cliente
                </Link>
              ) : null}
              {products.length === 0 ? (
                <Link href="/produtos/novo" className={cn(buttonVariants())}>
                  Cadastrar produto
                </Link>
              ) : null}
            </div>
          }
        />
      ) : null}

      {!loadError && !missingPrerequisites ? (
        <SaleForm customers={customers} products={products} />
      ) : null}
    </div>
  );
}
