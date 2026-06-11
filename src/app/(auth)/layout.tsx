export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background flex min-h-screen flex-1 items-center justify-center p-6">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
