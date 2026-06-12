import { z } from 'zod';

export const storeRoleSchema = z.enum(['admin', 'operator']);

export const provisionStoreSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nome da loja deve ter pelo menos 2 caracteres.')
    .max(200, 'Nome da loja deve ter no máximo 200 caracteres.'),
  slug: z
    .string()
    .trim()
    .max(80, 'Slug deve ter no máximo 80 caracteres.')
    .optional()
    .transform((value) => (value === '' ? undefined : value)),
  full_name: z
    .string()
    .trim()
    .min(2, 'Nome do responsável deve ter pelo menos 2 caracteres.')
    .max(200, 'Nome do responsável deve ter no máximo 200 caracteres.'),
  email: z.string().trim().toLowerCase().email('Informe um e-mail válido.'),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres.')
    .max(72, 'Senha deve ter no máximo 72 caracteres.'),
  role: storeRoleSchema.default('operator'),
});

export type ProvisionStoreInput = z.infer<typeof provisionStoreSchema>;

export type StoreRole = z.infer<typeof storeRoleSchema>;
