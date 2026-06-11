import {
  listProductsSchema,
  type ListProductsInput,
} from '@/schemas/product.schema';

export function parseListProductsParams(
  searchParams: Record<string, string | string[] | undefined>
): ListProductsInput {
  const search =
    typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const status =
    typeof searchParams.status === 'string' ? searchParams.status : undefined;

  const parsed = listProductsSchema.safeParse({ search, status });

  if (!parsed.success) {
    return { status: 'all' };
  }

  return parsed.data;
}
