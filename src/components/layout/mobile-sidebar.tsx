'use client';

import { MenuIcon } from 'lucide-react';
import { useState } from 'react';

import { SidebarNavLink } from '@/components/layout/sidebar-nav-link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { NAV_ITEMS } from '@/lib/constants/navigation';

export function MobileSidebar() {
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
            <div
              aria-hidden
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-stone-900 text-xs font-semibold tracking-wide text-white shadow-[0_2px_8px_rgba(28,25,23,0.2)]"
            >
              LJ
            </div>
            <div className="min-w-0">
              <SheetTitle className="truncate text-sm font-semibold tracking-tight text-stone-900">
                Loja Jota
              </SheetTitle>
              <p className="truncate text-[11px] font-normal text-stone-500">
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
