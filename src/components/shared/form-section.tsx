import { surfaceCardClassName } from '@/lib/surface';
import { cn } from '@/lib/utils';

type FormSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <section
      className={cn(
        surfaceCardClassName,
        'space-y-5 p-5 sm:space-y-6 sm:p-6 lg:p-7',
        className
      )}
    >
      <div className="space-y-1">
        <h2 className="text-base font-semibold tracking-tight text-stone-900 sm:text-lg">
          {title}
        </h2>
        {description ? (
          <p className="text-sm leading-relaxed text-stone-500">
            {description}
          </p>
        ) : null}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
