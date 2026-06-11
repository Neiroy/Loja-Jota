'use client';

import Link from 'next/link';
import { useActionState, useMemo, useState } from 'react';

import { createSaleAction } from '@/features/sales/actions/sale.actions';
import { SaleLineItemsEditor } from '@/features/sales/components/sale-line-items-editor';
import { SaleSummary } from '@/features/sales/components/sale-summary';
import { PAYMENT_METHOD_LABELS } from '@/features/sales/utils/payment-method-labels';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
  const [discount, setDiscount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [items, setItems] = useState<CreateSaleItemInput[]>([
    createInitialItem(),
  ]);
  const [state, formAction, isPending] = useActionState(createSaleAction, null);

  const itemsJson = useMemo(() => JSON.stringify(items), [items]);

  return (
    <form
      action={formAction}
      className={cn('space-y-6', isPending && 'pointer-events-none opacity-80')}
    >
      <input type="hidden" name="items_json" value={itemsJson} />

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
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 disabled:opacity-50"
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="discount">Desconto (R$)</Label>
            <Input
              id="discount"
              name="discount"
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(event) => setDiscount(event.target.value)}
              disabled={isPending}
            />
            {state?.fieldErrors?.discount ? (
              <p className="text-destructive text-sm">
                {state.fieldErrors.discount[0]}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Forma de pagamento *</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {PAYMENT_OPTIONS.map((method) => (
              <label
                key={method}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200/80 px-3 py-2 text-sm"
              >
                <input
                  type="radio"
                  name="payment_method"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={() => setPaymentMethod(method)}
                  disabled={isPending}
                  className="size-4"
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

      <SaleSummary
        items={items}
        products={products}
        discount={Number(discount) || 0}
      />

      {state?.error ? (
        <p className="text-destructive text-sm">{state.error}</p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
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
