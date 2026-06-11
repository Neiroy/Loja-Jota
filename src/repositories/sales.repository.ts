import { createClient } from '@/lib/supabase/server';
import type { ListSalesFilters } from '@/schemas/sale.schema';
import type {
  CreateSaleRpcInput,
  SaleDetail,
  SaleListRow,
} from '@/types/sale.types';

type SaleListQueryRow = {
  id: string;
  customer_id: string;
  sale_date: string;
  subtotal: number | string;
  discount: number | string;
  total: number | string;
  payment_method: SaleListRow['payment_method'];
  payment_status: SaleListRow['payment_status'];
  created_at: string;
  updated_at: string;
  customers: { name: string } | { name: string }[] | null;
};

type SaleDetailQueryRow = {
  id: string;
  customer_id: string;
  sale_date: string;
  subtotal: number | string;
  discount: number | string;
  total: number | string;
  payment_method: SaleDetail['payment_method'];
  payment_status: SaleDetail['payment_status'];
  created_at: string;
  updated_at: string;
  customers: { name: string } | { name: string }[] | null;
  sale_items: Array<{
    id: string;
    sale_id: string;
    product_id: string;
    quantity: number;
    unit_price: number | string;
    total: number | string;
    created_at: string;
    products:
      | {
          name: string;
          category: string | null;
          size: string | null;
          color: string | null;
        }
      | {
          name: string;
          category: string | null;
          size: string | null;
          color: string | null;
        }[]
      | null;
  }>;
  receivables:
    | {
        id: string;
        amount: number | string;
        due_date: string;
        status: NonNullable<SaleDetail['receivable']>['status'];
      }
    | {
        id: string;
        amount: number | string;
        due_date: string;
        status: NonNullable<SaleDetail['receivable']>['status'];
      }[]
    | null;
};

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapSaleListRow(row: SaleListQueryRow): SaleListRow {
  const customer = unwrapRelation(row.customers);

  return {
    id: row.id,
    customer_id: row.customer_id,
    sale_date: row.sale_date,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    total: Number(row.total),
    payment_method: row.payment_method,
    payment_status: row.payment_status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    customer_name: customer?.name ?? 'Cliente',
  };
}

function mapSaleDetail(row: SaleDetailQueryRow): SaleDetail {
  const customer = unwrapRelation(row.customers);
  const receivable = unwrapRelation(row.receivables);

  return {
    id: row.id,
    customer_id: row.customer_id,
    sale_date: row.sale_date,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    total: Number(row.total),
    payment_method: row.payment_method,
    payment_status: row.payment_status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    customer_name: customer?.name ?? 'Cliente',
    items: (row.sale_items ?? []).map((item) => {
      const product = unwrapRelation(item.products);

      return {
        id: item.id,
        sale_id: item.sale_id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        total: Number(item.total),
        created_at: item.created_at,
        product_name: product?.name ?? 'Produto',
        product_category: product?.category ?? null,
        product_size: product?.size ?? null,
        product_color: product?.color ?? null,
      };
    }),
    receivable: receivable
      ? {
          id: receivable.id,
          amount: Number(receivable.amount),
          due_date: receivable.due_date,
          status: receivable.status,
        }
      : null,
  };
}

export async function findAll(
  filters: ListSalesFilters = {
    payment_status: 'all',
    payment_method: undefined,
  }
) {
  const supabase = await createClient();
  const { search, payment_method, payment_status = 'all' } = filters;

  let query = supabase
    .from('sales')
    .select(
      `
        id,
        customer_id,
        sale_date,
        subtotal,
        discount,
        total,
        payment_method,
        payment_status,
        created_at,
        updated_at,
        customers ( name )
      `
    )
    .order('sale_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (payment_status === 'paid') {
    query = query.eq('payment_status', 'paid');
  }

  if (payment_status === 'pending') {
    query = query.eq('payment_status', 'pending');
  }

  if (payment_method) {
    query = query.eq('payment_method', payment_method);
  }

  if (search) {
    const sanitized = search.replace(/[%_,]/g, ' ').trim();

    if (sanitized) {
      const term = `%${sanitized}%`;
      query = query.ilike('customers.name', term);
    }
  }

  return query.returns<SaleListQueryRow[]>();
}

export async function findByIdWithDetails(id: string) {
  const supabase = await createClient();

  return supabase
    .from('sales')
    .select(
      `
        id,
        customer_id,
        sale_date,
        subtotal,
        discount,
        total,
        payment_method,
        payment_status,
        created_at,
        updated_at,
        customers ( name ),
        sale_items (
          id,
          sale_id,
          product_id,
          quantity,
          unit_price,
          total,
          created_at,
          products ( name, category, size, color )
        ),
        receivables (
          id,
          amount,
          due_date,
          status
        )
      `
    )
    .eq('id', id)
    .maybeSingle<SaleDetailQueryRow>();
}

export async function createSaleWithItems(input: CreateSaleRpcInput) {
  const supabase = await createClient();

  return supabase.rpc('create_sale_with_items', {
    p_customer_id: input.customer_id,
    p_discount: input.discount,
    p_payment_method: input.payment_method,
    p_items: input.items,
  });
}

export { mapSaleDetail, mapSaleListRow };
