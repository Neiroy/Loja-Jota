import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import type { Store } from '@/types/store.types';

export async function findAll() {
  const supabase = createAdminClient();

  return supabase
    .from('stores')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<Store[]>();
}

export async function findBySlug(slug: string) {
  const supabase = createAdminClient();

  return supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .maybeSingle<Store>();
}

export async function insert(data: Pick<Store, 'name' | 'slug'>) {
  const supabase = createAdminClient();

  return supabase
    .from('stores')
    .insert({
      name: data.name,
      slug: data.slug,
      is_active: true,
    })
    .select('*')
    .single<Store>();
}

export async function deleteById(storeId: string) {
  const supabase = createAdminClient();

  return supabase.from('stores').delete().eq('id', storeId);
}

export async function countUsersByStoreId(storeId: string) {
  const supabase = createAdminClient();

  return supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('store_id', storeId);
}

export async function countUsersGroupedByStore() {
  const supabase = createAdminClient();

  return supabase
    .from('profiles')
    .select('store_id')
    .returns<Array<{ store_id: string }>>();
}
