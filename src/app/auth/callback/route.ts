import { NextResponse } from 'next/server';

import { getSafeRedirectPath } from '@/lib/auth/get-safe-redirect-path';
import { ensureValidSessionOrSignOut } from '@/lib/auth/ensure-valid-session';
import { DEFAULT_AUTHENTICATED_ROUTE } from '@/lib/constants/routes';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = getSafeRedirectPath(
    searchParams.get('next') ?? DEFAULT_AUTHENTICATED_ROUTE
  );

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const session = await ensureValidSessionOrSignOut();

      if (session.valid) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      return NextResponse.redirect(`${origin}/login?error=no_store`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
