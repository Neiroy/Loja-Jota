import { cn } from '@/lib/utils';

/** Card/surface padrão — quiet luxury operacional */
export const surfaceCardClassName =
  'rounded-xl border border-stone-200/60 bg-white shadow-[0_1px_2px_rgba(28,25,23,0.03),0_6px_24px_rgba(28,25,23,0.04)]';

/** Card elevado — login e destaques */
export const surfaceElevatedClassName =
  'rounded-2xl border border-stone-200/50 bg-white shadow-[0_2px_8px_rgba(28,25,23,0.03),0_14px_40px_rgba(28,25,23,0.07)]';

/** Fundo suave para headers de tabela e áreas secundárias */
export const surfaceMutedClassName = 'bg-stone-50/70';

/** Classes compartilhadas de campos de formulário (input, select nativo) */
export const fieldControlClassName =
  'h-10 w-full min-w-0 rounded-lg border border-stone-200/70 bg-white px-3.5 text-sm text-stone-900 shadow-[inset_0_1px_2px_rgba(28,25,23,0.02)] transition-[border-color,box-shadow] outline-none placeholder:text-stone-400 focus-visible:border-stone-400 focus-visible:ring-2 focus-visible:ring-stone-400/20 disabled:cursor-not-allowed disabled:opacity-50';

/** Badge compacta compartilhada */
export const badgeBaseClassName =
  'inline-flex h-5 items-center rounded-md border px-2 text-[11px] font-medium tracking-wide whitespace-nowrap';

export function surfaceCard(className?: string) {
  return cn(surfaceCardClassName, className);
}
