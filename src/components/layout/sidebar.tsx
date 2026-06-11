import { SidebarNavLink } from '@/components/layout/sidebar-nav-link';
import { NAV_ITEMS } from '@/lib/constants/navigation';

function SidebarBrand() {
  return (
    <div className="flex h-14 items-center gap-3 border-b border-stone-200/80 px-5">
      <div
        aria-hidden
        className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-[11px] font-semibold tracking-wide text-white"
      >
        LJ
      </div>
      <div className="min-w-0">
        <span className="block truncate text-sm font-semibold tracking-tight text-stone-900">
          Loja Jota
        </span>
        <span className="block truncate text-[11px] text-stone-500">
          Controle interno
        </span>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-stone-200/80 bg-white lg:flex">
      <SidebarBrand />
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {NAV_ITEMS.map((item) => (
          <SidebarNavLink key={item.href} item={item} />
        ))}
      </nav>
    </aside>
  );
}
