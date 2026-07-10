import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { surfaceCardClassName } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type DataTableColumn<T> = {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  emptyMessage?: string;
  className?: string;
};

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  emptyMessage = 'Nenhum registro encontrado.',
  className,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div
        className={cn(
          surfaceCardClassName,
          'px-6 py-16 text-center sm:py-20',
          className
        )}
      >
        <p className="text-sm text-stone-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(surfaceCardClassName, 'min-w-0 overflow-hidden', className)}
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={getRowKey(row)}>
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
