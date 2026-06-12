import { listStoresAction } from '@/features/stores/actions/store.actions';
import { StoresPageClient } from '@/features/stores/components/stores-page-client';

export default async function GerenciarLojasPage() {
  const { items, error } = await listStoresAction();

  return <StoresPageClient stores={items} error={error} />;
}
