'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useActionState, useEffect } from 'react';

import { loginAction } from '@/features/auth/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DEFAULT_AUTHENTICATED_ROUTE,
  PROTECTED_ROUTE_PREFIXES,
} from '@/lib/constants/routes';

function getSafeRedirectPath(path: string | null) {
  if (!path || !path.startsWith('/')) {
    return DEFAULT_AUTHENTICATED_ROUTE;
  }

  const isAllowed = PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );

  return isAllowed ? path : DEFAULT_AUTHENTICATED_ROUTE;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirectPath(searchParams.get('redirectTo'));

  const [state, formAction, isPending] = useActionState(loginAction, null);

  useEffect(() => {
    if (state?.success) {
      router.push(redirectTo);
      router.refresh();
    }
  }, [state, router, redirectTo]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="h-11"
          placeholder="seu@email.com"
          aria-invalid={Boolean(state?.fieldErrors?.email)}
          disabled={isPending}
          required
        />
        {state?.fieldErrors?.email ? (
          <p className="text-destructive text-sm">
            {state.fieldErrors.email[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="h-11"
          placeholder="••••••••"
          aria-invalid={Boolean(state?.fieldErrors?.password)}
          disabled={isPending}
          required
        />
        {state?.fieldErrors?.password ? (
          <p className="text-destructive text-sm">
            {state.fieldErrors.password[0]}
          </p>
        ) : null}
      </div>

      {state?.error ? (
        <p className="text-destructive text-sm">{state.error}</p>
      ) : null}

      <Button
        type="submit"
        className="h-11 w-full text-base shadow-sm"
        disabled={isPending}
      >
        {isPending ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  );
}
