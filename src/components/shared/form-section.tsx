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
        'space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm',
        className
      )}
    >
      <div className="space-y-1">
        <h2 className="text-lg font-medium text-stone-800">{title}</h2>
        {description ? (
          <p className="text-sm text-stone-500">{description}</p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
