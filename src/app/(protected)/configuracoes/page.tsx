import { PageHeader } from '@/components/layout/page-header';
import { getSettingsOverview } from '@/features/settings/actions/settings.actions';
import { SettingsOverview } from '@/features/settings/components/settings-overview';

export default async function ConfiguracoesPage() {
  const overview = await getSettingsOverview();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Preferências e informações do sistema interno da loja."
      />
      <SettingsOverview overview={overview} />
    </div>
  );
}
