import { z } from 'zod';

export const receivableStatusFilterSchema = z.enum([
  'all',
  'open',
  'overdue',
  'paid',
]);

export const receivableIdSchema = z.string().uuid('Identificador inválido.');

export const receivableSettlementMethodSchema = z.enum(
  ['cash', 'pix', 'card'],
  {
    error: 'Forma de pagamento inválida.',
  }
);

export const markReceivablePaidSchema = z.object({
  receivable_id: receivableIdSchema,
  payment_method: receivableSettlementMethodSchema,
});

export const listReceivablesSchema = z.object({
  search: z
    .string()
    .trim()
    .max(100, 'Busca deve ter no máximo 100 caracteres.')
    .transform((value) => (value === '' ? undefined : value))
    .optional(),
  status: receivableStatusFilterSchema.default('all'),
});

export type MarkReceivablePaidInput = z.infer<typeof markReceivablePaidSchema>;
export type ListReceivablesInput = z.input<typeof listReceivablesSchema>;
export type ListReceivablesFilters = z.output<typeof listReceivablesSchema>;
export type ReceivableStatusFilter = z.infer<
  typeof receivableStatusFilterSchema
>;
export type ReceivableSettlementMethod = z.infer<
  typeof receivableSettlementMethodSchema
>;
