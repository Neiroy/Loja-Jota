import {
  AlertTriangle,
  BanknoteIcon,
  ReceiptText,
  UsersIcon,
  WalletIcon,
} from 'lucide-react';

import { DashboardCard } from '@/components/shared/dashboard-card';
import { formatProductPrice } from '@/features/products/utils/format-product-price';
import type { DashboardKpis } from '@/types/dashboard.types';

type DashboardKpiGridProps = {
  kpis: DashboardKpis;
};

function formatOverdueSubtitle(count: number) {
  if (count === 0) {
    return 'Nenhum fiado vencido';
  }

  if (count === 1) {
    return '1 fiado vencido';
  }

  return `${count} fiados vencidos`;
}

export function DashboardKpiGrid({ kpis }: DashboardKpiGridProps) {
  return (
    <div className="grid w-full gap-5 sm:grid-cols-2 xl:grid-cols-5">
      <DashboardCard
        label="Vendas do dia"
        value={formatProductPrice(kpis.salesTodayTotal)}
        icon={ReceiptText}
      />
      <DashboardCard
        label="Total do mês"
        value={formatProductPrice(kpis.salesMonthTotal)}
        subtitle={kpis.monthLabel ?? undefined}
        icon={BanknoteIcon}
      />
      <DashboardCard
        label="Fiado em aberto"
        value={formatProductPrice(kpis.openReceivablesTotal)}
        icon={WalletIcon}
      />
      <DashboardCard
        label="Fiados vencidos"
        value={formatProductPrice(kpis.overdueReceivablesTotal)}
        subtitle={formatOverdueSubtitle(kpis.overdueReceivablesCount)}
        icon={AlertTriangle}
      />
      <DashboardCard
        label="Clientes com dívida"
        value={String(kpis.customersWithDebtCount)}
        icon={UsersIcon}
      />
    </div>
  );
}
