import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import type { ProfileRole } from '@/types/profile.types';

export type CreateAuthUserInput = {
  email: string;
  password: string;
  fullName: string;
  role: ProfileRole;
  storeId: string;
};

export async function createUser(input: CreateAuthUserInput) {
  const supabase = createAdminClient();

  return supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      full_name: input.fullName,
      store_id: input.storeId,
      role: input.role,
    },
  });
}

export async function deleteUser(userId: string) {
  const supabase = createAdminClient();

  return supabase.auth.admin.deleteUser(userId);
}
