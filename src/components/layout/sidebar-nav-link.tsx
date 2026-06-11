'use client';

import {
  LayoutDashboard,
  Package,
  ReceiptText,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { NavIconName, NavItem } from '@/lib/constants/navigation';
import { cn } from '@/lib/utils';

const NAV_ICONS: Record<NavIconName, LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  users: Users,
  package: Package,
  'receipt-text': ReceiptText,
  wallet: Wallet,
  settings: Settings,
};

type SidebarNavLinkProps = {
  item: NavItem;
  onNavigate?: () => void;
};

export function SidebarNavLink({ item, onNavigate }: SidebarNavLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = NAV_ICONS[item.icon];

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        isActive
          ? 'border-l-2 border-stone-900 bg-stone-100/80 pl-[10px] text-stone-900'
          : 'text-stone-500 hover:bg-stone-50/80 hover:text-stone-900'
      )}
    >
      <Icon className="size-4 shrink-0 opacity-80" />
      <span>{item.label}</span>
    </Link>
  );
}
