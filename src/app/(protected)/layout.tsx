import { redirect } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { AppToaster } from '@/components/providers/app-toaster';
import { ensureValidSessionOrSignOut } from '@/lib/auth/ensure-valid-session';

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await ensureValidSessionOrSignOut();

  if (!session.valid) {
    redirect('/login?error=no_store');
  }

  return (
    <>
      <AppShell>{children}</AppShell>
      <AppToaster />
    </>
  );
}
