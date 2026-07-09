import type {
  PaymentMethod,
  ReceivableStatus,
  SalePaymentStatus,
} from '@/types/database.types';

export type DashboardKpis = {
  salesTodayTotal: number;
  salesMonthTotal: number;
  openReceivablesTotal: number;
  overdueReceivablesCount: number;
  overdueReceivablesTotal: number;
  customersWithDebtCount: number;
  monthLabel: string;
};

export type UpcomingReceivableRow = {
  id: string;
  customer_name: string;
  amount: number;
  due_date: string;
  status: Extract<ReceivableStatus, 'open'>;
};

export type RecentSaleRow = {
  id: string;
  customer_name: string;
  total: number;
  sale_date: string;
  payment_method: PaymentMethod;
  payment_status: SalePaymentStatus;
  card_payment_type: import('@/types/database.types').CardPaymentType | null;
  installments_count: number | null;
};

export type DashboardSnapshot = {
  kpis: DashboardKpis;
  upcomingReceivables: UpcomingReceivableRow[];
  recentSales: RecentSaleRow[];
};
