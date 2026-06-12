import { Suspense } from 'react';

import { AuthCard } from '@/components/shared/auth-card';
import { LoginForm } from '@/features/auth/components/login-form';

export default function LoginPage() {
  return (
    <AuthCard
      title="Controle de Vendas"
      description="Acesso ao painel interno de controle"
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
