import { PageHeader } from '@/components/layout/page-header';
import { CustomerForm } from '@/features/customers/components/customer-form';

export default function NovoClientePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo cliente"
        description="Cadastre um cliente para controle interno e acompanhamento de fiado."
      />
      <CustomerForm mode="create" cancelHref="/clientes" />
    </div>
  );
}
