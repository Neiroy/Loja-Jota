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
import {
  ALLOWED_INSTALLMENT_COUNTS,
  type CardPaymentType,
  type CreateSaleItemInput,
  type PaymentMethod,
} from '@/schemas/sale.schema';
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

const CARD_TYPE_OPTIONS: Array<{ value: CardPaymentType; label: string }> = [
  { value: 'debit', label: 'Débito' },
  { value: 'credit', label: 'Crédito' },
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
  const [cardPaymentType, setCardPaymentType] =
    useState<CardPaymentType | null>(null);
  const [installmentsCount, setInstallmentsCount] = useState<number | null>(
    null
  );
  const [items, setItems] = useState<CreateSaleItemInput[]>([
    createInitialItem(),
  ]);
  const [state, formAction, isPending] = useActionState(createSaleAction, null);

  const itemsJson = useMemo(() => JSON.stringify(items), [items]);
  const discountValue = parseCurrencyBRToNumber(discountDisplay);

  function handlePaymentMethodChange(method: PaymentMethod) {
    setPaymentMethod(method);

    if (method !== 'card') {
      setCardPaymentType(null);
      setInstallmentsCount(null);
    }
  }

  function handleCardPaymentTypeChange(type: CardPaymentType) {
    setCardPaymentType(type);

    if (type === 'debit') {
      setInstallmentsCount(null);
      return;
    }

    setInstallmentsCount((current) => current ?? 1);
  }

  return (
    <form
      action={formAction}
      className={cn('space-y-6', isPending && 'pointer-events-none opacity-80')}
    >
      <input type="hidden" name="items_json" value={itemsJson} />
      <input type="hidden" name="discount" value={discountValue} />
      {paymentMethod === 'card' && cardPaymentType ? (
        <input type="hidden" name="card_payment_type" value={cardPaymentType} />
      ) : null}
      {paymentMethod === 'card' &&
      cardPaymentType === 'credit' &&
      installmentsCount != null ? (
        <input
          type="hidden"
          name="installments_count"
          value={installmentsCount}
        />
      ) : null}

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
                      onChange={() => handlePaymentMethodChange(method)}
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

            {paymentMethod === 'card' ? (
              <div className="space-y-4 rounded-xl border border-stone-200/70 bg-stone-50/50 p-4">
                <div className="space-y-3">
                  <Label>Tipo do cartão *</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {CARD_TYPE_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors',
                          cardPaymentType === option.value
                            ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                            : 'border-stone-200/70 bg-white text-stone-700 hover:bg-stone-50'
                        )}
                      >
                        <input
                          type="radio"
                          name="card_payment_type_ui"
                          value={option.value}
                          checked={cardPaymentType === option.value}
                          onChange={() =>
                            handleCardPaymentTypeChange(option.value)
                          }
                          disabled={isPending}
                          className="size-4 accent-stone-900"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {state?.fieldErrors?.card_payment_type ? (
                    <p className="text-destructive text-sm">
                      {state.fieldErrors.card_payment_type[0]}
                    </p>
                  ) : null}
                </div>

                {cardPaymentType === 'credit' ? (
                  <div className="space-y-2">
                    <Label htmlFor="installments_count">Parcelamento *</Label>
                    <select
                      id="installments_count"
                      value={installmentsCount ?? ''}
                      onChange={(event) =>
                        setInstallmentsCount(Number(event.target.value))
                      }
                      disabled={isPending}
                      required
                      className={fieldControlClassName}
                    >
                      <option value="" disabled>
                        Selecione as parcelas
                      </option>
                      {ALLOWED_INSTALLMENT_COUNTS.map((count) => (
                        <option key={count} value={count}>
                          {count}x
                        </option>
                      ))}
                    </select>
                    {state?.fieldErrors?.installments_count ? (
                      <p className="text-destructive text-sm">
                        {state.fieldErrors.installments_count[0]}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </FormSection>
        </div>

        <div className="xl:sticky xl:top-24">
          <SaleSummary
            items={items}
            products={products}
            discount={discountValue}
            paymentMethod={paymentMethod}
            cardPaymentType={cardPaymentType}
            installmentsCount={installmentsCount}
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
