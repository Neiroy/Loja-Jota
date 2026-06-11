import { logout } from '@/features/auth/actions/auth.actions';
import { LogoutButton } from '@/components/layout/logout-button';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-[3.75rem] shrink-0 items-center justify-between border-b border-stone-200/60 bg-white/75 px-4 backdrop-blur-lg supports-[backdrop-filter]:bg-white/65 sm:px-6 lg:px-8">
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
