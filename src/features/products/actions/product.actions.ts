'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {
  createProductSchema,
  productIdSchema,
  updateProductSchema,
  type ListProductsInput,
} from '@/schemas/product.schema';
import * as productsService from '@/services/products.service';
import { ProductServiceError } from '@/services/products.service';
import {
  LIST_LOAD_ERROR,
  type ActionResult,
  type ListActionResult,
} from '@/types/action.types';
import type { Product } from '@/types/product.types';

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

function parseCreateFormData(formData: FormData) {
  return {
    name: formData.get('name'),
    category: formData.get('category'),
    size: formData.get('size') ?? '',
    color: formData.get('color') ?? '',
    sale_price: formData.get('sale_price'),
    stock_quantity: formData.get('stock_quantity'),
  };
}

function parseUpdateFormData(formData: FormData) {
  return {
    ...parseCreateFormData(formData),
    is_active: formData.get('is_active') === 'on',
  };
}

function handleServiceError(error: unknown): ActionResult<never> {
  if (error instanceof ProductServiceError) {
    return { success: false, error: error.message };
  }

  return {
    success: false,
    error: 'Não foi possível concluir a operação. Tente novamente.',
  };
}

export async function listProducts(
  filters: ListProductsInput = { status: 'all' }
): Promise<ListActionResult<Product>> {
  try {
    const items = await productsService.list(filters);
    return { items };
  } catch {
    return { items: [], error: LIST_LOAD_ERROR };
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    return await productsService.getById(id);
  } catch {
    return null;
  }
}

export async function createProductAction(
  _prevState: ActionResult<Product> | null,
  formData: FormData
): Promise<ActionResult<Product>> {
  const parsed = createProductSchema.safeParse(parseCreateFormData(formData));

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: mapFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  let product: Product;

  try {
    product = await productsService.create(parsed.data);
  } catch (error) {
    return handleServiceError(error);
  }

  revalidatePath('/produtos');
  redirect(`/produtos/${product.id}`);
}

export async function updateProductAction(
  id: string,
  _prevState: ActionResult<Product> | null,
  formData: FormData
): Promise<ActionResult<Product>> {
  const parsedId = productIdSchema.safeParse(id);

  if (!parsedId.success) {
    return { success: false, error: 'Identificador inválido.' };
  }

  const parsed = updateProductSchema.safeParse(parseUpdateFormData(formData));

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: mapFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  let product: Product;

  try {
    product = await productsService.update(parsedId.data, parsed.data);
  } catch (error) {
    return handleServiceError(error);
  }

  revalidatePath('/produtos');
  revalidatePath(`/produtos/${product.id}`);
  revalidatePath(`/produtos/${product.id}/editar`);
  redirect(`/produtos/${product.id}`);
}

export async function setProductStatusAction(
  id: string,
  isActive: boolean
): Promise<ActionResult<Product>> {
  const parsedId = productIdSchema.safeParse(id);

  if (!parsedId.success) {
    return { success: false, error: 'Identificador inválido.' };
  }

  try {
    const product = await productsService.setStatus(parsedId.data, isActive);

    revalidatePath('/produtos');
    revalidatePath(`/produtos/${product.id}`);
    revalidatePath(`/produtos/${product.id}/editar`);

    return { success: true, data: product };
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function deleteProductAction(
  id: string
): Promise<ActionResult<void>> {
  const parsedId = productIdSchema.safeParse(id);

  if (!parsedId.success) {
    return { success: false, error: 'Identificador inválido.' };
  }

  try {
    await productsService.remove(parsedId.data);

    revalidatePath('/produtos');

    return { success: true };
  } catch (error) {
    return handleServiceError(error);
  }
}
