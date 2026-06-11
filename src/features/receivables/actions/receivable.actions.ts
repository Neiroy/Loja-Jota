'use server';

import { revalidatePath } from 'next/cache';

import {
  markReceivablePaidSchema,
  type ListReceivablesFilters,
  type MarkReceivablePaidInput,
} from '@/schemas/receivable.schema';
import * as receivablesService from '@/services/receivables.service';
import { ReceivableServiceError } from '@/services/receivables.service';
import {
  LIST_LOAD_ERROR,
  type ActionResult,
  type ListActionResult,
} from '@/types/action.types';
import type {
  ReceivableDetail,
  ReceivableListRow,
} from '@/types/receivable.types';

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
  if (error instanceof ReceivableServiceError) {
    return { success: false, error: error.message };
  }

  return {
    success: false,
    error: 'Não foi possível concluir a operação. Tente novamente.',
  };
}

export async function listReceivables(
  filters: ListReceivablesFilters = { status: 'all' }
): Promise<ListActionResult<ReceivableListRow>> {
  try {
    const items = await receivablesService.list(filters);
    return { items };
  } catch {
    return { items: [], error: LIST_LOAD_ERROR };
  }
}

export async function getReceivable(
  id: string
): Promise<ReceivableDetail | null> {
  try {
    return await receivablesService.getByIdWithDetails(id);
  } catch (error) {
    if (error instanceof ReceivableServiceError && error.code === 'NOT_FOUND') {
      return null;
    }

    return null;
  }
}

export async function markReceivablePaidAction(
  input: MarkReceivablePaidInput
): Promise<ActionResult<{ receivableId: string }>> {
  const parsed = markReceivablePaidSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: mapFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  let receivable: ReceivableDetail;

  try {
    receivable = await receivablesService.getByIdWithDetails(
      parsed.data.receivable_id
    );
    await receivablesService.markAsPaid(parsed.data);
  } catch (error) {
    return handleServiceError(error);
  }

  revalidatePath('/fiados');
  revalidatePath(`/fiados/${parsed.data.receivable_id}`);
  revalidatePath(`/vendas/${receivable.sale_id}`);
  revalidatePath(`/clientes/${receivable.customer_id}`);

  return {
    success: true,
    data: { receivableId: parsed.data.receivable_id },
  };
}
