import { cn } from '@/lib/utils';

type StoreBrandMarkProps = {
  storeName: string;
  storeMonogram: string;
  logoUrl?: string | null;
  className?: string;
  size?: 'sidebar' | 'compact' | 'preview';
};

const containerSizeClasses = {
  sidebar: 'size-12 lg:size-14',
  compact: 'size-11',
  preview: 'size-32 sm:size-36',
};

const containerShapeClasses = {
  sidebar: 'rounded-full',
  compact: 'rounded-full',
  preview: 'rounded-2xl',
};

const monogramTextClasses = {
  sidebar: 'text-xs lg:text-sm',
  compact: 'text-[11px]',
  preview: 'text-2xl',
};

export function StoreBrandMark({
  storeName,
  storeMonogram,
  logoUrl,
  className,
  size = 'sidebar',
}: StoreBrandMarkProps) {
  const containerClassName = cn(
    'flex shrink-0 items-center justify-center overflow-hidden border border-stone-200/80 bg-white shadow-sm',
    containerSizeClasses[size],
    containerShapeClasses[size],
    className
  );

  if (logoUrl) {
    return (
      <div className={containerClassName}>
        {/* Logo dinâmica por loja (Supabase Storage); URL externa variável. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- branding uploadado pelo usuário */}
        <img
          src={logoUrl}
          alt={`Logo ${storeName}`}
          className={cn(
            'size-full',
            size === 'preview' ? 'object-contain p-1.5' : 'object-cover'
          )}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={cn(
        containerClassName,
        'bg-stone-900 text-white shadow-[0_2px_8px_rgba(28,25,23,0.2)]'
      )}
    >
      <span
        className={cn('font-semibold tracking-wide', monogramTextClasses[size])}
      >
        {storeMonogram}
      </span>
    </div>
  );
}
