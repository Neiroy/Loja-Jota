import { Suspense } from 'react';

import { AuthCard } from '@/components/shared/auth-card';
import { LoginForm } from '@/features/auth/components/login-form';

export default function LoginPage() {
  return (
    <AuthCard
      title="Sistema Controle Loja Jota"
      description="Acesso interno da loja"
    >
      <Suspense
        fallback={
          <p className="text-muted-foreground text-center text-sm">
            Carregando...
          </p>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
