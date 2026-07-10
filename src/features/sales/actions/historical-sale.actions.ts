'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createHistoricalSaleSchema } from '@/schemas/historical-sale.schema';
import {
  HistoricalSaleServiceError,
  create as createHistoricalSale,
} from '@/services/historical-sales.service';
import { parseCurrencyBRToNumber } from '@/lib/masks';
import type { ActionResult } from '@/types/action.types';
import type { ZodError } from 'zod';

function mapFieldErrors(
  fieldErrors: Record<string, string[] | undefined>
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(fieldErrors).filter(
      (entry): entry is [string, string[]] =>
        Array.isArray(entry[1]) && entry[1].length > 0
    )
  );
}

function mapZodErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors = mapFieldErrors(error.flatten().fieldErrors);

  for (const issue of error.issues) {
    if (issue.path.length === 0) {
      continue;
    }

    const key = issue.path.join('.');
    const current = fieldErrors[key] ?? [];

    if (!current.includes(issue.message)) {
      fieldErrors[key] = [...current, issue.message];
    }

    if (
      issue.path[0] === 'items' &&
      !fieldErrors.items?.includes(issue.message)
    ) {
      fieldErrors.items = [...(fieldErrors.items ?? []), issue.message];
    }
  }

  return fieldErrors;
}

function emptyToNull(value: FormDataEntryValue | null) {
  if (value === null || value === '') {
    return null;
  }

  return value;
}

function parseItemsJson(raw: FormDataEntryValue | null) {
  if (typeof raw !== 'string' || !raw.trim()) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseHistoricalSalePayload(formData: FormData) {
  const totalRaw = formData.get('total');
  const downPaymentRaw = formData.get('down_payment') ?? '0';
  const total =
    typeof totalRaw === 'string' ? parseCurrencyBRToNumber(totalRaw) : 0;
  const downPayment =
    typeof downPaymentRaw === 'string'
      ? parseCurrencyBRToNumber(downPaymentRaw)
      : 0;
  const remaining = Math.round((total - downPayment) * 100) / 100;
  const items = parseItemsJson(formData.get('items_json')).map((item) => {
    if (!item || typeof item !== 'object') {
      return item;
    }

    const row = item as Record<string, unknown>;
    const unitPriceRaw = row.unit_price;
    const unitPrice =
      typeof unitPriceRaw === 'string'
        ? parseCurrencyBRToNumber(unitPriceRaw)
        : unitPriceRaw;

    const mapped: Record<string, unknown> = {
      description: row.description,
      quantity: row.quantity,
      unit_price: unitPrice,
    };

    if (
      typeof row.product_id === 'string' &&
      row.product_id.trim().length > 0
    ) {
      mapped.product_id = row.product_id;
    }

    return mapped;
  });

  return {
    customer_id: formData.get('customer_id'),
    sale_date: formData.get('sale_date'),
    total,
    down_payment: downPayment,
    payment_method: formData.get('payment_method'),
    pending_installments:
      remaining > 0 ? emptyToNull(formData.get('pending_installments')) : null,
    first_due_date:
      remaining > 0 ? emptyToNull(formData.get('first_due_date')) : null,
    notes: formData.get('notes'),
    items,
  };
}

export async function createHistoricalSaleAction(
  _prevState: ActionResult<{ saleId: string }> | null,
  formData: FormData
): Promise<ActionResult<{ saleId: string }>> {
  const payload = parseHistoricalSalePayload(formData);

  if (process.env.NODE_ENV === 'development') {
    console.log('[historical-sale] parsed payload', payload);
  }

  const parsed = createHistoricalSaleSchema.safeParse(payload);

  if (!parsed.success) {
    const fieldErrors = mapZodErrors(parsed.error);
    const firstFieldError = Object.values(fieldErrors).flat()[0];

    if (process.env.NODE_ENV === 'development') {
      console.error('[historical-sale] zod errors', parsed.error.issues);
    }

    return {
      success: false,
      fieldErrors,
      error:
        parsed.error.issues.find((issue) => issue.path.length === 0)?.message ??
        firstFieldError ??
        'Revise os campos e tente novamente.',
    };
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[historical-sale] parsed payload', parsed.data);
  }

  let saleId: string;

  try {
    saleId = await createHistoricalSale(parsed.data);
  } catch (error) {
    if (error instanceof HistoricalSaleServiceError) {
      return { success: false, error: error.message };
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('[historical-sale] unexpected error', error);
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Não foi possível lançar a venda antiga. Tente novamente.',
    };
  }

  revalidatePath('/vendas');
  revalidatePath('/fiados');
  revalidatePath('/dashboard');
  revalidatePath(`/clientes/${parsed.data.customer_id}`);
  redirect(`/vendas/${saleId}`);
}
