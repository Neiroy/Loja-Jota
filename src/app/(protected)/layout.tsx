import { redirect } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { AppToaster } from '@/components/providers/app-toaster';
import { ensureValidSessionOrSignOut } from '@/lib/auth/ensure-valid-session';
import { getLoginRedirectForSessionReason } from '@/lib/auth/login-error-messages';

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await ensureValidSessionOrSignOut();

  if (!session.valid) {
    redirect(getLoginRedirectForSessionReason(session.reason));
  }

  return (
    <>
      <AppShell>{children}</AppShell>
      <AppToaster />
    </>
  );
}
