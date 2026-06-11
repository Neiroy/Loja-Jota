import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types/profile.types';

export async function findById(id: string) {
  const supabase = await createClient();

  return supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle<Profile>();
}

export async function upsertOnLogin(id: string, fullName: string) {
  const supabase = await createClient();

  return supabase.from('profiles').upsert(
    {
      id,
      full_name: fullName,
      role: 'operator',
    },
    { onConflict: 'id' }
  );
}
