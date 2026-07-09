import { formatReceivableDate } from '@/features/receivables/utils/format-receivable-date';
import { formatProductPrice } from '@/features/products/utils/format-product-price';
import { digitsOnly } from '@/lib/masks';

const BRAZIL_COUNTRY_CODE = '55';
const MIN_WHATSAPP_PHONE_LENGTH = 12;

type ReceivableReminderInput = {
  customerName: string;
  amount: number;
  dueDate: string;
  installmentNumber: number;
  installmentsTotal: number;
};

export function formatWhatsAppPhone(
  phone: string | null | undefined
): string | null {
  if (!phone?.trim()) {
    return null;
  }

  let digits = digitsOnly(phone);

  if (digits.length === 0) {
    return null;
  }

  if (digits.startsWith(BRAZIL_COUNTRY_CODE)) {
    return digits.length >= MIN_WHATSAPP_PHONE_LENGTH ? digits : null;
  }

  digits = `${BRAZIL_COUNTRY_CODE}${digits}`;

  return digits.length >= MIN_WHATSAPP_PHONE_LENGTH ? digits : null;
}

export function buildReceivableReminderMessage({
  customerName,
  amount,
  dueDate,
  installmentNumber,
  installmentsTotal,
}: ReceivableReminderInput): string {
  const formattedAmount = formatProductPrice(amount);
  const formattedDueDate = formatReceivableDate(dueDate);

  const reminderLine =
    installmentsTotal > 1
      ? `Passando para lembrar sobre sua parcela ${installmentNumber} de ${installmentsTotal}, no valor de ${formattedAmount}, com vencimento em ${formattedDueDate}.`
      : `Passando para lembrar sobre sua conta no valor de ${formattedAmount}, com vencimento em ${formattedDueDate}.`;

  return [
    `Olá, ${customerName}! Tudo bem?`,
    '',
    reminderLine,
    '',
    'Se já realizou o pagamento, por favor desconsidere esta mensagem.',
    '',
    'Obrigado!',
  ].join('\n');
}

export function buildWhatsAppReminderUrl(
  phone: string | null | undefined,
  message: string
): string | null {
  const normalizedPhone = formatWhatsAppPhone(phone);

  if (!normalizedPhone) {
    return null;
  }

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}
