export type {
  Receivable,
  ReceivableInsert,
  ReceivableUpdate,
  ReceivableStatus,
  ReceivableSettlementMethod,
} from '@/types/database.types';

export type ReceivableListRow = {
  id: string;
  sale_id: string;
  customer_id: string;
  amount: number;
  due_date: string;
  status: import('@/types/database.types').ReceivableStatus;
  paid_at: string | null;
  payment_method:
    | import('@/types/database.types').ReceivableSettlementMethod
    | null;
  created_at: string;
  updated_at: string;
  customer_name: string;
  sale_date: string;
  sale_total: number;
  installment_number: number;
  installments_total: number;
};

export type ReceivableDetail = {
  id: string;
  sale_id: string;
  customer_id: string;
  amount: number;
  due_date: string;
  status: import('@/types/database.types').ReceivableStatus;
  paid_at: string | null;
  payment_method:
    | import('@/types/database.types').ReceivableSettlementMethod
    | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_phone: string | null;
  sale_date: string;
  sale_total: number;
  sale_payment_status: import('@/types/database.types').SalePaymentStatus;
  installment_number: number;
  installments_total: number;
};
