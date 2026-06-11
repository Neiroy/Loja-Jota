import { createClient } from '@/lib/supabase/server';

export async function signInWithPassword(email: string, password: string) {
  const supabase = await createClient();

  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const supabase = await createClient();

  return supabase.auth.signOut();
}

export async function getUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { user, error };
}
