import {
  DEFAULT_AUTHENTICATED_ROUTE,
  PROTECTED_ROUTE_PREFIXES,
} from '@/lib/constants/routes';

export function getSafeRedirectPath(path: string | null | undefined) {
  if (!path || !path.startsWith('/')) {
    return DEFAULT_AUTHENTICATED_ROUTE;
  }

  if (path.startsWith('//')) {
    return DEFAULT_AUTHENTICATED_ROUTE;
  }

  const isAllowed = PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );

  return isAllowed ? path : DEFAULT_AUTHENTICATED_ROUTE;
}
