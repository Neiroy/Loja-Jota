import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import type { Profile, ProfileRole } from '@/types/profile.types';

export type EnsureProfileInput = {
  id: string;
  full_name: string;
  role: ProfileRole;
  store_id: string;
};

export async function findById(id: string) {
  const supabase = createAdminClient();

  return supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle<Profile>();
}

export async function ensureProfile(input: EnsureProfileInput) {
  const supabase = createAdminClient();
  const { data: existing, error: findError } = await findById(input.id);

  if (findError) {
    return { data: null, error: findError };
  }

  if (existing) {
    if (
      existing.store_id !== input.store_id ||
      existing.role !== input.role ||
      existing.full_name !== input.full_name
    ) {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: input.full_name,
          role: input.role,
          store_id: input.store_id,
        })
        .eq('id', input.id)
        .select('*')
        .single<Profile>();

      return { data, error };
    }

    return { data: existing, error: null };
  }

  return supabase
    .from('profiles')
    .insert({
      id: input.id,
      full_name: input.full_name,
      role: input.role,
      store_id: input.store_id,
    })
    .select('*')
    .single<Profile>();
}

export async function deleteById(id: string) {
  const supabase = createAdminClient();

  return supabase.from('profiles').delete().eq('id', id);
}
