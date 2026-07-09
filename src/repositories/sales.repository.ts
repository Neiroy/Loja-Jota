import { createClient } from '@/lib/supabase/server';
import type { ListSalesFilters } from '@/schemas/sale.schema';
import type {
  CreateSaleRpcInput,
  SaleDetail,
  SaleListRow,
  SaleReceivableSummary,
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
  card_payment_type: SaleListRow['card_payment_type'];
  installments_count: SaleListRow['installments_count'];
  down_payment: number | string;
  financing_installments_count: SaleListRow['financing_installments_count'];
  created_at: string;
  updated_at: string;
  customers: { name: string } | { name: string }[] | null;
};

type SaleReceivableQueryRow = {
  id: string;
  amount: number | string;
  due_date: string;
  status: SaleReceivableSummary['status'];
  installment_number: number;
  installments_total: number;
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
  card_payment_type: SaleDetail['card_payment_type'];
  installments_count: SaleDetail['installments_count'];
  down_payment: number | string;
  financing_installments_count: SaleDetail['financing_installments_count'];
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
  receivables: SaleReceivableQueryRow[] | null;
};

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapReceivableSummary(
  row: SaleReceivableQueryRow
): SaleReceivableSummary {
  return {
    id: row.id,
    amount: Number(row.amount),
    due_date: row.due_date,
    status: row.status,
    installment_number: row.installment_number,
    installments_total: row.installments_total,
  };
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
    card_payment_type: row.card_payment_type,
    installments_count: row.installments_count,
    down_payment: Number(row.down_payment),
    financing_installments_count: row.financing_installments_count,
    created_at: row.created_at,
    updated_at: row.updated_at,
    customer_name: customer?.name ?? 'Cliente',
  };
}

function mapSaleDetail(row: SaleDetailQueryRow): SaleDetail {
  const customer = unwrapRelation(row.customers);
  const receivables = [...(row.receivables ?? [])].sort(
    (left, right) => left.installment_number - right.installment_number
  );

  return {
    id: row.id,
    customer_id: row.customer_id,
    sale_date: row.sale_date,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    total: Number(row.total),
    payment_method: row.payment_method,
    payment_status: row.payment_status,
    card_payment_type: row.card_payment_type,
    installments_count: row.installments_count,
    down_payment: Number(row.down_payment),
    financing_installments_count: row.financing_installments_count,
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
    receivables: receivables.map(mapReceivableSummary),
  };
}

export async function findAll(
  storeId: string,
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
        card_payment_type,
        installments_count,
        down_payment,
        financing_installments_count,
        created_at,
        updated_at,
        customers ( name )
      `
    )
    .eq('store_id', storeId)
    .order('sale_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (payment_status === 'paid') {
    query = query.eq('payment_status', 'paid');
  }

  if (payment_status === 'pending') {
    query = query.in('payment_status', ['pending', 'partially_paid']);
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

export async function findByIdWithDetails(storeId: string, id: string) {
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
        card_payment_type,
        installments_count,
        down_payment,
        financing_installments_count,
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
          status,
          installment_number,
          installments_total
        )
      `
    )
    .eq('id', id)
    .eq('store_id', storeId)
    .maybeSingle<SaleDetailQueryRow>();
}

export async function createSaleWithItems(input: CreateSaleRpcInput) {
  const supabase = await createClient();

  return supabase.rpc('create_sale_with_items', {
    p_customer_id: input.customer_id,
    p_discount: input.discount,
    p_payment_method: input.payment_method,
    p_items: input.items,
    p_card_payment_type: input.card_payment_type,
    p_installments_count: input.installments_count,
    p_down_payment: input.down_payment,
    p_financing_installments_count: input.financing_installments_count,
  });
}

export async function cancelSale(saleId: string) {
  const supabase = await createClient();

  return supabase.rpc('cancel_sale', {
    p_sale_id: saleId,
  });
}

export { mapSaleDetail, mapSaleListRow };
