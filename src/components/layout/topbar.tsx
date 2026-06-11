import { logout } from '@/features/auth/actions/auth.actions';
import { LogoutButton } from '@/components/layout/logout-button';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-stone-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <span className="text-sm font-medium text-stone-900 lg:hidden">
          Loja Jota
        </span>
      </div>
      <form action={logout}>
        <LogoutButton />
      </form>
    </header>
  );
}
