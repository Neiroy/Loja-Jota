import { z } from 'zod';

export const paymentMethodSchema = z.enum([
  'cash',
  'pix',
  'card',
  'credit_30_days',
]);

export const cardPaymentTypeSchema = z.enum(['debit', 'credit']);

export const ALLOWED_CARD_INSTALLMENT_COUNTS = [
  1, 2, 3, 4, 5, 6, 10, 12,
] as const;

export const ALLOWED_FINANCING_INSTALLMENT_COUNTS = [
  2, 3, 4, 5, 6, 10, 12,
] as const;

export const cardInstallmentsCountSchema = z.coerce
  .number({ error: 'Parcelamento inválido.' })
  .int('Parcelamento deve ser um número inteiro.')
  .refine(
    (value) =>
      ALLOWED_CARD_INSTALLMENT_COUNTS.includes(
        value as (typeof ALLOWED_CARD_INSTALLMENT_COUNTS)[number]
      ),
    'Quantidade de parcelas inválida.'
  );

export const financingInstallmentsCountSchema = z.coerce
  .number({ error: 'Parcelamento inválido.' })
  .int('Parcelamento deve ser um número inteiro.')
  .refine(
    (value) =>
      ALLOWED_FINANCING_INSTALLMENT_COUNTS.includes(
        value as (typeof ALLOWED_FINANCING_INSTALLMENT_COUNTS)[number]
      ),
    'Quantidade de parcelas inválida.'
  );

export const salePaymentStatusFilterSchema = z.enum(['all', 'paid', 'pending']);

export const saleIdSchema = z.string().uuid('Identificador inválido.');

function optionalNullableCount() {
  return z.preprocess(
    (value) => {
      if (value === '' || value === undefined || value === null) {
        return null;
      }

      return value;
    },
    z.nullable(
      z.coerce.number().int('Parcelamento deve ser um número inteiro.')
    )
  );
}

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
    card_payment_type: z
      .union([cardPaymentTypeSchema, z.literal(''), z.null()])
      .optional()
      .transform((value) =>
        value === '' || value === undefined ? null : value
      ),
    installments_count: optionalNullableCount(),
    down_payment: z.coerce
      .number({ error: 'Entrada inválida.' })
      .min(0, 'Entrada deve ser maior ou igual a zero.')
      .default(0)
      .transform((value) => Math.round(value * 100) / 100),
    financing_installments_count: optionalNullableCount(),
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

    if (data.payment_method === 'credit_30_days') {
      if (data.card_payment_type !== null) {
        ctx.addIssue({
          code: 'custom',
          message: 'Tipo do cartão só é permitido para pagamento com cartão.',
          path: ['card_payment_type'],
        });
      }

      if (data.installments_count !== null) {
        ctx.addIssue({
          code: 'custom',
          message: 'Parcelamento de cartão só é permitido para cartão crédito.',
          path: ['installments_count'],
        });
      }

      if (data.down_payment !== 0) {
        ctx.addIssue({
          code: 'custom',
          message:
            'Entrada só é permitida em vendas parceladas com Pix ou Dinheiro.',
          path: ['down_payment'],
        });
      }

      if (data.financing_installments_count !== null) {
        ctx.addIssue({
          code: 'custom',
          message:
            'Parcelamento só é permitido para Pix, Dinheiro ou cartão crédito.',
          path: ['financing_installments_count'],
        });
      }

      return;
    }

    if (data.payment_method === 'card') {
      if (data.down_payment !== 0) {
        ctx.addIssue({
          code: 'custom',
          message:
            'Entrada só é permitida em vendas parceladas com Pix ou Dinheiro.',
          path: ['down_payment'],
        });
      }

      if (data.financing_installments_count !== null) {
        ctx.addIssue({
          code: 'custom',
          message:
            'Parcelamento financiado só é permitido para Pix ou Dinheiro.',
          path: ['financing_installments_count'],
        });
      }

      if (data.card_payment_type === null) {
        ctx.addIssue({
          code: 'custom',
          message: 'Selecione o tipo do cartão.',
          path: ['card_payment_type'],
        });
        return;
      }

      if (data.card_payment_type === 'debit') {
        if (data.installments_count !== null) {
          ctx.addIssue({
            code: 'custom',
            message: 'Cartão débito não permite parcelamento.',
            path: ['installments_count'],
          });
        }

        return;
      }

      if (data.installments_count === null) {
        ctx.addIssue({
          code: 'custom',
          message: 'Selecione o parcelamento do cartão crédito.',
          path: ['installments_count'],
        });
        return;
      }

      const installmentsResult = cardInstallmentsCountSchema.safeParse(
        data.installments_count
      );

      if (!installmentsResult.success) {
        ctx.addIssue({
          code: 'custom',
          message:
            installmentsResult.error.issues[0]?.message ??
            'Quantidade de parcelas inválida.',
          path: ['installments_count'],
        });
      }

      return;
    }

    if (data.card_payment_type !== null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Tipo do cartão só é permitido para pagamento com cartão.',
        path: ['card_payment_type'],
      });
    }

    if (data.installments_count !== null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Parcelamento de cartão só é permitido para cartão crédito.',
        path: ['installments_count'],
      });
    }

    if (data.payment_method !== 'cash' && data.payment_method !== 'pix') {
      return;
    }

    if (data.financing_installments_count === null) {
      if (data.down_payment !== 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'Entrada só é permitida em vendas parceladas.',
          path: ['down_payment'],
        });
      }

      return;
    }

    const financingResult = financingInstallmentsCountSchema.safeParse(
      data.financing_installments_count
    );

    if (!financingResult.success) {
      ctx.addIssue({
        code: 'custom',
        message:
          financingResult.error.issues[0]?.message ??
          'Quantidade de parcelas inválida.',
        path: ['financing_installments_count'],
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
export type CardPaymentType = z.infer<typeof cardPaymentTypeSchema>;
export type SalePaymentStatusFilter = z.infer<
  typeof salePaymentStatusFilterSchema
>;
