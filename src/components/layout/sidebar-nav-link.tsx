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
        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-stone-900 text-white shadow-[0_1px_2px_rgba(28,25,23,0.12),0_4px_12px_rgba(28,25,23,0.1)]'
          : 'text-stone-600 hover:bg-stone-900/[0.04] hover:text-stone-900'
      )}
    >
      <Icon
        className={cn(
          'size-[1.125rem] shrink-0 transition-colors',
          isActive
            ? 'text-white/90'
            : 'text-stone-400 group-hover:text-stone-600'
        )}
      />
      <span className="tracking-tight">{item.label}</span>
    </Link>
  );
}
