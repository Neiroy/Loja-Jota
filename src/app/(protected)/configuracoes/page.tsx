import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Preferências do sistema interno."
      />
      <EmptyState
        title="Configurações em breve"
        description="Esta área ficará disponível em uma versão futura do sistema interno da loja."
      />
    </div>
  );
}
