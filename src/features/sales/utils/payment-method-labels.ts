import type { PaymentMethod } from '@/schemas/sale.schema';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Dinheiro',
  pix: 'Pix',
  card: 'Cartão',
  credit_30_days: 'Fiado 30 dias',
};

export function getPaymentMethodLabel(method: PaymentMethod) {
  return PAYMENT_METHOD_LABELS[method];
}
