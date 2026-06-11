/** Remove tudo que não for dígito. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/** Alias de digitsOnly. */
export const onlyDigits = digitsOnly;

/** Máscara visual: (00) 00000-0000 — até 11 dígitos (celular). */
export function maskPhone(value: string): string {
  const digits = digitsOnly(value).slice(0, 11);

  if (digits.length === 0) {
    return '';
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Alias de maskPhone. */
export const maskPhoneBR = maskPhone;

/** Máscara visual: 000.000.000-00 — até 11 dígitos. */
export function maskCpf(value: string): string {
  const digits = digitsOnly(value).slice(0, 11);

  if (digits.length === 0) {
    return '';
  }

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }

  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/**
 * Máscara visual BRL a partir de dígitos (centavos).
 * Ex.: "12990" -> "R$ 129,90"
 */
export function maskCurrencyBR(value: string): string {
  const digits = digitsOnly(value);

  if (digits.length === 0) {
    return '';
  }

  const cents = Number.parseInt(digits, 10);
  const amount = cents / 100;

  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/** Converte valor mascarado ou dígitos para número decimal. */
export function parseCurrencyBRToNumber(value: string): number {
  const digits = digitsOnly(value);

  if (digits.length === 0) {
    return 0;
  }

  return Number.parseInt(digits, 10) / 100;
}

/** Formata número para exibição em input de moeda. */
export function numberToCurrencyMask(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    return '';
  }

  return maskCurrencyBR(String(Math.round(value * 100)));
}

/** Apenas dígitos inteiros; remove zeros à esquerda, exceto "0". */
export function onlyIntegerString(value: string): string {
  const digits = digitsOnly(value);

  if (digits.length === 0) {
    return '';
  }

  return String(Number.parseInt(digits, 10));
}

/**
 * Máscara visual de data BR: 00/00/0000
 * Pronta para uso futuro — não aplicada em campos atuais.
 */
export function maskDateBR(value: string): string {
  const digits = digitsOnly(value).slice(0, 8);

  if (digits.length === 0) {
    return '';
  }

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Parse inteiro positivo com mínimo. */
export function parsePositiveInteger(value: string, min = 1): number {
  const digits = digitsOnly(value);
  const parsed = digits === '' ? min : Number.parseInt(digits, 10);

  if (!Number.isFinite(parsed)) {
    return min;
  }

  return Math.max(min, parsed);
}

/** Parse inteiro não negativo. */
export function parseNonNegativeInteger(value: string): number {
  const digits = digitsOnly(value);
  const parsed = digits === '' ? 0 : Number.parseInt(digits, 10);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, parsed);
}
