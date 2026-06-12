import { createClient } from '@/lib/supabase/server';
import type { ListReceivablesFilters } from '@/schemas/receivable.schema';
import type {
  ReceivableDetail,
  ReceivableListRow,
  ReceivableSettlementMethod,
} from '@/types/receivable.types';

type ReceivableListQueryRow = {
  id: string;
  sale_id: string;
  customer_id: string;
  amount: number | string;
  due_date: string;
  status: ReceivableListRow['status'];
  paid_at: string | null;
  payment_method: ReceivableListRow['payment_method'];
  created_at: string;
  updated_at: string;
  customers: { name: string } | { name: string }[] | null;
  sales:
    | { sale_date: string; total: number | string }
    | { sale_date: string; total: number | string }[]
    | null;
};

type ReceivableDetailQueryRow = {
  id: string;
  sale_id: string;
  customer_id: string;
  amount: number | string;
  due_date: string;
  status: ReceivableListRow['status'];
  paid_at: string | null;
  payment_method: ReceivableListRow['payment_method'];
  notes: string | null;
  created_at: string;
  updated_at: string;
  customers: { name: string } | { name: string }[] | null;
  sales:
    | {
        sale_date: string;
        total: number | string;
        payment_status: ReceivableDetail['sale_payment_status'];
      }
    | {
        sale_date: string;
        total: number | string;
        payment_status: ReceivableDetail['sale_payment_status'];
      }[]
    | null;
};

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapReceivableListRow(row: ReceivableListQueryRow): ReceivableListRow {
  const customer = unwrapRelation(row.customers);
  const sale = unwrapRelation(row.sales);

  return {
    id: row.id,
    sale_id: row.sale_id,
    customer_id: row.customer_id,
    amount: Number(row.amount),
    due_date: row.due_date,
    status: row.status,
    paid_at: row.paid_at,
    payment_method: row.payment_method,
    created_at: row.created_at,
    updated_at: row.updated_at,
    customer_name: customer?.name ?? 'Cliente',
    sale_date: sale?.sale_date ?? '',
    sale_total: Number(sale?.total ?? 0),
  };
}

function mapReceivableDetail(row: ReceivableDetailQueryRow): ReceivableDetail {
  const customer = unwrapRelation(row.customers);
  const sale = unwrapRelation(row.sales);

  return {
    id: row.id,
    sale_id: row.sale_id,
    customer_id: row.customer_id,
    amount: Number(row.amount),
    due_date: row.due_date,
    status: row.status,
    paid_at: row.paid_at,
    payment_method: row.payment_method,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
    customer_name: customer?.name ?? 'Cliente',
    sale_date: sale?.sale_date ?? '',
    sale_total: Number(sale?.total ?? 0),
    sale_payment_status: sale?.payment_status ?? 'pending',
  };
}

export async function syncOverdue(storeId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  return supabase
    .from('receivables')
    .update({ status: 'overdue' })
    .eq('store_id', storeId)
    .eq('status', 'open')
    .lt('due_date', today);
}

export async function findAll(
  storeId: string,
  filters: ListReceivablesFilters = { status: 'all' }
) {
  const supabase = await createClient();
  const { search, status = 'all' } = filters;

  let query = supabase
    .from('receivables')
    .select(
      `
        id,
        sale_id,
        customer_id,
        amount,
        due_date,
        status,
        paid_at,
        payment_method,
        created_at,
        updated_at,
        customers ( name ),
        sales ( sale_date, total )
      `
    )
    .eq('store_id', storeId)
    .order('due_date', { ascending: true })
    .order('created_at', { ascending: false });

  if (status === 'open') {
    query = query.eq('status', 'open');
  }

  if (status === 'overdue') {
    query = query.eq('status', 'overdue');
  }

  if (status === 'paid') {
    query = query.eq('status', 'paid');
  }

  if (search) {
    const sanitized = search.replace(/[%_,]/g, ' ').trim();

    if (sanitized) {
      const term = `%${sanitized}%`;
      query = query.ilike('customers.name', term);
    }
  }

  return query.returns<ReceivableListQueryRow[]>();
}

export async function findByIdWithDetails(storeId: string, id: string) {
  const supabase = await createClient();

  return supabase
    .from('receivables')
    .select(
      `
        id,
        sale_id,
        customer_id,
        amount,
        due_date,
        status,
        paid_at,
        payment_method,
        notes,
        created_at,
        updated_at,
        customers ( name ),
        sales ( sale_date, total, payment_status )
      `
    )
    .eq('id', id)
    .eq('store_id', storeId)
    .maybeSingle<ReceivableDetailQueryRow>();
}

export async function markAsPaid(
  receivableId: string,
  paymentMethod: ReceivableSettlementMethod
) {
  const supabase = await createClient();

  return supabase.rpc('mark_receivable_as_paid', {
    p_receivable_id: receivableId,
    p_payment_method: paymentMethod,
  });
}

export { mapReceivableDetail, mapReceivableListRow };
