import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { getCurrentStoreBranding } from '@/lib/tenant/get-current-store';

type AppShellProps = {
  children: React.ReactNode;
};

export async function AppShell({ children }: AppShellProps) {
  const branding = await getCurrentStoreBranding();

  return (
    <div className="bg-background flex min-h-screen">
      <Sidebar
        storeName={branding.storeName}
        storeMonogram={branding.storeMonogram}
        logoUrl={branding.logoUrl}
      />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar
          storeName={branding.storeName}
          storeMonogram={branding.storeMonogram}
          logoUrl={branding.logoUrl}
        />
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto w-full max-w-[100rem] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 xl:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
