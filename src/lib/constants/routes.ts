export const PUBLIC_ROUTES = ['/login', '/auth/callback'] as const;

export const PROTECTED_ROUTE_PREFIXES = [
  '/dashboard',
  '/clientes',
  '/produtos',
  '/vendas',
  '/fiados',
  '/configuracoes',
] as const;

export const DEFAULT_AUTHENTICATED_ROUTE = '/dashboard';
export const DEFAULT_UNAUTHENTICATED_ROUTE = '/login';
