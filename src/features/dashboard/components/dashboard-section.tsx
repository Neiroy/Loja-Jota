import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
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
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
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
      {children}
    </section>
  );
}
