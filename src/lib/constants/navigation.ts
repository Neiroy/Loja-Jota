export type NavIconName =
  | 'layout-dashboard'
  | 'users'
  | 'package'
  | 'receipt-text'
  | 'wallet'
  | 'settings';

export type NavItem = {
  label: string;
  href: string;
  icon: NavIconName;
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'layout-dashboard',
  },
  {
    label: 'Clientes',
    href: '/clientes',
    icon: 'users',
  },
  {
    label: 'Produtos',
    href: '/produtos',
    icon: 'package',
  },
  {
    label: 'Vendas',
    href: '/vendas',
    icon: 'receipt-text',
  },
  {
    label: 'Fiados',
    href: '/fiados',
    icon: 'wallet',
  },
  {
    label: 'Configurações',
    href: '/configuracoes',
    icon: 'settings',
  },
];
