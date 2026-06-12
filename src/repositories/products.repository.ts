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

export async function findAll(
  storeId: string,
  params: FindAllProductsParams = {}
) {
  const supabase = await createClient();
  const { search, status = 'all' } = params;

  let query = supabase
    .from('products')
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

      query = query.or(
        `name.ilike.${term},category.ilike.${term},size.ilike.${term},color.ilike.${term}`
      );
    }
  }

  return query.returns<Product[]>();
}

export async function findById(storeId: string, id: string) {
  const supabase = await createClient();

  return supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('store_id', storeId)
    .maybeSingle<Product>();
}

export async function insert(storeId: string, data: ProductInsert) {
  const supabase = await createClient();

  return supabase
    .from('products')
    .insert({ ...data, store_id: storeId })
    .select('*')
    .single<Product>();
}

export async function update(storeId: string, id: string, data: ProductUpdate) {
  const supabase = await createClient();

  return supabase
    .from('products')
    .update(data)
    .eq('id', id)
    .eq('store_id', storeId)
    .select('*')
    .single<Product>();
}

export async function hasSaleLinks(storeId: string, productId: string) {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('sale_items')
    .select('id', { count: 'exact', head: true })
    .eq('store_id', storeId)
    .eq('product_id', productId);

  if (error) {
    return { hasLinks: false, error };
  }

  return {
    hasLinks: (count ?? 0) > 0,
    error: null,
  };
}

export async function deleteById(storeId: string, id: string) {
  const supabase = await createClient();

  return supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('store_id', storeId);
}
