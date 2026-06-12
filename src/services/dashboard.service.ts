import {
  getCurrentMonthLabel,
  getLocalDateRange,
} from '@/features/dashboard/utils/get-local-date-range';
import { getCurrentStoreId } from '@/lib/tenant/get-current-store';
import * as dashboardRepository from '@/repositories/dashboard.repository';
import * as receivablesRepository from '@/repositories/receivables.repository';
import type { DashboardSnapshot } from '@/types/dashboard.types';

export const UPCOMING_RECEIVABLES_LIMIT = 7;
export const RECENT_SALES_LIMIT = 5;

export class DashboardServiceError extends Error {
  constructor(
    message: string,
    public readonly code: 'DATABASE' | 'SYNC'
  ) {
    super(message);
    this.name = 'DashboardServiceError';
  }
}

function countDistinctCustomerIds(
  rows: Array<{ customer_id: string }>
): number {
  return new Set(rows.map((row) => row.customer_id)).size;
}

async function syncOverdueReceivables(storeId: string) {
  const { error } = await receivablesRepository.syncOverdue(storeId);

  if (error) {
    throw new DashboardServiceError(
      'Não foi possível atualizar fiados vencidos.',
      'SYNC'
    );
  }
}

export async function getSnapshot(): Promise<DashboardSnapshot> {
  const storeId = await getCurrentStoreId();
  const { today, monthStart, monthEnd, todayPlus7 } = getLocalDateRange();

  await syncOverdueReceivables(storeId);

  const [
    salesTodayResult,
    salesMonthResult,
    openReceivablesResult,
    overdueReceivablesResult,
    debtorCustomersResult,
    upcomingReceivablesResult,
    recentSalesResult,
  ] = await Promise.all([
    dashboardRepository.findSalesTotalsBetweenDates(storeId, today, today),
    dashboardRepository.findSalesTotalsBetweenDates(
      storeId,
      monthStart,
      monthEnd
    ),
    dashboardRepository.findOpenReceivableAmounts(storeId),
    dashboardRepository.findOverdueReceivableAmounts(storeId),
    dashboardRepository.findDebtorCustomerIds(storeId),
    dashboardRepository.findUpcomingReceivables(
      storeId,
      today,
      todayPlus7,
      UPCOMING_RECEIVABLES_LIMIT
    ),
    dashboardRepository.findRecentSales(storeId, RECENT_SALES_LIMIT),
  ]);

  const queryErrors = [
    salesTodayResult.error,
    salesMonthResult.error,
    openReceivablesResult.error,
    overdueReceivablesResult.error,
    debtorCustomersResult.error,
    upcomingReceivablesResult.error,
    recentSalesResult.error,
  ].filter(Boolean);

  if (queryErrors.length > 0) {
    throw new DashboardServiceError(
      'Não foi possível carregar os dados do dashboard.',
      'DATABASE'
    );
  }

  const overdueRows = overdueReceivablesResult.data ?? [];

  return {
    kpis: {
      salesTodayTotal: dashboardRepository.sumTotals(
        salesTodayResult.data ?? []
      ),
      salesMonthTotal: dashboardRepository.sumTotals(
        salesMonthResult.data ?? []
      ),
      openReceivablesTotal: dashboardRepository.sumAmounts(
        openReceivablesResult.data ?? []
      ),
      overdueReceivablesCount: overdueRows.length,
      overdueReceivablesTotal: dashboardRepository.sumAmounts(overdueRows),
      customersWithDebtCount: countDistinctCustomerIds(
        debtorCustomersResult.data ?? []
      ),
      monthLabel: getCurrentMonthLabel(),
    },
    upcomingReceivables: (upcomingReceivablesResult.data ?? []).map(
      dashboardRepository.mapUpcomingReceivableRow
    ),
    recentSales: (recentSalesResult.data ?? []).map(
      dashboardRepository.mapRecentSaleRow
    ),
  };
}
