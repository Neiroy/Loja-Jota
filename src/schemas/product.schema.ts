import { z } from 'zod';

export const productStatusFilterSchema = z.enum(['all', 'active', 'inactive']);

export const productIdSchema = z.string().uuid('Identificador inválido.');

const optionalTextField = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} deve ter no máximo ${max} caracteres.`)
    .transform((value) => (value === '' ? undefined : value))
    .optional();

const salePriceFieldSchema = z.coerce
  .number({
    error: 'Preço de venda é obrigatório.',
  })
  .min(0, 'Preço deve ser maior ou igual a zero.')
  .max(999_999.99, 'Preço deve ser no máximo R$ 999.999,99.')
  .transform((value) => Math.round(value * 100) / 100);

const stockQuantityFieldSchema = z.coerce
  .number({
    error: 'Quantidade em estoque é obrigatória.',
  })
  .int('Estoque deve ser um número inteiro.')
  .min(0, 'Estoque deve ser maior ou igual a zero.');

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nome deve ter pelo menos 2 caracteres.')
    .max(200, 'Nome deve ter no máximo 200 caracteres.'),
  category: z
    .string()
    .trim()
    .min(1, 'Categoria é obrigatória.')
    .max(100, 'Categoria deve ter no máximo 100 caracteres.'),
  size: optionalTextField(50, 'Tamanho'),
  color: optionalTextField(50, 'Cor'),
  sale_price: salePriceFieldSchema,
  stock_quantity: stockQuantityFieldSchema,
  is_active: z.boolean().optional().default(true),
});

export const updateProductSchema = createProductSchema.extend({
  is_active: z.boolean(),
});

export const listProductsSchema = z.object({
  search: z
    .string()
    .trim()
    .max(100, 'Busca deve ter no máximo 100 caracteres.')
    .transform((value) => (value === '' ? undefined : value))
    .optional(),
  status: productStatusFilterSchema.default('all'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsInput = z.infer<typeof listProductsSchema>;
export type ProductStatusFilter = z.infer<typeof productStatusFilterSchema>;
