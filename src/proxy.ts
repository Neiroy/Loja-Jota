import { type NextRequest, NextResponse } from 'next/server';

import {
  DEFAULT_AUTHENTICATED_ROUTE,
  DEFAULT_UNAUTHENTICATED_ROUTE,
  PROTECTED_ROUTE_PREFIXES,
} from '@/lib/constants/routes';
import { updateSession } from '@/lib/supabase/middleware';

function isProtectedRoute(pathname: string) {
  return (
    pathname === '/' ||
    PROTECTED_ROUTE_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { supabaseResponse, user } = await updateSession(request);

  if (user && pathname === DEFAULT_UNAUTHENTICATED_ROUTE) {
    return NextResponse.redirect(
      new URL(DEFAULT_AUTHENTICATED_ROUTE, request.url)
    );
  }

  if (!user && isProtectedRoute(pathname)) {
    const redirectUrl = new URL(DEFAULT_UNAUTHENTICATED_ROUTE, request.url);

    if (pathname !== '/') {
      redirectUrl.searchParams.set('redirectTo', pathname);
    }

    return NextResponse.redirect(redirectUrl);
  }

  if (pathname === '/') {
    const destination = user
      ? DEFAULT_AUTHENTICATED_ROUTE
      : DEFAULT_UNAUTHENTICATED_ROUTE;

    return NextResponse.redirect(new URL(destination, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
