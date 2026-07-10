import {
  getSalePaymentLabel,
  getSalePaymentLabelCompact,
} from '@/features/sales/utils/payment-method-labels';
import { badgeBaseClassName } from '@/lib/surface';
import { cn } from '@/lib/utils';
import type { CardPaymentType, PaymentMethod } from '@/schemas/sale.schema';

const paymentStyles: Record<PaymentMethod, string> = {
  cash: 'border-stone-200/80 bg-stone-100 text-stone-700',
  pix: 'border-stone-300/70 bg-stone-50 text-stone-700',
  card: 'border-stone-300/80 bg-white text-stone-800',
  credit_30_days: 'border-amber-200/80 bg-amber-50 text-amber-800',
};

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
    <span className={cn(badgeBaseClassName, paymentStyles[method], className)}>
      {label}
    </span>
  );
}
