'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import {
  createProductAction,
  updateProductAction,
} from '@/features/products/actions/product.actions';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormSection } from '@/components/shared/form-section';
import type { Product } from '@/types/product.types';

type ProductFormProps = {
  mode: 'create' | 'edit';
  product?: Product;
  cancelHref: string;
};

export function ProductForm({ mode, product, cancelHref }: ProductFormProps) {
  const action =
    mode === 'create'
      ? createProductAction
      : updateProductAction.bind(null, product!.id);

  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <FormSection
      title={mode === 'create' ? 'Dados do produto' : 'Editar dados'}
      description="Ajuste preço e estoque manualmente. A baixa automática será feita nas vendas."
    >
      <form
        action={formAction}
        className={cn(
          'space-y-4',
          isPending && 'pointer-events-none opacity-80'
        )}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={product?.name ?? ''}
            placeholder="Ex.: Camisa Polo"
            aria-invalid={Boolean(state?.fieldErrors?.name)}
            disabled={isPending}
            required
          />
          {state?.fieldErrors?.name ? (
            <p className="text-destructive text-sm">
              {state.fieldErrors.name[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria *</Label>
          <Input
            id="category"
            name="category"
            defaultValue={product?.category ?? ''}
            placeholder="Ex.: Camisas, Acessórios"
            aria-invalid={Boolean(state?.fieldErrors?.category)}
            disabled={isPending}
            required
          />
          {state?.fieldErrors?.category ? (
            <p className="text-destructive text-sm">
              {state.fieldErrors.category[0]}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="size">Tamanho</Label>
            <Input
              id="size"
              name="size"
              defaultValue={product?.size ?? ''}
              placeholder="Ex.: M, G, GG"
              aria-invalid={Boolean(state?.fieldErrors?.size)}
              disabled={isPending}
            />
            {state?.fieldErrors?.size ? (
              <p className="text-destructive text-sm">
                {state.fieldErrors.size[0]}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Cor</Label>
            <Input
              id="color"
              name="color"
              defaultValue={product?.color ?? ''}
              placeholder="Ex.: Azul, Preto"
              aria-invalid={Boolean(state?.fieldErrors?.color)}
              disabled={isPending}
            />
            {state?.fieldErrors?.color ? (
              <p className="text-destructive text-sm">
                {state.fieldErrors.color[0]}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sale_price">Preço de venda *</Label>
            <Input
              id="sale_price"
              name="sale_price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product?.sale_price ?? ''}
              placeholder="0,00"
              aria-invalid={Boolean(state?.fieldErrors?.sale_price)}
              disabled={isPending}
              required
            />
            {state?.fieldErrors?.sale_price ? (
              <p className="text-destructive text-sm">
                {state.fieldErrors.sale_price[0]}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock_quantity">Quantidade em estoque *</Label>
            <Input
              id="stock_quantity"
              name="stock_quantity"
              type="number"
              min="0"
              step="1"
              defaultValue={product?.stock_quantity ?? 0}
              placeholder="0"
              aria-invalid={Boolean(state?.fieldErrors?.stock_quantity)}
              disabled={isPending}
              required
            />
            {state?.fieldErrors?.stock_quantity ? (
              <p className="text-destructive text-sm">
                {state.fieldErrors.stock_quantity[0]}
              </p>
            ) : null}
          </div>
        </div>

        {mode === 'edit' ? (
          <div className="flex items-center gap-2">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              defaultChecked={product?.is_active ?? true}
              disabled={isPending}
              className="size-4 rounded border-stone-300"
            />
            <Label htmlFor="is_active" className="font-normal">
              Produto ativo
            </Label>
          </div>
        ) : null}

        {state?.error ? (
          <p className="text-destructive text-sm">{state.error}</p>
        ) : null}

        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <Button type="submit" disabled={isPending}>
            {isPending
              ? 'Salvando...'
              : mode === 'create'
                ? 'Cadastrar produto'
                : 'Salvar alterações'}
          </Button>
          <Link
            href={cancelHref}
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
    </FormSection>
  );
}
