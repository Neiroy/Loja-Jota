import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/layout/page-header';
import { getCustomer } from '@/features/customers/actions/customer.actions';
import { CustomerDetailCard } from '@/features/customers/components/customer-detail-card';
import { CustomerFinancialPlaceholder } from '@/features/customers/components/customer-financial-placeholder';
import { ToggleCustomerStatusButton } from '@/features/customers/components/toggle-customer-status-button';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ClienteDetalhePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClienteDetalhePage({
  params,
}: ClienteDetalhePageProps) {
  const { id } = await params;
  const customer = await getCustomer(id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.name}
        description="Detalhes do cliente e histórico financeiro."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={`/clientes/${customer.id}/editar`}
              className={cn(buttonVariants({ variant: 'outline' }))}
            >
              Editar
            </Link>
            <ToggleCustomerStatusButton
              customerId={customer.id}
              isActive={customer.is_active}
              customerName={customer.name}
            />
          </div>
        }
      />

      <CustomerDetailCard customer={customer} />
      <CustomerFinancialPlaceholder />
    </div>
  );
}
