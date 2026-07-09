import { redirect } from 'next/navigation';

import { listStoresAction } from '@/features/stores/actions/store.actions';
import { StoresPageClient } from '@/features/stores/components/stores-page-client';
import { canManageStores } from '@/lib/tenant/require-store-provisioner';

export default async function GerenciarLojasPage() {
  const canManage = await canManageStores();

  if (!canManage) {
    redirect('/configuracoes');
  }

  const { items, error } = await listStoresAction();

  return <StoresPageClient stores={items} error={error} />;
}
