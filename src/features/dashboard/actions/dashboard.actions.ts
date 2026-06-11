'use server';

import { getCurrentMonthLabel } from '@/features/dashboard/utils/get-local-date-range';
import * as dashboardService from '@/services/dashboard.service';
import { LIST_LOAD_ERROR } from '@/types/action.types';
import type { DashboardSnapshot } from '@/types/dashboard.types';

export type DashboardActionResult = {
  snapshot: DashboardSnapshot;
  error?: string;
};

const EMPTY_DASHBOARD_SNAPSHOT: DashboardSnapshot = {
  kpis: {
    salesTodayTotal: 0,
    salesMonthTotal: 0,
    openReceivablesTotal: 0,
    overdueReceivablesCount: 0,
    overdueReceivablesTotal: 0,
    customersWithDebtCount: 0,
    monthLabel: getCurrentMonthLabel(),
  },
  upcomingReceivables: [],
  recentSales: [],
};

export async function getDashboardSnapshot(): Promise<DashboardActionResult> {
  try {
    const snapshot = await dashboardService.getSnapshot();
    return { snapshot };
  } catch {
    return {
      snapshot: EMPTY_DASHBOARD_SNAPSHOT,
      error: LIST_LOAD_ERROR,
    };
  }
}
