'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createSaleSchema, type ListSalesFilters } from '@/schemas/sale.schema';
import * as salesService from '@/services/sales.service';
import { SaleServiceError } from '@/services/sales.service';
import {
  LIST_LOAD_ERROR,
  type ActionResult,
  type ListActionResult,
} from '@/types/action.types';
import type { SaleDetail, SaleListRow } from '@/types/sale.types';

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

function handleServiceError(error: unknown): ActionResult<never> {
  if (error instanceof SaleServiceError) {
    return { success: false, error: error.message };
  }

  return {
    success: false,
    error: 'Não foi possível concluir a operação. Tente novamente.',
  };
}

function emptyToNull(value: FormDataEntryValue | null) {
  if (value === null || value === '') {
    return null;
  }

  return value;
}

function parseCreateSalePayload(formData: FormData) {
  const itemsRaw = formData.get('items_json');

  let items: unknown = [];

  if (typeof itemsRaw === 'string' && itemsRaw.trim()) {
    try {
      items = JSON.parse(itemsRaw);
    } catch {
      items = [];
    }
  }

  const paymentMethod = formData.get('payment_method');
  const cardPaymentType = emptyToNull(formData.get('card_payment_type'));
  const financingRaw = emptyToNull(
    formData.get('financing_installments_count')
  );

  const isCard = paymentMethod === 'card';
  const isCardCredit = isCard && cardPaymentType === 'credit';
  const isCashPix = paymentMethod === 'cash' || paymentMethod === 'pix';
  const isInstallmentCashPix = isCashPix && financingRaw !== null;

  return {
    customer_id: formData.get('customer_id'),
    discount: formData.get('discount') ?? '0',
    payment_method: paymentMethod,
    card_payment_type: isCard ? cardPaymentType : null,
    installments_count: isCardCredit
      ? emptyToNull(formData.get('installments_count'))
      : null,
    down_payment: isInstallmentCashPix
      ? (formData.get('down_payment') ?? '0')
      : '0',
    financing_installments_count: isInstallmentCashPix ? financingRaw : null,
    items,
  };
}

export async function listSales(
  filters: ListSalesFilters = {
    payment_status: 'all',
    payment_method: undefined,
  }
): Promise<ListActionResult<SaleListRow>> {
  try {
    const items = await salesService.list(filters);
    return { items };
  } catch {
    return { items: [], error: LIST_LOAD_ERROR };
  }
}

export async function getSale(id: string): Promise<SaleDetail | null> {
  try {
    return await salesService.getByIdWithDetails(id);
  } catch {
    return null;
  }
}

export async function createSaleAction(
  _prevState: ActionResult<{ saleId: string }> | null,
  formData: FormData
): Promise<ActionResult<{ saleId: string }>> {
  const parsed = createSaleSchema.safeParse(parseCreateSalePayload(formData));

  if (!parsed.success) {
    if (process.env.NODE_ENV === 'development') {
      console.error(
        '[createSaleAction] Validação falhou:',
        parsed.error.flatten()
      );
    }

    const fieldErrors = mapFieldErrors(parsed.error.flatten().fieldErrors);
    const firstFieldError = Object.values(fieldErrors).flat()[0];

    return {
      success: false,
      fieldErrors,
      error:
        parsed.error.issues.find((issue) => issue.path.length === 0)?.message ??
        firstFieldError ??
        'Revise os campos da venda e tente novamente.',
    };
  }

  let saleId: string;

  try {
    saleId = await salesService.create(parsed.data);
  } catch (error) {
    return handleServiceError(error);
  }

  revalidatePath('/vendas');
  revalidatePath('/produtos');
  revalidatePath(`/clientes/${parsed.data.customer_id}`);
  redirect(`/vendas/${saleId}`);
}

export async function cancelSaleAction(
  saleId: string
): Promise<ActionResult<{ saleId: string }>> {
  try {
    const cancelledSaleId = await salesService.cancel(saleId);

    revalidatePath('/vendas');
    revalidatePath(`/vendas/${cancelledSaleId}`);
    revalidatePath('/produtos');
    revalidatePath('/fiados');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: { saleId: cancelledSaleId },
    };
  } catch (error) {
    return handleServiceError(error);
  }
}
