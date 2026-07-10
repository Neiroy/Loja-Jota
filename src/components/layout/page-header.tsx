import { surfaceCardClassName } from '@/lib/surface';
import { cn } from '@/lib/utils';

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        surfaceCardClassName,
        'mb-5 flex min-w-0 flex-col gap-4 p-5 sm:mb-7 sm:flex-row sm:items-start sm:justify-between sm:p-6 lg:p-7',
        className
      )}
    >
      <div className="min-w-0 space-y-1.5">
        <h1 className="text-[1.625rem] leading-tight font-semibold tracking-tight text-stone-950 sm:text-[1.75rem]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-stone-500">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <div className="flex w-full shrink-0 sm:w-auto sm:pt-0.5">{action}</div>
      ) : null}
    </div>
  );
}
