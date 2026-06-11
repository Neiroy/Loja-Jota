import {
  listCustomersSchema,
  type ListCustomersInput,
} from '@/schemas/customer.schema';

export function parseListCustomersParams(
  searchParams: Record<string, string | string[] | undefined>
): ListCustomersInput {
  const search =
    typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const status =
    typeof searchParams.status === 'string' ? searchParams.status : undefined;

  const parsed = listCustomersSchema.safeParse({ search, status });

  if (!parsed.success) {
    return { status: 'all' };
  }

  return parsed.data;
}
