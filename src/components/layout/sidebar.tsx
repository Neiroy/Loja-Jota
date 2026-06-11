import { NAV_ITEMS } from '@/lib/constants/navigation';

import { SidebarNavLink } from '@/components/layout/sidebar-nav-link';

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-stone-200 bg-white lg:flex">
      <div className="flex h-14 items-center border-b border-stone-200 px-6">
        <span className="text-sm font-semibold tracking-tight text-stone-900">
          Loja Jota
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {NAV_ITEMS.map((item) => (
          <SidebarNavLink key={item.href} item={item} />
        ))}
      </nav>
    </aside>
  );
}
