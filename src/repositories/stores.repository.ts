import { createClient } from '@/lib/supabase/server';
import type { Store } from '@/types/store.types';

export async function findById(storeId: string) {
  const supabase = await createClient();

  return supabase
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .maybeSingle<Store>();
}
