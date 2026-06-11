'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

import { FilterPanel } from '@/components/shared/filter-panel';
import { PAYMENT_METHOD_LABELS } from '@/features/sales/utils/payment-method-labels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fieldControlClassName } from '@/lib/surface';
import type { PaymentMethod } from '@/schemas/sale.schema';
import type { SalePaymentStatusFilter } from '@/schemas/sale.schema';

type SalesFiltersProps = {
  search: string;
  paymentMethod: PaymentMethod | 'all';
  paymentStatus: SalePaymentStatusFilter;
};

const PAYMENT_FILTER_OPTIONS: Array<{
  value: PaymentMethod | 'all';
  label: string;
}> = [
  { value: 'all', label: 'Todas' },
  { value: 'cash', label: PAYMENT_METHOD_LABELS.cash },
  { value: 'pix', label: PAYMENT_METHOD_LABELS.pix },
  { value: 'card', label: PAYMENT_METHOD_LABELS.card },
  { value: 'credit_30_days', label: PAYMENT_METHOD_LABELS.credit_30_days },
];

const STATUS_FILTER_OPTIONS: Array<{
  value: SalePaymentStatusFilter;
  label: string;
}> = [
  { value: 'all', label: 'Todos' },
  { value: 'paid', label: 'Pagos' },
  { value: 'pending', label: 'Pendentes' },
];

function normalizeFilters(
  search: string,
  paymentMethod: PaymentMethod | 'all',
  paymentStatus: SalePaymentStatusFilter
) {
  return {
    search: search ?? '',
    paymentMethod: paymentMethod ?? 'all',
    paymentStatus: paymentStatus ?? 'all',
  };
}

export function SalesFilters({
  search,
  paymentMethod,
  paymentStatus,
}: SalesFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const normalized = normalizeFilters(search, paymentMethod, paymentStatus);
  const [searchValue, setSearchValue] = useState(normalized.search);
  const [paymentMethodValue, setPaymentMethodValue] = useState(
    normalized.paymentMethod
  );
  const [paymentStatusValue, setPaymentStatusValue] = useState(
    normalized.paymentStatus
  );
  const [syncedFilters, setSyncedFilters] = useState(normalized);

  if (
    syncedFilters.search !== normalized.search ||
    syncedFilters.paymentMethod !== normalized.paymentMethod ||
    syncedFilters.paymentStatus !== normalized.paymentStatus
  ) {
    setSyncedFilters(normalized);
    setSearchValue(normalized.search);
    setPaymentMethodValue(normalized.paymentMethod);
    setPaymentStatusValue(normalized.paymentStatus);
  }

  function applyFilters(
    nextSearch: string,
    nextPaymentMethod: PaymentMethod | 'all',
    nextPaymentStatus: SalePaymentStatusFilter
  ) {
    const params = new URLSearchParams(currentSearchParams.toString());

    if (nextSearch.trim()) {
      params.set('search', nextSearch.trim());
    } else {
      params.delete('search');
    }

    if (nextPaymentMethod === 'all') {
      params.delete('payment_method');
    } else {
      params.set('payment_method', nextPaymentMethod);
    }

    if (nextPaymentStatus === 'all') {
      params.delete('payment_status');
    } else {
      params.set('payment_status', nextPaymentStatus);
    }

    const query = params.toString();
    const href = query ? `${pathname}?${query}` : pathname;

    startTransition(() => {
      router.push(href);
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applyFilters(searchValue, paymentMethodValue, paymentStatusValue);
  }

  function handleClear() {
    const cleared = normalizeFilters('', 'all', 'all');
    setSearchValue(cleared.search);
    setPaymentMethodValue(cleared.paymentMethod);
    setPaymentStatusValue(cleared.paymentStatus);
    setSyncedFilters(cleared);

    startTransition(() => {
      router.push(pathname);
    });
  }

  return (
    <FilterPanel onSubmit={handleSubmit}>
      <div className="flex-1 space-y-2">
        <Label htmlFor="search">Buscar cliente</Label>
        <Input
          id="search"
          name="search"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Nome do cliente"
          disabled={isPending}
        />
      </div>

      <div className="w-full space-y-2 sm:w-44">
        <Label htmlFor="payment_method">Pagamento</Label>
        <select
          id="payment_method"
          name="payment_method"
          value={paymentMethodValue}
          onChange={(event) =>
            setPaymentMethodValue(event.target.value as PaymentMethod | 'all')
          }
          disabled={isPending}
          className={fieldControlClassName}
        >
          {PAYMENT_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full space-y-2 sm:w-40">
        <Label htmlFor="payment_status">Status</Label>
        <select
          id="payment_status"
          name="payment_status"
          value={paymentStatusValue}
          onChange={(event) =>
            setPaymentStatusValue(event.target.value as SalePaymentStatusFilter)
          }
          disabled={isPending}
          className={fieldControlClassName}
        >
          {STATUS_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Buscando...' : 'Buscar'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleClear}
          disabled={isPending}
        >
          Limpar
        </Button>
      </div>
    </FilterPanel>
  );
}
