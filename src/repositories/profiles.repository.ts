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

/**
 * Atualiza apenas full_name no login.
 * Não cria profile sem store_id e não altera role/store_id.
 */
export async function syncFullNameOnLogin(id: string, fullName: string) {
  const supabase = await createClient();
  const { data: existing, error: findError } = await findById(id);

  if (findError) {
    return { data: null, error: findError };
  }

  if (!existing) {
    return {
      data: null,
      error: {
        message: 'Perfil não encontrado para o usuário autenticado.',
        code: 'PROFILE_NOT_FOUND',
      },
    };
  }

  return supabase
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', id)
    .select('*')
    .maybeSingle<Profile>();
}

/** @deprecated Use syncFullNameOnLogin */
export async function upsertOnLogin(id: string, fullName: string) {
  return syncFullNameOnLogin(id, fullName);
}
