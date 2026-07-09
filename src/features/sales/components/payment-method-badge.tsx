import { getSalePaymentLabel } from '@/features/sales/utils/payment-method-labels';
import { cn } from '@/lib/utils';
import type { CardPaymentType, PaymentMethod } from '@/schemas/sale.schema';

const paymentStyles: Record<PaymentMethod, string> = {
  cash: 'border-stone-200/80 bg-stone-100 text-stone-700',
  pix: 'border-sky-200 bg-sky-50 text-sky-700',
  card: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  credit_30_days: 'border-amber-200 bg-amber-50 text-amber-700',
};

type PaymentMethodBadgeProps = {
  method: PaymentMethod;
  cardPaymentType?: CardPaymentType | null;
  installmentsCount?: number | null;
  financingInstallmentsCount?: number | null;
  className?: string;
};

export function PaymentMethodBadge({
  method,
  cardPaymentType = null,
  installmentsCount = null,
  financingInstallmentsCount = null,
  className,
}: PaymentMethodBadgeProps) {
  const label = getSalePaymentLabel({
    payment_method: method,
    card_payment_type: cardPaymentType,
    installments_count: installmentsCount,
    financing_installments_count: financingInstallmentsCount,
  });

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        paymentStyles[method],
        className
      )}
    >
      {label}
    </span>
  );
}
