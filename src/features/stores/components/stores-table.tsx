import type { DataTableColumn } from '@/components/shared/data-table';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import type { StoreListRow } from '@/features/stores/types/store-provisioning.types';

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

const columns: DataTableColumn<StoreListRow>[] = [
  {
    key: 'name',
    header: 'Nome',
    cell: (row) => (
      <span className="font-medium text-stone-900">{row.name}</span>
    ),
  },
  {
    key: 'slug',
    header: 'Slug',
    cell: (row) => <span className="text-stone-600">{row.slug ?? '—'}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    cell: (row) => (
      <StatusBadge
        variant={row.is_active ? 'paid' : 'cancelled'}
        label={row.is_active ? 'Ativa' : 'Inativa'}
      />
    ),
  },
  {
    key: 'users',
    header: 'Usuários',
    cell: (row) => <span>{row.user_count}</span>,
    className: 'text-right',
  },
  {
    key: 'created_at',
    header: 'Criada em',
    cell: (row) => (
      <span className="text-stone-600">{formatCreatedAt(row.created_at)}</span>
    ),
  },
];

type StoresTableProps = {
  stores: StoreListRow[];
};

export function StoresTable({ stores }: StoresTableProps) {
  return (
    <DataTable
      columns={columns}
      data={stores}
      getRowKey={(row) => row.id}
      emptyMessage="Nenhuma loja cadastrada ainda."
    />
  );
}
