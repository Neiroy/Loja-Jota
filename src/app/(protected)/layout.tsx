import { AppShell } from '@/components/layout/app-shell';
import { AppToaster } from '@/components/providers/app-toaster';

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AppShell>{children}</AppShell>
      <AppToaster />
    </>
  );
}
