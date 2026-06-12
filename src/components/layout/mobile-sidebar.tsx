'use client';

import { MenuIcon } from 'lucide-react';
import { useState } from 'react';

import { SidebarNavLink } from '@/components/layout/sidebar-nav-link';
import { StoreBrandMark } from '@/components/layout/store-brand-mark';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { NAV_ITEMS } from '@/lib/constants/navigation';

type MobileSidebarProps = {
  storeName: string;
  storeMonogram: string;
  logoUrl?: string | null;
};

export function MobileSidebar({
  storeName,
  storeMonogram,
  logoUrl,
}: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-stone-600 lg:hidden"
            aria-label="Abrir menu"
          />
        }
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(18rem,88vw)] gap-0 p-0">
        <SheetHeader className="space-y-0 border-b border-stone-200/60 px-5 py-5 text-left">
          <div className="flex items-center gap-3.5">
            <StoreBrandMark
              storeName={storeName}
              storeMonogram={storeMonogram}
              logoUrl={logoUrl}
              size="sidebar"
            />
            <div className="min-w-0">
              <SheetTitle className="truncate text-base font-semibold tracking-tight text-stone-950">
                {storeName}
              </SheetTitle>
              <p className="truncate text-[13px] leading-tight font-normal text-stone-500">
                Controle interno
              </p>
            </div>
          </div>
        </SheetHeader>
        <nav className="flex flex-col gap-1 overflow-y-auto p-4">
          {NAV_ITEMS.map((item) => (
            <SidebarNavLink
              key={item.href}
              item={item}
              onNavigate={() => setOpen(false)}
            />
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
