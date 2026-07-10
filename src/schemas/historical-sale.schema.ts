import { z } from 'zod';

import { paymentMethodSchema } from '@/schemas/sale.schema';

function emptyToNull(value: unknown) {
  if (value === '' || value === undefined || value === null) {
    return null;
  }

  return value;
}

function parseSaleDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export const historicalSaleItemSchema = z.object({
  description: z
    .string({ error: 'Informe a descrição do produto.' })
    .trim()
    .min(1, 'Informe a descrição do produto.')
    .max(200, 'Descrição do produto muito longa.'),
  quantity: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return undefined;
      }

      return value;
    },
    z.coerce
      .number({ error: 'Informe a quantidade.' })
      .int('Quantidade deve ser um número inteiro.')
      .positive('Quantidade deve ser maior que zero.')
  ),
  unit_price: z.coerce
    .number({ error: 'Informe o valor unitário.' })
    .min(0, 'Valor unitário deve ser maior ou igual a zero.')
    .transform((value) => Math.round(value * 100) / 100),
  product_id: z.preprocess(
    emptyToNull,
    z.nullable(z.string().uuid('Produto inválido.')).optional()
  ),
});

export const createHistoricalSaleSchema = z
  .object({
    customer_id: z
      .string({ error: 'Selecione um cliente.' })
      .trim()
      .min(1, 'Selecione um cliente.')
      .uuid('Selecione um cliente.'),
    sale_date: z
      .string({ error: 'Informe uma data válida.' })
      .trim()
      .min(1, 'Informe uma data válida.')
      .refine(
        (value) => parseSaleDate(value) !== null,
        'Informe uma data válida.'
      )
      .refine((value) => {
        const parsed = parseSaleDate(value);

        if (!parsed) {
          return false;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return parsed.getTime() <= today.getTime();
      }, 'Data da venda não pode ser futura.'),
    total: z.coerce
      .number({ error: 'Informe o valor total.' })
      .positive('Informe o valor total.')
      .transform((value) => Math.round(value * 100) / 100),
    down_payment: z.coerce
      .number({ error: 'Informe um valor já pago válido.' })
      .min(0, 'Informe um valor já pago válido.')
      .default(0)
      .transform((value) => Math.round(value * 100) / 100),
    payment_method: paymentMethodSchema,
    pending_installments: z.preprocess(
      emptyToNull,
      z.nullable(
        z.coerce
          .number({ error: 'Informe a quantidade de parcelas pendentes.' })
          .int('Informe a quantidade de parcelas pendentes.')
          .positive('Informe a quantidade de parcelas pendentes.')
      )
    ),
    first_due_date: z.preprocess(
      emptyToNull,
      z
        .string()
        .nullable()
        .refine(
          (value) => value === null || parseSaleDate(value) !== null,
          'Informe a data do primeiro vencimento.'
        )
    ),
    notes: z.preprocess((value) => {
      if (value === undefined || value === null || value === '') {
        return null;
      }

      if (typeof value !== 'string') {
        return value;
      }

      const trimmed = value.trim();
      return trimmed ? trimmed : null;
    }, z.string().max(1000, 'Observação muito longa.').nullable()),
    items: z.array(historicalSaleItemSchema).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.down_payment > data.total) {
      ctx.addIssue({
        code: 'custom',
        message: 'Valor já pago não pode ser maior que o total.',
        path: ['down_payment'],
      });
    }

    const remaining = Math.round((data.total - data.down_payment) * 100) / 100;

    if (remaining > 0) {
      if (data.pending_installments === null) {
        ctx.addIssue({
          code: 'custom',
          message: 'Informe a quantidade de parcelas pendentes.',
          path: ['pending_installments'],
        });
      }

      if (!data.first_due_date) {
        ctx.addIssue({
          code: 'custom',
          message: 'Informe a data do primeiro vencimento.',
          path: ['first_due_date'],
        });
      }
    } else if (data.pending_installments !== null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Venda quitada não deve ter parcelas pendentes.',
        path: ['pending_installments'],
      });
    }
  });

export type HistoricalSaleItemInput = z.infer<typeof historicalSaleItemSchema>;

export type CreateHistoricalSaleInput = z.infer<
  typeof createHistoricalSaleSchema
>;

export type HistoricalSalePreviewStatus = 'paid' | 'pending' | 'partially_paid';

export function getHistoricalSalePreviewStatus(
  total: number,
  downPayment: number
): HistoricalSalePreviewStatus {
  const remaining = Math.round((total - downPayment) * 100) / 100;

  if (remaining <= 0) {
    return 'paid';
  }

  if (downPayment <= 0) {
    return 'pending';
  }

  return 'partially_paid';
}

export function getHistoricalSalePreviewInstallmentAmount(
  total: number,
  downPayment: number,
  pendingInstallments: number
) {
  const remaining = Math.round((total - downPayment) * 100) / 100;

  if (remaining <= 0 || pendingInstallments < 1) {
    return 0;
  }

  return Math.round((remaining / pendingInstallments) * 100) / 100;
}

export function getHistoricalItemsSum(
  items: Array<{ quantity: number; unit_price: number }>
) {
  return (
    Math.round(
      items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0) *
        100
    ) / 100
  );
}

export { formatLocalDate, parseSaleDate };
