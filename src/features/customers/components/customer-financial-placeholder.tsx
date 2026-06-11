import Link from 'next/link';

import { EmptyState } from '@/components/shared/empty-state';
import { FormSection } from '@/components/shared/form-section';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CustomerFinancialPlaceholder() {
  return (
    <FormSection
      title="Histórico financeiro"
      description="Vendas e fiados vinculados a este cliente."
    >
      <EmptyState
        title="Consulta nos módulos principais"
        description="O histórico detalhado por cliente permanece centralizado em Vendas e Fiados. Use os módulos abaixo para consultar registros deste cliente."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/vendas"
              className={cn(buttonVariants({ variant: 'outline' }))}
            >
              Ver vendas
            </Link>
            <Link
              href="/fiados"
              className={cn(buttonVariants({ variant: 'outline' }))}
            >
              Ver fiados
            </Link>
          </div>
        }
      />
    </FormSection>
  );
}
