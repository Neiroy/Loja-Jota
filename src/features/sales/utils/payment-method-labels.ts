import { formatProductPrice } from '@/features/products/utils/format-product-price';
import type { CardPaymentType, PaymentMethod } from '@/schemas/sale.schema';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Dinheiro',
  pix: 'Pix',
  card: 'Cartão',
  credit_30_days: 'Fiado 30 dias',
};

export type SalePaymentDisplay = {
  payment_method: PaymentMethod;
  card_payment_type?: CardPaymentType | null;
  installments_count?: number | null;
};

export function getPaymentMethodLabel(method: PaymentMethod) {
  return PAYMENT_METHOD_LABELS[method];
}

export function getSalePaymentLabel(payment: SalePaymentDisplay): string {
  if (payment.payment_method === 'card') {
    if (payment.card_payment_type === 'debit') {
      return 'Cartão Débito';
    }

    if (
      payment.card_payment_type === 'credit' &&
      payment.installments_count != null
    ) {
      return `Cartão Crédito ${payment.installments_count}x`;
    }

    return PAYMENT_METHOD_LABELS.card;
  }

  return PAYMENT_METHOD_LABELS[payment.payment_method];
}

export function getSalePaymentSummaryLabel(
  payment: SalePaymentDisplay,
  total: number
): string | null {
  if (payment.payment_method !== 'card' || !payment.card_payment_type) {
    return null;
  }

  if (payment.card_payment_type === 'debit') {
    return 'Cartão débito';
  }

  if (payment.installments_count != null && payment.installments_count > 0) {
    const installmentValue = total / payment.installments_count;

    return `Cartão crédito em ${payment.installments_count}x de ${formatProductPrice(installmentValue)}`;
  }

  return null;
}
