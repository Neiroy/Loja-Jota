/**
 * Tipos do banco de dados — alinhados a docs/DATABASE_SPEC.md
 * Sistema interno de controle da loja (uso autenticado)
 */

export type PaymentMethod = 'cash' | 'pix' | 'card' | 'credit_30_days';

export type SalePaymentStatus = 'paid' | 'pending' | 'cancelled';

export type ReceivableStatus = 'open' | 'paid' | 'overdue' | 'cancelled';

export type ReceivableSettlementMethod = Extract<
  PaymentMethod,
  'cash' | 'pix' | 'card'
>;

export type ProfileRole = 'admin' | 'operator';

export type Store = {
  id: string;
  name: string;
  slug: string | null;
  logo_path: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  full_name: string;
  role: ProfileRole;
  store_id: string;
  created_at: string;
  updated_at: string;
};

export type Customer = {
  id: string;
  store_id: string;
  name: string;
  phone: string | null;
  cpf: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  store_id: string;
  name: string;
  category: string | null;
  size: string | null;
  color: string | null;
  sale_price: number;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Sale = {
  id: string;
  store_id: string;
  customer_id: string;
  sale_date: string;
  subtotal: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: SalePaymentStatus;
  created_at: string;
  updated_at: string;
};

export type SaleItem = {
  id: string;
  store_id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
};

export type Receivable = {
  id: string;
  store_id: string;
  sale_id: string;
  customer_id: string;
  amount: number;
  due_date: string;
  status: ReceivableStatus;
  paid_at: string | null;
  payment_method: ReceivableSettlementMethod | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CustomerInsert = Pick<Customer, 'name'> &
  Partial<Pick<Customer, 'phone' | 'cpf' | 'notes' | 'is_active'>>;

export type CustomerDbInsert = CustomerInsert & Pick<Customer, 'store_id'>;

export type CustomerUpdate = Partial<
  Pick<Customer, 'name' | 'phone' | 'cpf' | 'notes' | 'is_active'>
>;

export type ProductInsert = Pick<Product, 'name' | 'sale_price'> &
  Partial<
    Pick<
      Product,
      'category' | 'size' | 'color' | 'stock_quantity' | 'is_active'
    >
  >;

export type ProductDbInsert = ProductInsert & Pick<Product, 'store_id'>;

export type ProductUpdate = Partial<
  Pick<
    Product,
    | 'name'
    | 'category'
    | 'size'
    | 'color'
    | 'sale_price'
    | 'stock_quantity'
    | 'is_active'
  >
>;

export type SaleInsert = Pick<
  Sale,
  | 'store_id'
  | 'customer_id'
  | 'sale_date'
  | 'subtotal'
  | 'discount'
  | 'total'
  | 'payment_method'
  | 'payment_status'
>;

export type SaleItemInsert = Pick<
  SaleItem,
  'store_id' | 'sale_id' | 'product_id' | 'quantity' | 'unit_price' | 'total'
>;

export type ReceivableInsert = Pick<
  Receivable,
  'store_id' | 'sale_id' | 'customer_id' | 'amount' | 'due_date' | 'status'
> &
  Partial<Pick<Receivable, 'paid_at' | 'payment_method' | 'notes'>>;

export type ReceivableUpdate = Partial<
  Pick<Receivable, 'status' | 'paid_at' | 'payment_method' | 'notes'>
>;

export type Database = {
  public: {
    Tables: {
      stores: {
        Row: Store;
        Insert: Pick<Store, 'name'> &
          Partial<Pick<Store, 'slug' | 'is_active'>>;
        Update: Partial<
          Pick<Store, 'name' | 'slug' | 'is_active' | 'logo_path'>
        >;
      };
      profiles: {
        Row: Profile;
        Insert: Pick<Profile, 'id' | 'full_name' | 'store_id'> &
          Partial<Pick<Profile, 'role'>>;
        Update: Partial<Pick<Profile, 'full_name' | 'role' | 'store_id'>>;
      };
      customers: {
        Row: Customer;
        Insert: CustomerDbInsert;
        Update: CustomerUpdate;
      };
      products: {
        Row: Product;
        Insert: ProductDbInsert;
        Update: ProductUpdate;
      };
      sales: {
        Row: Sale;
        Insert: SaleInsert;
        Update: Partial<Pick<Sale, 'payment_status'>>;
      };
      sale_items: {
        Row: SaleItem;
        Insert: SaleItemInsert;
        Update: never;
      };
      receivables: {
        Row: Receivable;
        Insert: ReceivableInsert;
        Update: ReceivableUpdate;
      };
    };
    Enums: {
      payment_method: PaymentMethod;
      sale_payment_status: SalePaymentStatus;
      receivable_status: ReceivableStatus;
    };
  };
};
