'use client';

import Link from 'next/link';
import { useActionState, useMemo, useState } from 'react';

import { createHistoricalSaleAction } from '@/features/sales/actions/historical-sale.actions';
import { SalePaymentStatusBadge } from '@/features/sales/components/sale-payment-status-badge';
import { PAYMENT_METHOD_LABELS } from '@/features/sales/utils/payment-method-labels';
import { Button, buttonVariants } from '@/components/ui/button';
import { FormSection } from '@/components/shared/form-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  maskCurrencyBR,
  onlyIntegerString,
  parseCurrencyBRToNumber,
} from '@/lib/masks';
import { fieldControlClassName, surfaceCardClassName } from '@/lib/surface';
import {
  getHistoricalItemsSum,
  getHistoricalSalePreviewInstallmentAmount,
  getHistoricalSalePreviewStatus,
} from '@/schemas/historical-sale.schema';
import type { PaymentMethod } from '@/schemas/sale.schema';
import type { Customer } from '@/types/customer.types';
import type { Product } from '@/types/product.types';
import { formatProductPrice } from '@/features/products/utils/format-product-price';

type HistoricalSaleFormProps = {
  customers: Customer[];
  products: Product[];
};

type HistoricalLineItem = {
  catalog_product_id: string;
  description: string;
  quantity: string;
  unit_price_display: string;
};

const PAYMENT_OPTIONS: PaymentMethod[] = [
  'cash',
  'pix',
  'card',
  'credit_30_days',
];

function createEmptyLineItem(): HistoricalLineItem {
  return {
    catalog_product_id: '',
    description: '',
    quantity: '1',
    unit_price_display: '',
  };
}

