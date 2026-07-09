import Link from 'next/link';

import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { CustomerStatusBadge } from '@/features/customers/components/customer-status-badge';
import { cn } from '@/lib/utils';
import type { Customer } from '@/types/customer.types';

function formatCpf(cpf: string | null) {
  if (!cpf) {
    return '—';
  }

  if (cpf.length !== 11) {
    return cpf;
  }

  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}

const columns: DataTableColumn<Customer>[] = [
  {
    key: 'name',
    header: 'Nome',
    cell: (customer) => (
      <span
        className={cn(
          'block max-w-[10rem] truncate sm:max-w-[14rem] lg:max-w-[12rem]',
          'font-medium',
          customer.is_active ? 'text-stone-900' : 'text-stone-500'
        )}
        title={customer.name}
      >
        {customer.name}
      </span>
    ),
  },
  {
    key: 'phone',
    header: 'Telefone',
    cell: (customer) => (
      <span
        className={cn(
          'block max-w-[9rem] truncate sm:max-w-[12rem]',
          customer.is_active ? undefined : 'text-stone-500'
        )}
        title={customer.phone ?? undefined}
      >
        {customer.phone ?? '—'}
      </span>
    ),
  },
  {
    key: 'cpf',
    header: 'CPF',
    cell: (customer) => (
      <span className={customer.is_active ? undefined : 'text-stone-500'}>
        {formatCpf(customer.cpf)}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    cell: (customer) => <CustomerStatusBadge isActive={customer.is_active} />,
  },
  {
    key: 'actions',
    header: '',
    className: 'text-right',
    cell: (customer) => (
      <Link
        href={`/clientes/${customer.id}`}
        className="text-sm font-medium text-stone-700 hover:text-stone-900 hover:underline"
      >
        Ver detalhes
      </Link>
    ),
  },
];

type CustomersTableProps = {
  customers: Customer[];
  emptyMessage?: string;
};

export function CustomersTable({
  customers,
  emptyMessage = 'Nenhum cliente encontrado.',
}: CustomersTableProps) {
  return (
    <DataTable
      columns={columns}
      data={customers}
      getRowKey={(customer) => customer.id}
      emptyMessage={emptyMessage}
    />
  );
}
