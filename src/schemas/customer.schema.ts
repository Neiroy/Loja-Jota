import { z } from 'zod';

export const customerStatusFilterSchema = z.enum(['all', 'active', 'inactive']);

export const customerIdSchema = z.string().uuid('Identificador inválido.');

const cpfFieldSchema = z
  .string()
  .trim()
  .transform((value) => (value === '' ? undefined : value.replace(/\D/g, '')))
  .optional()
  .refine(
    (value) => value === undefined || value.length === 11,
    'CPF deve conter 11 dígitos.'
  );

const notesFieldSchema = z
  .string()
  .trim()
  .max(1000, 'Observações devem ter no máximo 1000 caracteres.')
  .transform((value) => (value === '' ? undefined : value))
  .optional();

export const createCustomerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nome deve ter pelo menos 2 caracteres.')
    .max(200, 'Nome deve ter no máximo 200 caracteres.'),
  phone: z
    .string()
    .trim()
    .min(8, 'Telefone é obrigatório e deve ter pelo menos 8 caracteres.')
    .max(20, 'Telefone deve ter no máximo 20 caracteres.'),
  cpf: cpfFieldSchema,
  notes: notesFieldSchema,
  is_active: z.boolean().optional().default(true),
});

export const updateCustomerSchema = createCustomerSchema.extend({
  is_active: z.boolean(),
});

export const listCustomersSchema = z.object({
  search: z
    .string()
    .trim()
    .max(100, 'Busca deve ter no máximo 100 caracteres.')
    .transform((value) => (value === '' ? undefined : value))
    .optional(),
  status: customerStatusFilterSchema.default('all'),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type ListCustomersInput = z.infer<typeof listCustomersSchema>;
export type CustomerStatusFilter = z.infer<typeof customerStatusFilterSchema>;
