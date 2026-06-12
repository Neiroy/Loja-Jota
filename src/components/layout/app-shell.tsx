import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import {
  getCurrentStoreDisplayName,
  getStoreMonogram,
} from '@/lib/tenant/get-current-store';

type AppShellProps = {
  children: React.ReactNode;
};

export async function AppShell({ children }: AppShellProps) {
  const storeName = await getCurrentStoreDisplayName();
  const storeMonogram = getStoreMonogram(storeName);

  return (
    <div className="bg-background flex min-h-screen">
      <Sidebar storeName={storeName} storeMonogram={storeMonogram} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar storeName={storeName} storeMonogram={storeMonogram} />
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto w-full max-w-[100rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
