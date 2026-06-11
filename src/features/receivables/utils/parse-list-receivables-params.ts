import {
  listReceivablesSchema,
  type ListReceivablesFilters,
} from '@/schemas/receivable.schema';

export function parseListReceivablesParams(
  searchParams: Record<string, string | string[] | undefined>
): ListReceivablesFilters {
  const search =
    typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const status =
    typeof searchParams.status === 'string' ? searchParams.status : undefined;

  const parsed = listReceivablesSchema.safeParse({
    search,
    status,
  });

  if (!parsed.success) {
    return { status: 'all' };
  }

  return parsed.data;
}
