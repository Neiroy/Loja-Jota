import { DetailField } from '@/components/shared/detail-field';
import { FormSection } from '@/components/shared/form-section';
import { CustomerStatusBadge } from '@/features/customers/components/customer-status-badge';
import {
  formatCpfDisplay,
  formatDateTimeBR,
  formatPhoneDisplay,
} from '@/lib/formatters';
import type { Customer } from '@/types/customer.types';

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
          value={formatPhoneDisplay(customer.phone, 'Não informado')}
        />
        <DetailField
          label="CPF"
          value={formatCpfDisplay(customer.cpf, 'Não informado')}
        />
        <DetailField
          label="Cadastrado em"
          value={formatDateTimeBR(customer.created_at)}
        />
        <DetailField
          label="Atualizado em"
          value={formatDateTimeBR(customer.updated_at)}
        />
      </div>

      <DetailField
        label="Observações"
        value={customer.notes?.trim() ? customer.notes : 'Nenhuma observação.'}
      />
    </FormSection>
  );
}
