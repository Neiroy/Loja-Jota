import { PageHeader } from '@/components/layout/page-header';
import { ListErrorAlert } from '@/components/shared/list-error-alert';
import { getDashboardSnapshot } from '@/features/dashboard/actions/dashboard.actions';
import { DashboardKpiGrid } from '@/features/dashboard/components/dashboard-kpi-grid';
import { DashboardSection } from '@/features/dashboard/components/dashboard-section';
import { RecentSalesCard } from '@/features/dashboard/components/recent-sales-card';
import { UpcomingReceivablesCard } from '@/features/dashboard/components/upcoming-receivables-card';
import { surfaceMutedClassName } from '@/lib/surface';
import { cn } from '@/lib/utils';

export default async function DashboardPage() {
  const { snapshot, error } = await getDashboardSnapshot();

  return (
    <div className="page-stack w-full">
      <PageHeader
        title="Dashboard"
        description="Visão geral da operação interna da loja."
      />

      <div
        className={cn(
          surfaceMutedClassName,
          'rounded-xl border border-stone-200/60 px-6 py-4 text-sm text-stone-600'
        )}
      >
        Painel operacional com indicadores de vendas, fiados e movimentação
        recente da loja.
      </div>

      {error ? <ListErrorAlert message={error} /> : null}

      <DashboardKpiGrid kpis={snapshot.kpis} />

      <div className="grid w-full items-stretch gap-6 xl:grid-cols-2 xl:gap-8">
        <DashboardSection title="Fiados próximos do vencimento" href="/fiados">
          <UpcomingReceivablesCard receivables={snapshot.upcomingReceivables} />
        </DashboardSection>

        <DashboardSection title="Vendas recentes" href="/vendas">
          <RecentSalesCard sales={snapshot.recentSales} />
        </DashboardSection>
      </div>
    </div>
  );
}
