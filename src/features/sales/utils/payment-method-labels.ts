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
  financing_installments_count?: number | null;
};

export type SalePaymentSummaryInput = SalePaymentDisplay & {
  down_payment?: number;
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

  if (
    (payment.payment_method === 'cash' || payment.payment_method === 'pix') &&
    payment.financing_installments_count != null
  ) {
    const methodLabel = PAYMENT_METHOD_LABELS[payment.payment_method];

    return `${methodLabel} parcelado ${payment.financing_installments_count}x`;
  }

  return PAYMENT_METHOD_LABELS[payment.payment_method];
}

export function getSalePaymentLabelCompact(
  payment: SalePaymentDisplay
): string {
  if (payment.payment_method === 'card') {
    if (payment.card_payment_type === 'debit') {
      return 'Débito';
    }

    if (
      payment.card_payment_type === 'credit' &&
      payment.installments_count != null
    ) {
      return `Créd. ${payment.installments_count}x`;
    }

    return PAYMENT_METHOD_LABELS.card;
  }

  if (payment.payment_method === 'credit_30_days') {
    return 'Fiado 30d';
  }

  if (
    (payment.payment_method === 'cash' || payment.payment_method === 'pix') &&
    payment.financing_installments_count != null
  ) {
    const methodLabel = PAYMENT_METHOD_LABELS[payment.payment_method];

    return `${methodLabel} ${payment.financing_installments_count}x`;
  }

  return PAYMENT_METHOD_LABELS[payment.payment_method];
}

export function getSalePaymentSummaryLines(
  payment: SalePaymentSummaryInput,
  total: number
): string[] {
  const lines: string[] = [];

  if (payment.payment_method === 'card' && payment.card_payment_type) {
    if (payment.card_payment_type === 'debit') {
      lines.push('Cartão débito');
      return lines;
    }

    if (payment.installments_count != null && payment.installments_count > 0) {
      const installmentValue = total / payment.installments_count;
      lines.push(
        `Cartão crédito em ${payment.installments_count}x de ${formatProductPrice(installmentValue)}`
      );
    }

    return lines;
  }

  if (
    (payment.payment_method === 'cash' || payment.payment_method === 'pix') &&
    payment.financing_installments_count != null
  ) {
    const methodLabel = payment.payment_method === 'pix' ? 'Pix' : 'Dinheiro';
    const downPayment =
      payment.down_payment != null && payment.down_payment > 0
        ? payment.down_payment
        : 0;
    const financedAmount = Math.max(total - downPayment, 0);

    if (financedAmount > 0) {
      const installmentValue =
        financedAmount / payment.financing_installments_count;

      lines.push(
        `${methodLabel} parcelado em ${payment.financing_installments_count}x de ${formatProductPrice(installmentValue)}`
      );
    }

    if (downPayment > 0) {
      lines.push(`Entrada: ${formatProductPrice(downPayment)}`);
    }

    return lines;
  }

  return lines;
}

/** @deprecated Use getSalePaymentSummaryLines */
export function getSalePaymentSummaryLabel(
  payment: SalePaymentSummaryInput,
  total: number
): string | null {
  const lines = getSalePaymentSummaryLines(payment, total);

  return lines.length > 0 ? lines.join(' · ') : null;
}
