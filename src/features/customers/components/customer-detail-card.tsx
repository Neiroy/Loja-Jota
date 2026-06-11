import { DetailField } from '@/components/shared/detail-field';
import { FormSection } from '@/components/shared/form-section';
import { CustomerStatusBadge } from '@/features/customers/components/customer-status-badge';
import type { Customer } from '@/types/customer.types';

function formatCpf(cpf: string | null) {
  if (!cpf) {
    return 'Não informado';
  }

  if (cpf.length !== 11) {
    return cpf;
  }

  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

type CustomerDetailCardProps = {
  customer: Customer;
};

export function CustomerDetailCard({ customer }: CustomerDetailCardProps) {
  return (
    <FormSection title="Informações do cliente">
      <div className="grid gap-4 sm:grid-cols-2">
        <DetailField label="Nome" value={customer.name} />
        <DetailField
          label="Status"
          value={<CustomerStatusBadge isActive={customer.is_active} />}
        />
        <DetailField
          label="Telefone / WhatsApp"
          value={customer.phone ?? 'Não informado'}
        />
        <DetailField label="CPF" value={formatCpf(customer.cpf)} />
        <DetailField
          label="Cadastrado em"
          value={formatDateTime(customer.created_at)}
        />
        <DetailField
          label="Atualizado em"
          value={formatDateTime(customer.updated_at)}
        />
      </div>

      <DetailField
        label="Observações"
        value={customer.notes?.trim() ? customer.notes : 'Nenhuma observação.'}
      />
    </FormSection>
  );
}
