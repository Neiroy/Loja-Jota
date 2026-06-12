import { getCurrentStoreId } from '@/lib/tenant/get-current-store';
import * as productsRepository from '@/repositories/products.repository';
import {
  createProductSchema,
  listProductsSchema,
  productIdSchema,
  updateProductSchema,
  type CreateProductInput,
  type ListProductsInput,
  type UpdateProductInput,
} from '@/schemas/product.schema';
import type { Product } from '@/types/product.types';

export class ProductServiceError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND' | 'INVALID_ID' | 'DATABASE'
  ) {
    super(message);
    this.name = 'ProductServiceError';
  }
}

function normalizeCreateInput(input: CreateProductInput) {
  return {
    name: input.name.trim(),
    category: input.category.trim(),
    size: input.size ?? null,
    color: input.color ?? null,
    sale_price: input.sale_price,
    stock_quantity: input.stock_quantity,
    is_active: input.is_active ?? true,
  };
}

function normalizeUpdateInput(input: UpdateProductInput) {
  return {
    name: input.name.trim(),
    category: input.category.trim(),
    size: input.size ?? null,
    color: input.color ?? null,
    sale_price: input.sale_price,
    stock_quantity: input.stock_quantity,
    is_active: input.is_active,
  };
}

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    sale_price: Number(product.sale_price),
    stock_quantity: Number(product.stock_quantity),
  };
}

export async function list(
  filters: ListProductsInput = { status: 'all' }
): Promise<Product[]> {
  const parsed = listProductsSchema.safeParse(filters);

  if (!parsed.success) {
    return [];
  }

  const storeId = await getCurrentStoreId();
  const { data, error } = await productsRepository.findAll(
    storeId,
    parsed.data
  );

  if (error) {
    throw new ProductServiceError(
      'Não foi possível carregar os produtos.',
      'DATABASE'
    );
  }

  return (data ?? []).map(normalizeProduct);
}

export async function getById(id: string): Promise<Product> {
  const parsedId = productIdSchema.safeParse(id);

  if (!parsedId.success) {
    throw new ProductServiceError('Identificador inválido.', 'INVALID_ID');
  }

  const storeId = await getCurrentStoreId();
  const { data, error } = await productsRepository.findById(
    storeId,
    parsedId.data
  );

  if (error) {
    throw new ProductServiceError(
      'Não foi possível carregar o produto.',
      'DATABASE'
    );
  }

  if (!data) {
    throw new ProductServiceError('Produto não encontrado.', 'NOT_FOUND');
  }

  return normalizeProduct(data);
}

export async function create(input: CreateProductInput): Promise<Product> {
  const parsed = createProductSchema.safeParse(input);

  if (!parsed.success) {
    throw new ProductServiceError('Dados do produto inválidos.', 'INVALID_ID');
  }

  const storeId = await getCurrentStoreId();
  const payload = normalizeCreateInput(parsed.data);
  const { data, error } = await productsRepository.insert(storeId, payload);

  if (error) {
    throw new ProductServiceError(
      'Não foi possível cadastrar o produto.',
      'DATABASE'
    );
  }

  if (!data) {
    throw new ProductServiceError(
      'Não foi possível cadastrar o produto.',
      'DATABASE'
    );
  }

  return normalizeProduct(data);
}

export async function update(
  id: string,
  input: UpdateProductInput
): Promise<Product> {
  const parsedId = productIdSchema.safeParse(id);

  if (!parsedId.success) {
    throw new ProductServiceError('Identificador inválido.', 'INVALID_ID');
  }

  const parsed = updateProductSchema.safeParse(input);

  if (!parsed.success) {
    throw new ProductServiceError('Dados do produto inválidos.', 'INVALID_ID');
  }

  await getById(parsedId.data);

  const storeId = await getCurrentStoreId();
  const payload = normalizeUpdateInput(parsed.data);
  const { data, error } = await productsRepository.update(
    storeId,
    parsedId.data,
    payload
  );

  if (error) {
    throw new ProductServiceError(
      'Não foi possível atualizar o produto.',
      'DATABASE'
    );
  }

  if (!data) {
    throw new ProductServiceError('Produto não encontrado.', 'NOT_FOUND');
  }

  return normalizeProduct(data);
}

export async function setStatus(
  id: string,
  isActive: boolean
): Promise<Product> {
  const parsedId = productIdSchema.safeParse(id);

  if (!parsedId.success) {
    throw new ProductServiceError('Identificador inválido.', 'INVALID_ID');
  }

  await getById(parsedId.data);

  const storeId = await getCurrentStoreId();
  const { data, error } = await productsRepository.update(
    storeId,
    parsedId.data,
    {
      is_active: isActive,
    }
  );

  if (error) {
    throw new ProductServiceError(
      'Não foi possível alterar o status do produto.',
      'DATABASE'
    );
  }

  if (!data) {
    throw new ProductServiceError('Produto não encontrado.', 'NOT_FOUND');
  }

  return normalizeProduct(data);
}
