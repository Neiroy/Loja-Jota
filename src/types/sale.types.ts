export type {
  PaymentMethod,
  Sale,
  SaleInsert,
  SaleItem,
  SaleItemInsert,
  HistoricalSaleItem,
  HistoricalSaleItemInsert,
  SalePaymentStatus,
} from '@/types/database.types';

export type { Receivable } from '@/types/database.types';

export type SaleReceivableSummary = {
  id: string;
  amount: number;
  due_date: string;
  status: import('@/types/database.types').ReceivableStatus;
  installment_number: number;
  installments_total: number;
};

export type SaleListRow = {
  id: string;
  customer_id: string;
  sale_date: string;
  subtotal: number;
  discount: number;
  total: number;
  payment_method: import('@/types/database.types').PaymentMethod;
  payment_status: import('@/types/database.types').SalePaymentStatus;
  card_payment_type: import('@/types/database.types').CardPaymentType | null;
  installments_count: number | null;
  down_payment: number;
  financing_installments_count: number | null;
  is_historical: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer_name: string;
};

export type SaleItemWithProduct = {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
  product_name: string;
  product_category: string | null;
  product_size: string | null;
  product_color: string | null;
};

export type HistoricalSaleItemRow = {
  id: string;
  sale_id: string;
  product_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
};

export type SaleDetail = {
  id: string;
  customer_id: string;
  sale_date: string;
  subtotal: number;
  discount: number;
  total: number;
  payment_method: import('@/types/database.types').PaymentMethod;
  payment_status: import('@/types/database.types').SalePaymentStatus;
  card_payment_type: import('@/types/database.types').CardPaymentType | null;
  installments_count: number | null;
  down_payment: number;
  financing_installments_count: number | null;
  is_historical: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer_name: string;
  items: SaleItemWithProduct[];
  historical_items: HistoricalSaleItemRow[];
  receivables: SaleReceivableSummary[];
};

export type CreateSaleRpcItem = {
  product_id: string;
  quantity: number;
};

export type CreateSaleRpcInput = {
  customer_id: string;
  discount: number;
  payment_method: import('@/types/database.types').PaymentMethod;
  card_payment_type: import('@/types/database.types').CardPaymentType | null;
  installments_count: number | null;
  down_payment: number;
  financing_installments_count: number | null;
  items: CreateSaleRpcItem[];
};

export type CreateHistoricalSaleRpcItem = {
  description: string;
  quantity: number;
  unit_price: number;
  product_id?: string | null;
};

export type CreateHistoricalSaleRpcInput = {
  customer_id: string;
  sale_date: string;
  total: number;
  down_payment: number;
  payment_method: import('@/types/database.types').PaymentMethod;
  pending_installments: number | null;
  first_due_date: string | null;
  notes: string | null;
  items: CreateHistoricalSaleRpcItem[];
};
