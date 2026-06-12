import { createClient } from '@/lib/supabase/server';
import type {
  Customer,
  CustomerInsert,
  CustomerUpdate,
} from '@/types/customer.types';
import type { CustomerStatusFilter } from '@/schemas/customer.schema';

export type FindAllCustomersParams = {
  search?: string;
  status?: CustomerStatusFilter;
};

export async function findAll(
  storeId: string,
  params: FindAllCustomersParams = {}
) {
  const supabase = await createClient();
  const { search, status = 'all' } = params;

  let query = supabase
    .from('customers')
    .select('*')
    .eq('store_id', storeId)
    .order('name', { ascending: true });

  if (status === 'active') {
    query = query.eq('is_active', true);
  }

  if (status === 'inactive') {
    query = query.eq('is_active', false);
  }

  if (search) {
    const sanitized = search.replace(/[%_,]/g, ' ').trim();

    if (sanitized) {
      const term = `%${sanitized}%`;
      const digitsOnly = sanitized.replace(/\D/g, '');
      const cpfTerm = digitsOnly.length > 0 ? `%${digitsOnly}%` : term;

      query = query.or(
        `name.ilike.${term},phone.ilike.${term},cpf.ilike.${cpfTerm}`
      );
    }
  }

  return query.returns<Customer[]>();
}

export async function findById(storeId: string, id: string) {
  const supabase = await createClient();

  return supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .eq('store_id', storeId)
    .maybeSingle<Customer>();
}

export async function insert(storeId: string, data: CustomerInsert) {
  const supabase = await createClient();

  return supabase
    .from('customers')
    .insert({ ...data, store_id: storeId })
    .select('*')
    .single<Customer>();
}

export async function update(
  storeId: string,
  id: string,
  data: CustomerUpdate
) {
  const supabase = await createClient();

  return supabase
    .from('customers')
    .update(data)
    .eq('id', id)
    .eq('store_id', storeId)
    .select('*')
    .single<Customer>();
}

export async function hasFinancialLinks(storeId: string, customerId: string) {
  const supabase = await createClient();

  const [salesResult, receivablesResult] = await Promise.all([
    supabase
      .from('sales')
      .select('id', { count: 'exact', head: true })
      .eq('store_id', storeId)
      .eq('customer_id', customerId),
    supabase
      .from('receivables')
      .select('id', { count: 'exact', head: true })
      .eq('store_id', storeId)
      .eq('customer_id', customerId),
  ]);

  if (salesResult.error) {
    return { hasLinks: false, error: salesResult.error };
  }

  if (receivablesResult.error) {
    return { hasLinks: false, error: receivablesResult.error };
  }

  const salesCount = salesResult.count ?? 0;
  const receivablesCount = receivablesResult.count ?? 0;

  return {
    hasLinks: salesCount > 0 || receivablesCount > 0,
    error: null,
  };
}

export async function deleteById(storeId: string, id: string) {
  const supabase = await createClient();

  return supabase
    .from('customers')
    .delete()
    .eq('id', id)
    .eq('store_id', storeId)
    .select('id')
    .single<{ id: string }>();
}
