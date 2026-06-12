import { SidebarNavLink } from '@/components/layout/sidebar-nav-link';
import { NAV_ITEMS } from '@/lib/constants/navigation';

type SidebarBrandProps = {
  storeName: string;
  storeMonogram: string;
};

function SidebarBrand({ storeName, storeMonogram }: SidebarBrandProps) {
  return (
    <div className="flex h-[4.25rem] items-center gap-3.5 border-b border-stone-200/60 px-5">
      <div
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-stone-900 text-xs font-semibold tracking-wide text-white shadow-[0_2px_8px_rgba(28,25,23,0.2)]"
      >
        {storeMonogram}
      </div>
      <div className="min-w-0">
        <span className="block truncate text-sm font-semibold tracking-tight text-stone-900">
          {storeName}
        </span>
        <span className="block truncate text-[11px] text-stone-500">
          Controle interno
        </span>
      </div>
    </div>
  );
}

type SidebarProps = {
  storeName: string;
  storeMonogram: string;
};

export function Sidebar({ storeName, storeMonogram }: SidebarProps) {
  return (
    <aside className="hidden w-[17rem] shrink-0 flex-col border-r border-stone-200/60 bg-white/95 shadow-[1px_0_24px_rgba(28,25,23,0.03)] lg:flex">
      <SidebarBrand storeName={storeName} storeMonogram={storeMonogram} />
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {NAV_ITEMS.map((item) => (
          <SidebarNavLink key={item.href} item={item} />
        ))}
      </nav>
    </aside>
  );
}
