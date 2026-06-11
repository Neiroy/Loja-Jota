'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CreateSaleItemInput } from '@/schemas/sale.schema';
import type { Product } from '@/types/product.types';

type SaleLineItemsEditorProps = {
  items: CreateSaleItemInput[];
  products: Product[];
  disabled?: boolean;
  error?: string;
  onChange: (items: CreateSaleItemInput[]) => void;
};

function createEmptyItem(): CreateSaleItemInput {
  return {
    product_id: '',
    quantity: 1,
  };
}

function formatProductLabel(product: Product) {
  const details = [product.category, product.size, product.color]
    .filter(Boolean)
    .join(' · ');

  return details
    ? `${product.name} (${details}) — estoque: ${product.stock_quantity}`
    : `${product.name} — estoque: ${product.stock_quantity}`;
}

export function SaleLineItemsEditor({
  items,
  products,
  disabled = false,
  error,
  onChange,
}: SaleLineItemsEditorProps) {
  function updateItem(index: number, patch: Partial<CreateSaleItemInput>) {
    onChange(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      )
    );
  }

  function removeItem(index: number) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  function addItem() {
    onChange([...items, createEmptyItem()]);
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={`sale-item-${index}`}
          className="grid gap-3 rounded-lg border border-stone-200/80 p-4 sm:grid-cols-[1fr_120px_auto]"
        >
          <div className="space-y-2">
            <Label htmlFor={`product_id_${index}`}>Produto *</Label>
            <select
              id={`product_id_${index}`}
              value={item.product_id}
              onChange={(event) =>
                updateItem(index, { product_id: event.target.value })
              }
              disabled={disabled}
              className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 disabled:opacity-50"
            >
              <option value="">Selecione um produto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {formatProductLabel(product)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`quantity_${index}`}>Quantidade *</Label>
            <Input
              id={`quantity_${index}`}
              type="number"
              min="1"
              step="1"
              value={item.quantity}
              onChange={(event) =>
                updateItem(index, {
                  quantity: Number(event.target.value),
                })
              }
              disabled={disabled}
            />
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => removeItem(index)}
              disabled={disabled || items.length === 1}
            >
              Remover
            </Button>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addItem}
        disabled={disabled}
      >
        Adicionar item
      </Button>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}
