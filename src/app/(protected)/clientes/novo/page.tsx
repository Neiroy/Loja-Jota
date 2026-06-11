import { PageHeader } from '@/components/layout/page-header';
import { CustomerForm } from '@/features/customers/components/customer-form';

export default function NovoClientePage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Novo cliente"
        description="Cadastre um cliente para controle interno e acompanhamento de fiado."
      />
      <div className="max-w-3xl">
        <CustomerForm mode="create" cancelHref="/clientes" />
      </div>
    </div>
  );
}
