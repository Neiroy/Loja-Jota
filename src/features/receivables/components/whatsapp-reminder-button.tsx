import {
  buildReceivableReminderMessage,
  buildWhatsAppReminderUrl,
} from '@/features/receivables/utils/whatsapp-reminder';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ReceivableStatus } from '@/types/database.types';

type WhatsAppReminderButtonProps = {
  customerName: string;
  customerPhone: string | null;
  amount: number;
  dueDate: string;
  installmentNumber: number;
  installmentsTotal: number;
  status: ReceivableStatus;
};

export function WhatsAppReminderButton({
  customerName,
  customerPhone,
  amount,
  dueDate,
  installmentNumber,
  installmentsTotal,
  status,
}: WhatsAppReminderButtonProps) {
  const canRemind = status === 'open' || status === 'overdue';

  if (!canRemind) {
    return null;
  }

  const message = buildReceivableReminderMessage({
    customerName,
    amount,
    dueDate,
    installmentNumber,
    installmentsTotal,
  });
  const whatsAppUrl = buildWhatsAppReminderUrl(customerPhone, message);

  if (!whatsAppUrl) {
    return (
      <p className="text-sm text-stone-500">Cliente sem telefone cadastrado.</p>
    );
  }

  return (
    <a
      href={whatsAppUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant: 'outline' }))}
    >
      Lembrar no WhatsApp
    </a>
  );
}
