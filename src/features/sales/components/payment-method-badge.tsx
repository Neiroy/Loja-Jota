import {
  getSalePaymentLabel,
  getSalePaymentLabelCompact,
} from '@/features/sales/utils/payment-method-labels';
import { badgeBaseClassName } from '@/lib/surface';
import { cn } from '@/lib/utils';
import type { CardPaymentType, PaymentMethod } from '@/schemas/sale.schema';

const paymentMethodStyles: Record<PaymentMethod, string> = {
  cash: 'border-emerald-200/90 bg-emerald-50 text-emerald-800',
  pix: 'border-sky-300/80 bg-sky-50 text-sky-800',
  card: 'border-stone-300/80 bg-stone-50 text-stone-700',
  credit_30_days: 'border-orange-200/90 bg-orange-50 text-orange-800',
};

const cardPaymentStyles: Record<CardPaymentType, string> = {
  credit: 'border-violet-200/90 bg-violet-50 text-violet-800',
  debit: 'border-indigo-200/90 bg-indigo-50 text-indigo-800',
};

function getPaymentStyle(
  method: PaymentMethod,
  cardPaymentType: CardPaymentType | null
) {
  if (method === 'card' && cardPaymentType) {
    return cardPaymentStyles[cardPaymentType];
  }

  return paymentMethodStyles[method];
}

type PaymentMethodBadgeProps = {
  method: PaymentMethod;
  cardPaymentType?: CardPaymentType | null;
  installmentsCount?: number | null;
  financingInstallmentsCount?: number | null;
  compact?: boolean;
  className?: string;
};

export function PaymentMethodBadge({
  method,
  cardPaymentType = null,
  installmentsCount = null,
  financingInstallmentsCount = null,
  compact = false,
  className,
}: PaymentMethodBadgeProps) {
  const payment = {
    payment_method: method,
    card_payment_type: cardPaymentType,
    installments_count: installmentsCount,
    financing_installments_count: financingInstallmentsCount,
  };
  const label = compact
    ? getSalePaymentLabelCompact(payment)
    : getSalePaymentLabel(payment);

  return (
    <span
      className={cn(
        badgeBaseClassName,
        getPaymentStyle(method, cardPaymentType),
        className
      )}
    >
      {label}
    </span>
  );
}
