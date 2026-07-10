import { maskCpf, maskPhone } from '@/lib/masks';

/** Telefone formatado para listagens/detalhes. */
export function formatPhoneDisplay(
  phone: string | null | undefined,
  emptyLabel = '—'
) {
  if (!phone?.trim()) {
    return emptyLabel;
  }

  return maskPhone(phone);
}

/** CPF formatado para listagens/detalhes. */
export function formatCpfDisplay(
  cpf: string | null | undefined,
  emptyLabel = '—'
) {
  if (!cpf?.trim()) {
    return emptyLabel;
  }

  const masked = maskCpf(cpf);
  return masked || emptyLabel;
}

/** Moeda BRL para exibição. */
export function formatCurrencyBR(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/** Data ISO (yyyy-mm-dd) → dd/mm/aaaa. */
export function formatDateBR(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(new Date(`${value}T00:00:00`));
}

/** DateTime ISO → dd/mm/aaaa, hh:mm. */
export function formatDateTimeBR(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}
