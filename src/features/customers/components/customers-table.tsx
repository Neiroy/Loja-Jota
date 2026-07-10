import Link from 'next/link';

import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { CustomerStatusBadge } from '@/features/customers/components/customer-status-badge';
import { formatCpfDisplay, formatPhoneDisplay } from '@/lib/formatters';
import { tableActionLinkClassName } from '@/lib/surface';
import { cn } from '@/lib/utils';
import type { Customer } from '@/types/customer.types';

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
    cell: (customer) => {
      const phone = formatPhoneDisplay(customer.phone);
      return (
        <span
          className={cn(
            'block max-w-[9rem] truncate sm:max-w-[12rem]',
            customer.is_active ? undefined : 'text-stone-500'
          )}
          title={phone === '—' ? undefined : phone}
        >
          {phone}
        </span>
      );
    },
  },
  {
    key: 'cpf',
    header: 'CPF',
    cell: (customer) => (
      <span className={customer.is_active ? undefined : 'text-stone-500'}>
        {formatCpfDisplay(customer.cpf)}
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
        className={tableActionLinkClassName}
      >
        Ver detalhes
      </Link>
    ),
  },
];

type CustomersTableProps = {
  customers: Customer[];
};

export function CustomersTable({ customers }: CustomersTableProps) {
  return (
    <DataTable
      columns={columns}
      data={customers}
      getRowKey={(customer) => customer.id}
      emptyMessage="Nenhum cliente encontrado."
    />
  );
}
