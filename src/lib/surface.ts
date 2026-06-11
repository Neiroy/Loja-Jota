import { cn } from '@/lib/utils';

/** Card/surface padrão — quiet luxury operacional */
export const surfaceCardClassName =
  'rounded-xl border border-stone-200/70 bg-white shadow-[0_1px_2px_rgba(28,25,23,0.04),0_4px_20px_rgba(28,25,23,0.05)]';

/** Card elevado — login e destaques */
export const surfaceElevatedClassName =
  'rounded-2xl border border-stone-200/60 bg-white shadow-[0_2px_8px_rgba(28,25,23,0.04),0_12px_40px_rgba(28,25,23,0.08)]';

/** Fundo suave para headers de tabela e áreas secundárias */
export const surfaceMutedClassName = 'bg-stone-50/80';

/** Classes compartilhadas de campos de formulário (input, select nativo) */
export const fieldControlClassName =
  'h-10 w-full min-w-0 rounded-lg border border-stone-200/70 bg-white px-3.5 text-sm text-stone-900 shadow-[inset_0_1px_2px_rgba(28,25,23,0.02)] transition-colors outline-none placeholder:text-stone-400 focus-visible:border-stone-400 focus-visible:ring-2 focus-visible:ring-stone-400/20 disabled:cursor-not-allowed disabled:opacity-50';

export function surfaceCard(className?: string) {
  return cn(surfaceCardClassName, className);
}
