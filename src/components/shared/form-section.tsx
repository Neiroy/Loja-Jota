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
        'space-y-6 p-6 sm:p-7 lg:p-8',
        className
      )}
    >
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
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
