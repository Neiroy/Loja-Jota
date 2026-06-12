import { getCurrentStoreId } from '@/lib/tenant/get-current-store';
import * as salesRepository from '@/repositories/sales.repository';
import {
  createSaleSchema,
  listSalesSchema,
  saleIdSchema,
  type CreateSaleInput,
  type ListSalesFilters,
} from '@/schemas/sale.schema';
import type { SaleDetail, SaleListRow } from '@/types/sale.types';

export class SaleServiceError extends Error {
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
    this.name = 'SaleServiceError';
  }
}

function mapRpcErrorMessage(message?: string): string {
  if (!message) {
    return 'Não foi possível registrar a venda.';
  }

  const knownMessages = [
    'Usuário não vinculado a uma loja.',
    'Cliente não encontrado ou inativo.',
    'A venda deve ter pelo menos um item.',
    'Produto inválido no item da venda.',
    'Quantidade inválida no item da venda.',
    'Quantidade deve ser maior que zero.',
    'Produto duplicado na venda. Agrupe a quantidade em um único item.',
    'Produto não encontrado.',
    'Desconto deve ser maior ou igual a zero.',
    'Desconto não pode ser maior que o subtotal.',
    'Total da venda não pode ser negativo.',
    'Venda fiada deve ter total maior que zero.',
  ];

  if (knownMessages.some((known) => message.includes(known))) {
    return message;
  }

  if (message.includes('está inativo')) {
    return message;
  }

  if (message.includes('Estoque insuficiente')) {
    return message;
  }

  return 'Não foi possível registrar a venda.';
}

export async function list(
  filters: ListSalesFilters = {
    payment_status: 'all',
    payment_method: undefined,
  }
): Promise<SaleListRow[]> {
  const parsed = listSalesSchema.safeParse(filters);

  if (!parsed.success) {
    return [];
  }

  const storeId = await getCurrentStoreId();
  const { data, error } = await salesRepository.findAll(storeId, parsed.data);

  if (error) {
    throw new SaleServiceError(
      'Não foi possível carregar as vendas.',
      'DATABASE'
    );
  }

  return (data ?? []).map(salesRepository.mapSaleListRow);
}

export async function getByIdWithDetails(id: string): Promise<SaleDetail> {
  const parsedId = saleIdSchema.safeParse(id);

  if (!parsedId.success) {
    throw new SaleServiceError('Identificador inválido.', 'INVALID_ID');
  }

  const storeId = await getCurrentStoreId();
  const { data, error } = await salesRepository.findByIdWithDetails(
    storeId,
    parsedId.data
  );

  if (error) {
    throw new SaleServiceError(
      'Não foi possível carregar a venda.',
      'DATABASE'
    );
  }

  if (!data) {
    throw new SaleServiceError('Venda não encontrada.', 'NOT_FOUND');
  }

  return salesRepository.mapSaleDetail(data);
}

export async function create(input: CreateSaleInput): Promise<string> {
  const parsed = createSaleSchema.safeParse(input);

  if (!parsed.success) {
    throw new SaleServiceError('Dados da venda inválidos.', 'VALIDATION');
  }

  await getCurrentStoreId();

  const { data, error } = await salesRepository.createSaleWithItems({
    customer_id: parsed.data.customer_id,
    discount: parsed.data.discount,
    payment_method: parsed.data.payment_method,
    items: parsed.data.items,
  });

  if (error) {
    throw new SaleServiceError(mapRpcErrorMessage(error.message), 'RPC');
  }

  if (!data || typeof data !== 'string') {
    throw new SaleServiceError(
      'Não foi possível registrar a venda.',
      'DATABASE'
    );
  }

  return data;
}
