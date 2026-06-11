import { logout } from '@/features/auth/actions/auth.actions';
import { LogoutButton } from '@/components/layout/logout-button';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-stone-200/80 bg-white/80 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-white/70 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <MobileSidebar />
        <span className="truncate text-sm font-semibold tracking-tight text-stone-900 lg:hidden">
          Loja Jota
        </span>
      </div>
      <form action={logout}>
        <LogoutButton />
      </form>
    </header>
  );
}
