import { listSalesSchema, type ListSalesFilters } from '@/schemas/sale.schema';

export function parseListSalesParams(
  searchParams: Record<string, string | string[] | undefined>
): ListSalesFilters {
  const search =
    typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const payment_method =
    typeof searchParams.payment_method === 'string'
      ? searchParams.payment_method
      : undefined;
  const payment_status =
    typeof searchParams.payment_status === 'string'
      ? searchParams.payment_status
      : undefined;

  const parsed = listSalesSchema.safeParse({
    search,
    payment_method,
    payment_status,
  });

  if (!parsed.success) {
    return { payment_status: 'all', payment_method: undefined };
  }

  return parsed.data;
}
