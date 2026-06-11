import { PageHeader } from '@/components/layout/page-header';
import { ListErrorAlert } from '@/components/shared/list-error-alert';
import { getDashboardSnapshot } from '@/features/dashboard/actions/dashboard.actions';
import { DashboardKpiGrid } from '@/features/dashboard/components/dashboard-kpi-grid';
import { DashboardSection } from '@/features/dashboard/components/dashboard-section';
import { RecentSalesCard } from '@/features/dashboard/components/recent-sales-card';
import { UpcomingReceivablesCard } from '@/features/dashboard/components/upcoming-receivables-card';

export default async function DashboardPage() {
  const { snapshot, error } = await getDashboardSnapshot();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral da operação interna da loja."
      />

      {error ? <ListErrorAlert message={error} /> : null}

      <DashboardKpiGrid kpis={snapshot.kpis} />

      <div className="grid gap-6 lg:grid-cols-2">
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
