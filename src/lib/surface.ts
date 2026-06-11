import { cn } from '@/lib/utils';

/** Card/surface padrão — quiet luxury operacional */
export const surfaceCardClassName =
  'rounded-xl border border-stone-200/80 bg-white shadow-sm';

/** Fundo suave para headers de tabela e áreas secundárias */
export const surfaceMutedClassName = 'bg-stone-50/80';

/** Classes compartilhadas de campos de formulário (input, select nativo) */
export const fieldControlClassName =
  'h-9 w-full min-w-0 rounded-lg border border-stone-200/80 bg-white px-3 text-sm text-stone-900 transition-colors outline-none placeholder:text-stone-400 focus-visible:border-stone-400 focus-visible:ring-2 focus-visible:ring-stone-400/20 disabled:cursor-not-allowed disabled:opacity-50';

export function surfaceCard(className?: string) {
  return cn(surfaceCardClassName, className);
}
