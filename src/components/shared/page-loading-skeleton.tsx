import { TableSkeleton } from '@/components/shared/table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { surfaceCardClassName } from '@/lib/surface';
import { cn } from '@/lib/utils';

export function PageLoadingSkeleton() {
  return (
    <div className="page-stack">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className={cn(surfaceCardClassName, 'p-5')}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
      <TableSkeleton />
    </div>
  );
}
