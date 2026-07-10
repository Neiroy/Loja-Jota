import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sistema Controle de Vendas',
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="auth-shell grid min-h-[100dvh] place-items-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-[28rem] -translate-y-[min(4vh,2.5rem)]">
        {children}
      </div>
    </div>
  );
}
