'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

import { FilterPanel } from '@/components/shared/filter-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fieldControlClassName } from '@/lib/surface';
import type { ProductStatusFilter } from '@/schemas/product.schema';

type ProductsFiltersProps = {
  search: string;
  status: ProductStatusFilter;
};

const STATUS_OPTIONS: { value: ProductStatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
];

function normalizeFilters(search: string, status: ProductStatusFilter) {
  return {
    search: search ?? '',
    status: status ?? 'all',
  };
}

export function ProductsFilters({ search, status }: ProductsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const normalized = normalizeFilters(search, status);
  const [searchValue, setSearchValue] = useState(normalized.search);
  const [statusValue, setStatusValue] = useState<ProductStatusFilter>(
    normalized.status
  );
  const [syncedFilters, setSyncedFilters] = useState(normalized);

  if (
    syncedFilters.search !== normalized.search ||
    syncedFilters.status !== normalized.status
  ) {
    setSyncedFilters(normalized);
    setSearchValue(normalized.search);
    setStatusValue(normalized.status);
  }

  function applyFilters(nextSearch: string, nextStatus: ProductStatusFilter) {
    const params = new URLSearchParams(currentSearchParams.toString());

    if (nextSearch.trim()) {
      params.set('search', nextSearch.trim());
    } else {
      params.delete('search');
    }

    if (nextStatus === 'all') {
      params.delete('status');
    } else {
      params.set('status', nextStatus);
    }

    const query = params.toString();
    const href = query ? `${pathname}?${query}` : pathname;

    startTransition(() => {
      router.push(href);
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applyFilters(searchValue, statusValue);
  }

  function handleClear() {
    setSearchValue('');
    setStatusValue('all');
    setSyncedFilters({ search: '', status: 'all' });

    startTransition(() => {
      router.push(pathname);
    });
  }

  return (
    <FilterPanel onSubmit={handleSubmit}>
      <div className="flex-1 space-y-2">
        <Label htmlFor="search">Buscar</Label>
        <Input
          id="search"
          name="search"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Nome, categoria, tamanho ou cor"
          disabled={isPending}
        />
      </div>

      <div className="w-full space-y-2 sm:w-44">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          value={statusValue}
          onChange={(event) =>
            setStatusValue(event.target.value as ProductStatusFilter)
          }
          disabled={isPending}
          className={fieldControlClassName}
        >
          {STATUS_OPTIONS.map((option) => (
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
