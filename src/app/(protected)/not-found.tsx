import Link from 'next/link';

import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ProtectedNotFound() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Página não encontrada"
        description="O endereço acessado não existe ou o registro foi removido."
      />
      <EmptyState
        title="Conteúdo indisponível"
        description="Verifique o link ou volte para o painel principal da loja."
        action={
          <Link href="/dashboard" className={cn(buttonVariants())}>
            Ir para o dashboard
          </Link>
        }
      />
    </div>
  );
}
