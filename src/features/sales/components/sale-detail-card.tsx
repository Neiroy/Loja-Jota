import Link from 'next/link';

import { DetailField } from '@/components/shared/detail-field';
import { FormSection } from '@/components/shared/form-section';
import { PaymentMethodBadge } from '@/features/sales/components/payment-method-badge';
import { SalePaymentStatusBadge } from '@/features/sales/components/sale-payment-status-badge';
import { formatSaleDate } from '@/features/sales/utils/format-sale-date';
import { formatProductPrice } from '@/features/products/utils/format-product-price';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SaleDetail } from '@/types/sale.types';

type SaleDetailCardProps = {
  sale: SaleDetail;
};

export function SaleDetailCard({ sale }: SaleDetailCardProps) {
  return (
    <FormSection title="Informações da venda">
      <div className="grid gap-4 sm:grid-cols-2">
        <DetailField
          label="Cliente"
          value={
            <Link
              href={`/clientes/${sale.customer_id}`}
              className={cn(
                buttonVariants({ variant: 'link' }),
                'h-auto p-0 text-sm'
              )}
            >
              {sale.customer_name}
            </Link>
          }
        />
        <DetailField
          label="Data da venda"
          value={formatSaleDate(sale.sale_date)}
        />
        <DetailField
          label="Forma de pagamento"
          value={
            <PaymentMethodBadge
              method={sale.payment_method}
              cardPaymentType={sale.card_payment_type}
              installmentsCount={sale.installments_count}
              financingInstallmentsCount={sale.financing_installments_count}
            />
          }
        />
        <DetailField
          label="Status do pagamento"
          value={<SalePaymentStatusBadge status={sale.payment_status} />}
        />
        {sale.down_payment > 0 ? (
          <DetailField
            label="Entrada"
            value={formatProductPrice(sale.down_payment)}
          />
        ) : null}
        <DetailField
          label="Subtotal"
          value={formatProductPrice(sale.subtotal)}
        />
        <DetailField
          label="Desconto"
          value={formatProductPrice(sale.discount)}
        />
        <DetailField label="Total" value={formatProductPrice(sale.total)} />
        <DetailField
          label="Registrada em"
          value={new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
          }).format(new Date(sale.created_at))}
        />
      </div>
    </FormSection>
  );
}
