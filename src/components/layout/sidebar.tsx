import { SidebarNavLink } from '@/components/layout/sidebar-nav-link';
import { StoreBrandMark } from '@/components/layout/store-brand-mark';
import { NAV_ITEMS } from '@/lib/constants/navigation';

type SidebarBrandProps = {
  storeName: string;
  storeMonogram: string;
  logoUrl?: string | null;
};

function SidebarBrand({
  storeName,
  storeMonogram,
  logoUrl,
}: SidebarBrandProps) {
  return (
    <div className="flex h-16 items-center gap-3.5 border-b border-stone-200/60 px-5 lg:h-[4.75rem]">
      <StoreBrandMark
        storeName={storeName}
        storeMonogram={storeMonogram}
        logoUrl={logoUrl}
        size="sidebar"
      />
      <div className="min-w-0">
        <span className="block truncate text-base font-semibold tracking-tight text-stone-950">
          {storeName}
        </span>
        <span className="block truncate text-[13px] leading-tight text-stone-500">
          Controle interno
        </span>
      </div>
    </div>
  );
}

type SidebarProps = {
  storeName: string;
  storeMonogram: string;
  logoUrl?: string | null;
};

export function Sidebar({ storeName, storeMonogram, logoUrl }: SidebarProps) {
  return (
    <aside className="hidden w-[17rem] shrink-0 flex-col border-r border-stone-200/60 bg-white/95 shadow-[1px_0_24px_rgba(28,25,23,0.03)] lg:flex">
      <SidebarBrand
        storeName={storeName}
        storeMonogram={storeMonogram}
        logoUrl={logoUrl}
      />
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {NAV_ITEMS.map((item) => (
          <SidebarNavLink key={item.href} item={item} />
        ))}
      </nav>
    </aside>
  );
}
