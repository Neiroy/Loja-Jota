import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/layout/page-header';
import { getCustomer } from '@/features/customers/actions/customer.actions';
import { CustomerForm } from '@/features/customers/components/customer-form';

type EditarClientePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarClientePage({
  params,
}: EditarClientePageProps) {
  const { id } = await params;
  const customer = await getCustomer(id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar cliente"
        description={`Atualize os dados de ${customer.name}.`}
      />
      <CustomerForm
        mode="edit"
        customer={customer}
        cancelHref={`/clientes/${customer.id}`}
      />
    </div>
  );
}
