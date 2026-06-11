export type {
  PaymentMethod,
  Sale,
  SaleInsert,
  SaleItem,
  SaleItemInsert,
  SalePaymentStatus,
} from '@/types/database.types';

export type { Receivable } from '@/types/database.types';

export type SaleListRow = {
  id: string;
  customer_id: string;
  sale_date: string;
  subtotal: number;
  discount: number;
  total: number;
  payment_method: import('@/types/database.types').PaymentMethod;
  payment_status: import('@/types/database.types').SalePaymentStatus;
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

export type SaleDetail = {
  id: string;
  customer_id: string;
  sale_date: string;
  subtotal: number;
  discount: number;
  total: number;
  payment_method: import('@/types/database.types').PaymentMethod;
  payment_status: import('@/types/database.types').SalePaymentStatus;
  created_at: string;
  updated_at: string;
  customer_name: string;
  items: SaleItemWithProduct[];
  receivable: {
    id: string;
    amount: number;
    due_date: string;
    status: import('@/types/database.types').ReceivableStatus;
  } | null;
};

export type CreateSaleRpcItem = {
  product_id: string;
  quantity: number;
};

export type CreateSaleRpcInput = {
  customer_id: string;
  discount: number;
  payment_method: import('@/types/database.types').PaymentMethod;
  items: CreateSaleRpcItem[];
};
