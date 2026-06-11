'use client';

import Link from 'next/link';
import { useActionState, useMemo, useState } from 'react';

import { createSaleAction } from '@/features/sales/actions/sale.actions';
import { SaleLineItemsEditor } from '@/features/sales/components/sale-line-items-editor';
import { SaleSummary } from '@/features/sales/components/sale-summary';
import { PAYMENT_METHOD_LABELS } from '@/features/sales/utils/payment-method-labels';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { maskCurrencyBR, parseCurrencyBRToNumber } from '@/lib/masks';
import { fieldControlClassName } from '@/lib/surface';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormSection } from '@/components/shared/form-section';
import type { CreateSaleItemInput, PaymentMethod } from '@/schemas/sale.schema';
import type { Customer } from '@/types/customer.types';
import type { Product } from '@/types/product.types';

type SaleFormProps = {
  customers: Customer[];
  products: Product[];
};

const PAYMENT_OPTIONS: PaymentMethod[] = [
  'cash',
  'pix',
  'card',
  'credit_30_days',
];

function createInitialItem(): CreateSaleItemInput {
  return {
    product_id: '',
    quantity: 1,
  };
}

export function SaleForm({ customers, products }: SaleFormProps) {
  const [customerId, setCustomerId] = useState('');
  const [discountDisplay, setDiscountDisplay] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [items, setItems] = useState<CreateSaleItemInput[]>([
    createInitialItem(),
  ]);
  const [state, formAction, isPending] = useActionState(createSaleAction, null);

  const itemsJson = useMemo(() => JSON.stringify(items), [items]);
  const discountValue = parseCurrencyBRToNumber(discountDisplay);

  return (
    <form
      action={formAction}
      className={cn('space-y-6', isPending && 'pointer-events-none opacity-80')}
    >
      <input type="hidden" name="items_json" value={itemsJson} />
      <input type="hidden" name="discount" value={discountValue} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        <div className="space-y-6">
          <FormSection
            title="Cliente"
            description="Somente clientes ativos podem receber novas vendas."
          >
            <div className="space-y-2">
              <Label htmlFor="customer_id">Cliente *</Label>
              <select
                id="customer_id"
                name="customer_id"
                value={customerId}
                onChange={(event) => setCustomerId(event.target.value)}
                disabled={isPending}
                required
                className={fieldControlClassName}
              >
                <option value="">Selecione um cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                    {customer.phone ? ` — ${customer.phone}` : ''}
                  </option>
                ))}
              </select>
              {state?.fieldErrors?.customer_id ? (
                <p className="text-destructive text-sm">
                  {state.fieldErrors.customer_id[0]}
                </p>
              ) : null}
            </div>
          </FormSection>

          <FormSection
            title="Itens da venda"
            description="Selecione produtos ativos. O preço oficial será confirmado no servidor."
          >
            <SaleLineItemsEditor
              items={items}
              products={products}
              disabled={isPending}
              error={state?.fieldErrors?.items?.[0]}
              onChange={setItems}
            />
          </FormSection>

          <FormSection title="Pagamento">
            <div className="space-y-2">
              <Label htmlFor="discount_display">Desconto</Label>
              <Input
                id="discount_display"
                inputMode="numeric"
                value={discountDisplay}
                onChange={(event) =>
                  setDiscountDisplay(maskCurrencyBR(event.target.value))
                }
                placeholder="R$ 0,00"
                disabled={isPending}
              />
              {state?.fieldErrors?.discount ? (
                <p className="text-destructive text-sm">
                  {state.fieldErrors.discount[0]}
                </p>
              ) : null}
            </div>

            <div className="space-y-3">
              <Label>Forma de pagamento *</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {PAYMENT_OPTIONS.map((method) => (
                  <label
                    key={method}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors',
                      paymentMethod === method
                        ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                        : 'border-stone-200/70 bg-white text-stone-700 hover:bg-stone-50'
                    )}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      disabled={isPending}
                      className="size-4 accent-stone-900"
                    />
                    <span>{PAYMENT_METHOD_LABELS[method]}</span>
                  </label>
                ))}
              </div>
              {state?.fieldErrors?.payment_method ? (
                <p className="text-destructive text-sm">
                  {state.fieldErrors.payment_method[0]}
                </p>
              ) : null}
            </div>
          </FormSection>
        </div>

        <div className="xl:sticky xl:top-24">
          <SaleSummary
            items={items}
            products={products}
            discount={discountValue}
          />
        </div>
      </div>

      {state?.error ? (
        <p className="text-destructive text-sm">{state.error}</p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 border-t border-stone-200/60 pt-6 sm:flex-row sm:justify-start">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Registrando...' : 'Registrar venda'}
        </Button>
        <Link
          href="/vendas"
          aria-disabled={isPending}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            isPending && 'pointer-events-none opacity-50'
          )}
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
