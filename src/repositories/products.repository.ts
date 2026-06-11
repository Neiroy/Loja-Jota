import { createClient } from '@/lib/supabase/server';
import type {
  Product,
  ProductInsert,
  ProductUpdate,
} from '@/types/product.types';
import type { ProductStatusFilter } from '@/schemas/product.schema';

export type FindAllProductsParams = {
  search?: string;
  status?: ProductStatusFilter;
};

export async function findAll(params: FindAllProductsParams = {}) {
  const supabase = await createClient();
  const { search, status = 'all' } = params;

  let query = supabase
    .from('products')
    .select('*')
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

      query = query.or(
        `name.ilike.${term},category.ilike.${term},size.ilike.${term},color.ilike.${term}`
      );
    }
  }

  return query.returns<Product[]>();
}

export async function findById(id: string) {
  const supabase = await createClient();

  return supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle<Product>();
}

export async function insert(data: ProductInsert) {
  const supabase = await createClient();

  return supabase.from('products').insert(data).select('*').single<Product>();
}

export async function update(id: string, data: ProductUpdate) {
  const supabase = await createClient();

  return supabase
    .from('products')
    .update(data)
    .eq('id', id)
    .select('*')
    .single<Product>();
}
