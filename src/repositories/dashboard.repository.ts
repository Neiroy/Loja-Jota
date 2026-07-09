import { createClient } from '@/lib/supabase/server';

type SalesTotalRow = {
  total: number | string;
};

type ReceivableAmountRow = {
  amount: number | string;
};

type DebtorCustomerRow = {
  customer_id: string;
};

type UpcomingReceivableQueryRow = {
  id: string;
  amount: number | string;
  due_date: string;
  status: 'open';
  customers: { name: string } | { name: string }[] | null;
};

type RecentSaleQueryRow = {
  id: string;
  total: number | string;
  sale_date: string;
  payment_method: RecentSaleQueryRowPaymentMethod;
  payment_status: RecentSaleQueryRowPaymentStatus;
  card_payment_type: import('@/types/database.types').CardPaymentType | null;
  installments_count: number | null;
  customers: { name: string } | { name: string }[] | null;
};

type RecentSaleQueryRowPaymentMethod =
  import('@/types/database.types').PaymentMethod;

type RecentSaleQueryRowPaymentStatus =
  import('@/types/database.types').SalePaymentStatus;

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function findSalesTotalsBetweenDates(
  storeId: string,
  startDate: string,
  endDate: string
) {
  const supabase = await createClient();

  return supabase
    .from('sales')
    .select('total')
    .eq('store_id', storeId)
    .gte('sale_date', startDate)
    .lte('sale_date', endDate)
    .neq('payment_status', 'cancelled')
    .returns<SalesTotalRow[]>();
}

export async function findOpenReceivableAmounts(storeId: string) {
  const supabase = await createClient();

  return supabase
    .from('receivables')
    .select('amount')
    .eq('store_id', storeId)
    .eq('status', 'open')
    .returns<ReceivableAmountRow[]>();
}

export async function findOverdueReceivableAmounts(storeId: string) {
  const supabase = await createClient();

  return supabase
    .from('receivables')
    .select('amount')
    .eq('store_id', storeId)
    .eq('status', 'overdue')
    .returns<ReceivableAmountRow[]>();
}

export async function findDebtorCustomerIds(storeId: string) {
  const supabase = await createClient();

  return supabase
    .from('receivables')
    .select('customer_id')
    .eq('store_id', storeId)
    .in('status', ['open', 'overdue'])
    .returns<DebtorCustomerRow[]>();
}

export async function findUpcomingReceivables(
  storeId: string,
  startDate: string,
  endDate: string,
  limit: number
) {
  const supabase = await createClient();

  return supabase
    .from('receivables')
    .select(
      `
        id,
        amount,
        due_date,
        status,
        customers ( name )
      `
    )
    .eq('store_id', storeId)
    .eq('status', 'open')
    .gte('due_date', startDate)
    .lte('due_date', endDate)
    .order('due_date', { ascending: true })
    .limit(limit)
    .returns<UpcomingReceivableQueryRow[]>();
}

export async function findRecentSales(storeId: string, limit: number) {
  const supabase = await createClient();

  return supabase
    .from('sales')
    .select(
      `
        id,
        total,
        sale_date,
        payment_method,
        payment_status,
        card_payment_type,
        installments_count,
        customers ( name )
      `
    )
    .eq('store_id', storeId)
    .neq('payment_status', 'cancelled')
    .order('sale_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)
    .returns<RecentSaleQueryRow[]>();
}

export function mapUpcomingReceivableRow(row: UpcomingReceivableQueryRow) {
  const customer = unwrapRelation(row.customers);

  return {
    id: row.id,
    customer_name: customer?.name ?? 'Cliente',
    amount: Number(row.amount),
    due_date: row.due_date,
    status: row.status,
  };
}

export function mapRecentSaleRow(row: RecentSaleQueryRow) {
  const customer = unwrapRelation(row.customers);

  return {
    id: row.id,
    customer_name: customer?.name ?? 'Cliente',
    total: Number(row.total),
    sale_date: row.sale_date,
    payment_method: row.payment_method,
    payment_status: row.payment_status,
    card_payment_type: row.card_payment_type,
    installments_count: row.installments_count,
  };
}

export function sumAmounts(rows: Array<{ amount: number | string }>) {
  return rows.reduce((sum, row) => sum + Number(row.amount), 0);
}

export function sumTotals(rows: Array<{ total: number | string }>) {
  return rows.reduce((sum, row) => sum + Number(row.total), 0);
}
