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
            className="shrink-0 lg:hidden"
            aria-label="Abrir menu"
          />
        }
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(18rem,85vw)] gap-0 p-0">
        <SheetHeader className="space-y-0 border-b border-stone-200/80 px-5 py-4 text-left">
          <div className="flex items-center gap-3">
            <div
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-[11px] font-semibold tracking-wide text-white"
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
        <nav className="flex flex-col gap-0.5 overflow-y-auto p-3">
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
