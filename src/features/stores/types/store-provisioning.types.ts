export type StoreListRow = {
  id: string;
  name: string;
  slug: string | null;
  is_active: boolean;
  created_at: string;
  user_count: number;
};

export type ProvisionStoreResult = {
  store_id: string;
  store_name: string;
  user_email: string;
};
