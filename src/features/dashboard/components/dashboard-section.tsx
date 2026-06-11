import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { surfaceCardClassName } from '@/lib/surface';
import { cn } from '@/lib/utils';

type DashboardSectionProps = {
  title: string;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
};

export function DashboardSection({
  title,
  href,
  linkLabel = 'Ver todos',
  children,
}: DashboardSectionProps) {
  return (
    <section
      className={cn(
        surfaceCardClassName,
        'flex h-full min-h-[20rem] min-w-0 flex-col overflow-hidden'
      )}
    >
      <div className="flex items-center justify-between gap-4 border-b border-stone-200/60 px-6 py-5">
        <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
        {href ? (
          <Link
            href={href}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'shrink-0'
            )}
          >
            {linkLabel}
          </Link>
        ) : null}
      </div>
      <div className="min-h-0 min-w-0 flex-1 p-2 sm:p-3">{children}</div>
    </section>
  );
}
