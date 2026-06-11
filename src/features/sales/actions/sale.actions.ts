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

  return {
    customer_id: formData.get('customer_id'),
    discount: formData.get('discount') ?? '0',
    payment_method: formData.get('payment_method'),
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
    return {
      success: false,
      fieldErrors: mapFieldErrors(parsed.error.flatten().fieldErrors),
      error: parsed.error.issues.find((issue) => issue.path.length === 0)
        ?.message,
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