function parseQuantityForPreview(value: string) {
  if (!value.trim()) {
    return 0;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function parseQuantityForPayload(value: string) {
  if (!value.trim()) {
    return '';
  }

  return Number.parseInt(value, 10);
}

function formatProductOptionLabel(product: Product) {
  const details = [product.category, product.size, product.color]
    .filter(Boolean)
    .join(' · ');

  return details ? `${product.name} (${details})` : product.name;
}

function getItemsFieldError(fieldErrors: Record<string, string[]> | undefined) {
  if (!fieldErrors) {
    return undefined;
  }

  if (fieldErrors.items?.[0]) {
    return fieldErrors.items[0];
  }

  const nested = Object.entries(fieldErrors).find(([key]) =>
    key.startsWith('items')
  );

  return nested?.[1]?.[0];
}

export function HistoricalSaleForm({
  customers,
  products,
}: HistoricalSaleFormProps) {
  const [customerId, setCustomerId] = useState('');
  const [saleDate, setSaleDate] = useState('');
  const [totalDisplay, setTotalDisplay] = useState('');
  const [downPaymentDisplay, setDownPaymentDisplay] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [pendingInstallments, setPendingInstallments] = useState('1');
  const [firstDueDate, setFirstDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<HistoricalLineItem[]>([]);
  const [state, formAction, isPending] = useActionState(
    createHistoricalSaleAction,
    null
  );

  const totalValue = parseCurrencyBRToNumber(totalDisplay);
  const downPaymentValue = parseCurrencyBRToNumber(downPaymentDisplay);
  const remaining = Math.max(
    Math.round((totalValue - downPaymentValue) * 100) / 100,
    0
  );
  const installmentsCount = Number.parseInt(pendingInstallments, 10);
  const hasBalance = remaining > 0;
  const previewStatus = getHistoricalSalePreviewStatus(
    totalValue,
    downPaymentValue
  );
  const previewInstallmentAmount = getHistoricalSalePreviewInstallmentAmount(
    totalValue,
    downPaymentValue,
    Number.isFinite(installmentsCount) ? installmentsCount : 0
  );

  const itemsPayload = useMemo(
    () =>
      items.map((item) => {
        const payload: {
          description: string;
          quantity: number | string;
          unit_price: number;
          product_id?: string;
        } = {
          description: item.description,
          quantity: parseQuantityForPayload(item.quantity),
          unit_price: parseCurrencyBRToNumber(item.unit_price_display),
        };

        if (item.catalog_product_id) {
          payload.product_id = item.catalog_product_id;
        }

        return payload;
      }),
    [items]
  );

  const itemsSum = getHistoricalItemsSum(
    items.map((item) => ({
      quantity: parseQuantityForPreview(item.quantity),
      unit_price: parseCurrencyBRToNumber(item.unit_price_display),
    }))
  );
  const hasItems = items.length > 0;
  const itemsSumMismatch =
    hasItems &&
    totalValue > 0 &&
    Math.round(itemsSum * 100) !== Math.round(totalValue * 100);
  const itemsError = getItemsFieldError(state?.fieldErrors);

  const customerOptions = useMemo(
    () =>
      [...customers].sort((left, right) =>
        left.name.localeCompare(right.name, 'pt-BR')
      ),
    [customers]
  );

  const productOptions = useMemo(
    () =>
      [...products].sort((left, right) =>
        left.name.localeCompare(right.name, 'pt-BR')
      ),
    [products]
  );

  function updateItem(index: number, patch: Partial<HistoricalLineItem>) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      )
    );
  }

  function applyCatalogProduct(index: number, productId: string) {
    const product = productOptions.find((entry) => entry.id === productId);

    if (!product) {
      updateItem(index, { catalog_product_id: productId });
      return;
    }

    updateItem(index, {
      catalog_product_id: product.id,
      description: product.name,
      unit_price_display: maskCurrencyBR(
        product.sale_price.toFixed(2).replace('.', ',')
      ),
    });
  }

  return (
    <form
      action={formAction}
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <input
        type="hidden"
        name="items_json"
        value={JSON.stringify(itemsPayload)}
      />

      <div className="space-y-6">
        <FormSection
          title="Dados da venda antiga"
          description="Informe os dados financeiros registrados no caderno. Esta venda não altera o estoque."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="customer_id">Cliente</Label>
              <select
                id="customer_id"
                name="customer_id"
                value={customerId}
                onChange={(event) => setCustomerId(event.target.value)}
                className={fieldControlClassName}
                disabled={isPending}
                aria-invalid={Boolean(state?.fieldErrors?.customer_id)}
              >
                <option value="">Selecione um cliente</option>
                {customerOptions.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              {state?.fieldErrors?.customer_id ? (
                <p className="text-destructive text-sm">
                  {state.fieldErrors.customer_id[0]}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale_date">Data original da venda</Label>
              <Input
                id="sale_date"
                name="sale_date"
                type="date"
                value={saleDate}
                onChange={(event) => setSaleDate(event.target.value)}
                disabled={isPending}
                aria-invalid={Boolean(state?.fieldErrors?.sale_date)}
              />
              {state?.fieldErrors?.sale_date ? (
                <p className="text-destructive text-sm">
                  {state.fieldErrors.sale_date[0]}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">
                Forma de pagamento original
              </Label>
              <select
                id="payment_method"
                name="payment_method"
                required
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(event.target.value as PaymentMethod)
                }
                className={fieldControlClassName}
                disabled={isPending}
              >
                {PAYMENT_OPTIONS.map((method) => (
                  <option key={method} value={method}>
                    {PAYMENT_METHOD_LABELS[method]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total">Valor total</Label>
              <Input
                id="total"
                name="total"
                inputMode="decimal"
                placeholder="R$ 0,00"
                value={totalDisplay}
                onChange={(event) =>
                  setTotalDisplay(maskCurrencyBR(event.target.value))
                }
                disabled={isPending}
                aria-invalid={Boolean(state?.fieldErrors?.total)}
              />
              {state?.fieldErrors?.total ? (
                <p className="text-destructive text-sm">
                  {state.fieldErrors.total[0]}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="down_payment">Valor já pago</Label>
              <Input
                id="down_payment"
                name="down_payment"
                inputMode="decimal"
                placeholder="R$ 0,00"
                value={downPaymentDisplay}
                onChange={(event) =>
                  setDownPaymentDisplay(maskCurrencyBR(event.target.value))
                }
                disabled={isPending}
                aria-invalid={Boolean(state?.fieldErrors?.down_payment)}
              />
              {state?.fieldErrors?.down_payment ? (
                <p className="text-destructive text-sm">
                  {state.fieldErrors.down_payment[0]}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pending_installments">Parcelas pendentes</Label>
              <Input
                id="pending_installments"
                name="pending_installments"
                inputMode="numeric"
                value={pendingInstallments}
                onChange={(event) =>
                  setPendingInstallments(onlyIntegerString(event.target.value))
                }
                disabled={isPending || !hasBalance}
                aria-invalid={Boolean(state?.fieldErrors?.pending_installments)}
              />
              {state?.fieldErrors?.pending_installments ? (
                <p className="text-destructive text-sm">
                  {state.fieldErrors.pending_installments[0]}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="first_due_date">
                Data do primeiro vencimento
              </Label>
              <Input
                id="first_due_date"
                name="first_due_date"
                type="date"
                value={firstDueDate}
                onChange={(event) => setFirstDueDate(event.target.value)}
                disabled={isPending || !hasBalance}
                aria-invalid={Boolean(state?.fieldErrors?.first_due_date)}
              />
              {state?.fieldErrors?.first_due_date ? (
                <p className="text-destructive text-sm">
                  {state.fieldErrors.first_due_date[0]}
                </p>
              ) : null}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Observação</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Ex.: Venda anotada no caderno em janeiro."
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                disabled={isPending}
              />
              {state?.fieldErrors?.notes ? (
                <p className="text-destructive text-sm">
                  {state.fieldErrors.notes[0]}
                </p>
              ) : null}
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Produtos vendidos"
          description="Opcional. Registre o que foi vendido no caderno. Não altera o estoque."
        >
          <div className="space-y-4">
            {items.map((item, index) => {
              const quantityPreview = parseQuantityForPreview(item.quantity);
              const unitPrice = parseCurrencyBRToNumber(
                item.unit_price_display
              );
              const lineTotal =
                Math.round(quantityPreview * unitPrice * 100) / 100;

              return (
                <div
                  key={`historical-item-${index}`}
                  className="space-y-4 rounded-xl border border-stone-200/70 bg-stone-50/40 p-4"
                >
                  {productOptions.length > 0 ? (
                    <div className="space-y-2">
                      <Label htmlFor={`catalog_product_${index}`}>
                        Preencher do catálogo (opcional)
                      </Label>
                      <select
                        id={`catalog_product_${index}`}
                        value={item.catalog_product_id}
                        onChange={(event) =>
                          applyCatalogProduct(index, event.target.value)
                        }
                        disabled={isPending}
                        className={fieldControlClassName}
                      >
                        <option value="">Digitar manualmente</option>
                        {productOptions.map((product) => (
                          <option key={product.id} value={product.id}>
                            {formatProductOptionLabel(product)}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  <div className="grid gap-4 sm:grid-cols-[1fr_100px_140px_120px_auto]">
                    <div className="space-y-2">
                      <Label htmlFor={`description_${index}`}>Produto *</Label>
                      <Input
                        id={`description_${index}`}
                        value={item.description}
                        onChange={(event) =>
                          updateItem(index, {
                            description: event.target.value,
                            catalog_product_id: '',
                          })
                        }
                        placeholder="Ex.: Camisa polo M"
                        disabled={isPending}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`quantity_${index}`}>Qtd. *</Label>
                      <Input
                        id={`quantity_${index}`}
                        inputMode="numeric"
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(index, {
                            quantity: onlyIntegerString(event.target.value),
                          })
                        }
                        onBlur={(event) => {
                          const normalized = onlyIntegerString(
                            event.target.value
                          );
                          updateItem(index, {
                            quantity: normalized,
                          });
                        }}
                        disabled={isPending}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`unit_price_${index}`}>
                        Valor unitário
                      </Label>
                      <Input
                        id={`unit_price_${index}`}
                        inputMode="decimal"
                        placeholder="R$ 0,00"
                        value={item.unit_price_display}
                        onChange={(event) =>
                          updateItem(index, {
                            unit_price_display: maskCurrencyBR(
                              event.target.value
                            ),
                          })
                        }
                        disabled={isPending}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Total do item</Label>
                      <p className="flex h-10 items-center text-sm font-medium text-stone-900">
                        {formatProductPrice(lineTotal)}
                      </p>
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isPending}
                        onClick={() =>
                          setItems((current) =>
                            current.filter(
                              (_, itemIndex) => itemIndex !== index
                            )
                          )
                        }
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() =>
                setItems((current) => [...current, createEmptyLineItem()])
              }
            >
              Adicionar produto
            </Button>

            {itemsError ? (
              <p className="text-destructive text-sm">{itemsError}</p>
            ) : null}

            {itemsSumMismatch ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                A soma dos produtos ({formatProductPrice(itemsSum)}) é diferente
                do valor total informado ({formatProductPrice(totalValue)}). A
                venda será salva usando o valor total financeiro.
              </p>
            ) : null}
          </div>
        </FormSection>

        {state?.error ? (
          <p className="text-destructive text-sm" role="alert">
            {state.error}
          </p>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Link
            href="/vendas"
            className={cn(buttonVariants({ variant: 'outline' }))}
          >
            Cancelar
          </Link>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Lançando...' : 'Lançar venda antiga'}
          </Button>
        </div>
      </div>

      <aside className={cn(surfaceCardClassName, 'h-fit space-y-4 p-5 sm:p-6')}>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-stone-900">Resumo</h2>
          <p className="text-sm text-stone-500">
            Parcelas mensais a partir do primeiro vencimento.
          </p>
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-stone-500">Total</dt>
            <dd className="font-medium text-stone-900">
              {formatProductPrice(totalValue)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-stone-500">Valor já pago</dt>
            <dd className="font-medium text-stone-900">
              {formatProductPrice(downPaymentValue)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-stone-500">Saldo a receber</dt>
            <dd className="font-medium text-stone-900">
              {formatProductPrice(remaining)}
            </dd>
          </div>
          {hasItems ? (
            <div className="flex items-center justify-between gap-3">
              <dt className="text-stone-500">Soma dos produtos</dt>
              <dd className="font-medium text-stone-900">
                {formatProductPrice(itemsSum)}
              </dd>
            </div>
          ) : null}
          {hasBalance ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-stone-500">Parcelas pendentes</dt>
                <dd className="font-medium text-stone-900">
                  {Number.isFinite(installmentsCount) && installmentsCount > 0
                    ? installmentsCount
                    : '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-stone-500">Valor aprox. por parcela</dt>
                <dd className="font-medium text-stone-900">
                  {formatProductPrice(previewInstallmentAmount)}
                </dd>
              </div>
            </>
          ) : null}
          <div className="flex items-center justify-between gap-3 border-t border-stone-200/80 pt-3">
            <dt className="text-stone-500">Status previsto</dt>
            <dd>
              <SalePaymentStatusBadge status={previewStatus} compact />
            </dd>
          </div>
        </dl>
      </aside>
    </form>
  );
}
