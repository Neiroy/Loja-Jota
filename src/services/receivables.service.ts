import { getCurrentStoreId } from '@/lib/tenant/get-current-store';
import * as receivablesRepository from '@/repositories/receivables.repository';
import {
  listReceivablesSchema,
  markReceivablePaidSchema,
  receivableIdSchema,
  type ListReceivablesFilters,
  type MarkReceivablePaidInput,
} from '@/schemas/receivable.schema';
import type {
  ReceivableDetail,
  ReceivableListRow,
} from '@/types/receivable.types';

export class ReceivableServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'NOT_FOUND'
      | 'INVALID_ID'
      | 'VALIDATION'
      | 'BUSINESS'
      | 'DATABASE'
      | 'RPC'
  ) {
    super(message);
    this.name = 'ReceivableServiceError';
  }
}

function mapRpcErrorMessage(message?: string): string {
  if (!message) {
    return 'Não foi possível quitar o fiado.';
  }

  const knownMessages = [
    'Usuário não vinculado a uma loja.',
    'Fiado não encontrado.',
    'Fiado já está quitado.',
    'Fiado cancelado não pode ser quitado.',
    'Fiado não pode ser quitado no status atual.',
    'Forma de pagamento inválida. Use dinheiro, Pix ou cartão.',
    'Venda vinculada ao fiado não foi encontrada.',
  ];

  if (knownMessages.some((known) => message.includes(known))) {
    return message;
  }

  return 'Não foi possível quitar o fiado.';
}

async function syncOverdueReceivables(storeId: string) {
  const { error } = await receivablesRepository.syncOverdue(storeId);

  if (error) {
    throw new ReceivableServiceError(
      'Não foi possível atualizar fiados vencidos.',
      'DATABASE'
    );
  }
}

export async function list(
  filters: ListReceivablesFilters = { status: 'all' }
): Promise<ReceivableListRow[]> {
  const parsed = listReceivablesSchema.safeParse(filters);

  if (!parsed.success) {
    return [];
  }

  const storeId = await getCurrentStoreId();
  await syncOverdueReceivables(storeId);

  const { data, error } = await receivablesRepository.findAll(
    storeId,
    parsed.data
  );

  if (error) {
    throw new ReceivableServiceError(
      'Não foi possível carregar os fiados.',
      'DATABASE'
    );
  }

  return (data ?? []).map(receivablesRepository.mapReceivableListRow);
}

export async function getByIdWithDetails(
  id: string
): Promise<ReceivableDetail> {
  const parsedId = receivableIdSchema.safeParse(id);

  if (!parsedId.success) {
    throw new ReceivableServiceError('Identificador inválido.', 'INVALID_ID');
  }

  const storeId = await getCurrentStoreId();
  await syncOverdueReceivables(storeId);

  const { data, error } = await receivablesRepository.findByIdWithDetails(
    storeId,
    parsedId.data
  );

  if (error) {
    throw new ReceivableServiceError(
      'Não foi possível carregar o fiado.',
      'DATABASE'
    );
  }

  if (!data) {
    throw new ReceivableServiceError('Fiado não encontrado.', 'NOT_FOUND');
  }

  return receivablesRepository.mapReceivableDetail(data);
}

export async function markAsPaid(
  input: MarkReceivablePaidInput
): Promise<string> {
  const parsed = markReceivablePaidSchema.safeParse(input);

  if (!parsed.success) {
    throw new ReceivableServiceError(
      'Dados da quitação inválidos.',
      'VALIDATION'
    );
  }

  const storeId = await getCurrentStoreId();
  await syncOverdueReceivables(storeId);

  const { data, error } = await receivablesRepository.markAsPaid(
    parsed.data.receivable_id,
    parsed.data.payment_method
  );

  if (error) {
    throw new ReceivableServiceError(mapRpcErrorMessage(error.message), 'RPC');
  }

  if (!data || typeof data !== 'string') {
    throw new ReceivableServiceError(
      'Não foi possível quitar o fiado.',
      'DATABASE'
    );
  }

  return data;
}
