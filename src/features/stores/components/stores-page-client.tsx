'use client';

import { useState } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ListErrorAlert } from '@/components/shared/list-error-alert';
import { StoreCreateDialog } from '@/features/stores/components/store-create-dialog';
import { StoresTable } from '@/features/stores/components/stores-table';
import { Button } from '@/components/ui/button';
import type { StoreListRow } from '@/features/stores/types/store-provisioning.types';

type StoresPageClientProps = {
  stores: StoreListRow[];
  error?: string;
};

export function StoresPageClient({ stores, error }: StoresPageClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="page-stack">
      <PageHeader
        title="Gerenciar lojas"
        description="Crie e acompanhe lojas e usuários de acesso do sistema."
        action={
          !error ? (
            <Button type="button" onClick={() => setDialogOpen(true)}>
              Nova loja
            </Button>
          ) : undefined
        }
      />

      {error ? <ListErrorAlert message={error} /> : null}

      {!error && stores.length === 0 ? (
        <EmptyState
          title="Nenhuma loja cadastrada"
          description="Crie a primeira loja para provisionar um novo acesso ao sistema."
          action={
            <Button type="button" onClick={() => setDialogOpen(true)}>
              Nova loja
            </Button>
          }
        />
      ) : null}

      {!error && stores.length > 0 ? <StoresTable stores={stores} /> : null}

      <StoreCreateDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
