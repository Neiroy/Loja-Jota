import { z } from 'zod';

export const paymentMethodSchema = z.enum([
  'cash',
  'pix',
  'card',
  'credit_30_days',
]);

export const salePaymentStatusFilterSchema = z.enum(['all', 'paid', 'pending']);

export const saleIdSchema = z.string().uuid('Identificador inválido.');

export const createSaleItemSchema = z.object({
  product_id: z.string().uuid('Produto inválido.'),
  quantity: z.coerce
    .number({ error: 'Quantidade é obrigatória.' })
    .int('Quantidade deve ser um número inteiro.')
    .positive('Quantidade deve ser maior que zero.'),
});

export const createSaleSchema = z
  .object({
    customer_id: z.string().uuid('Cliente inválido.'),
    discount: z.coerce
      .number({ error: 'Desconto inválido.' })
      .min(0, 'Desconto deve ser maior ou igual a zero.')
      .default(0)
      .transform((value) => Math.round(value * 100) / 100),
    payment_method: paymentMethodSchema,
    items: z
      .array(createSaleItemSchema)
      .min(1, 'A venda deve ter pelo menos um item.'),
  })
  .superRefine((data, ctx) => {
    const productIds = data.items.map((item) => item.product_id);
    const uniqueIds = new Set(productIds);

    if (uniqueIds.size !== productIds.length) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Produto duplicado na venda. Agrupe a quantidade em um único item.',
        path: ['items'],
      });
    }
  });

export const listSalesSchema = z.object({
  search: z
    .string()
    .trim()
    .max(100, 'Busca deve ter no máximo 100 caracteres.')
    .transform((value) => (value === '' ? undefined : value))
    .optional(),
  payment_method: z
    .union([paymentMethodSchema, z.literal('all')])
    .optional()
    .transform((value) =>
      value === 'all' || value === undefined ? undefined : value
    ),
  payment_status: salePaymentStatusFilterSchema.default('all'),
});

export type ListSalesInput = z.input<typeof listSalesSchema>;
export type ListSalesFilters = z.output<typeof listSalesSchema>;

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type CreateSaleItemInput = z.infer<typeof createSaleItemSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type SalePaymentStatusFilter = z.infer<
  typeof salePaymentStatusFilterSchema
>;
