import { getCurrentStoreId } from '@/lib/tenant/get-current-store';
import * as salesRepository from '@/repositories/sales.repository';
import type { CreateHistoricalSaleInput } from '@/schemas/historical-sale.schema';
import type { CreateHistoricalSaleRpcItem } from '@/types/sale.types';

export class HistoricalSaleServiceError extends Error {
  constructor(
    message: string,
    public readonly code: 'VALIDATION' | 'BUSINESS' | 'DATABASE' | 'RPC'
  ) {
    super(message);
    this.name = 'HistoricalSaleServiceError';
  }
}

function mapRpcItems(
  items: CreateHistoricalSaleInput['items']
): CreateHistoricalSaleRpcItem[] {
  return items.map((item) => {
    const mapped: CreateHistoricalSaleRpcItem = {
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
    };

    if (item.product_id) {
      mapped.product_id = item.product_id;
    }

    return mapped;
  });
}

function mapRpcErrorMessage(
  message?: string,
  details?: string,
  hint?: string
): string {
  const combined = [message, details, hint].filter(Boolean).join(' — ');

  if (!combined) {
    return 'Não foi possível lançar a venda antiga.';
  }

  if (combined.includes('sales_financing_consistency')) {
    return 'Não foi possível salvar a venda antiga: a combinação de valor já pago e parcelas conflita com a regra do banco. Aplique a migration 022 e tente novamente.';
  }

  const knownMessages = [
    'Usuário não vinculado a uma loja.',
    'Total da venda deve ser maior que zero.',
    'Valor já pago deve ser maior ou igual a zero.',
    'Valor já pago não pode ser maior que o total da venda.',
    'Data da venda não pode ser futura.',
    'Cliente não encontrado ou inativo.',
    'Venda quitada não deve ter parcelas pendentes.',
    'Quantidade de parcelas pendentes é obrigatória.',
    'Data do primeiro vencimento é obrigatória.',
    'Itens históricos inválidos.',
    'Descrição do produto histórico é obrigatória',
    'Quantidade do produto histórico deve ser maior que zero',
    'Valor unitário do produto histórico inválido',
    'Produto histórico não encontrado nesta loja',
  ];

  if (knownMessages.some((known) => combined.includes(known))) {
    return message ?? combined;
  }

  // Exibe a mensagem real da RPC/PostgREST em vez de engolir o erro.
  if (combined.length <= 400) {
    return combined;
  }

  return message ?? 'Não foi possível lançar a venda antiga.';
}

export async function create(
  input: CreateHistoricalSaleInput
): Promise<string> {
  await getCurrentStoreId();

  const rpcPayload = {
    customer_id: input.customer_id,
    sale_date: input.sale_date,
    total: input.total,
    down_payment: input.down_payment,
    payment_method: input.payment_method,
    pending_installments: input.pending_installments,
    first_due_date: input.first_due_date,
    notes: input.notes,
    items: mapRpcItems(input.items),
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('[historical-sale] rpc payload', rpcPayload);
  }

  const { data, error } =
    await salesRepository.createHistoricalSale(rpcPayload);

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[historical-sale] rpc error', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
    }

    throw new HistoricalSaleServiceError(
      mapRpcErrorMessage(error.message, error.details, error.hint),
      'RPC'
    );
  }

  if (!data || typeof data !== 'string') {
    throw new HistoricalSaleServiceError(
      'A RPC não retornou o ID da venda antiga.',
      'DATABASE'
    );
  }

  return data;
}
