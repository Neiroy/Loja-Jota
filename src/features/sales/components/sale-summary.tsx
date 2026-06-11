import { formatProductPrice } from '@/features/products/utils/format-product-price';
import { FormSection } from '@/components/shared/form-section';
import type { CreateSaleItemInput } from '@/schemas/sale.schema';
import type { Product } from '@/types/product.types';

type SaleSummaryProps = {
  items: CreateSaleItemInput[];
  products: Product[];
  discount: number;
};

export function SaleSummary({ items, products, discount }: SaleSummaryProps) {
  const productMap = new Map(products.map((product) => [product.id, product]));

  const subtotal = items.reduce((sum, item) => {
    const product = productMap.get(item.product_id);

    if (!product || !item.quantity) {
      return sum;
    }

    return sum + product.sale_price * item.quantity;
  }, 0);

  const safeDiscount = Number.isFinite(discount) && discount > 0 ? discount : 0;
  const total = Math.max(subtotal - safeDiscount, 0);

  return (
    <FormSection
      title="Resumo estimado"
      description="Valores finais são calculados no servidor no momento do registro."
    >
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between text-stone-600">
          <span>Subtotal estimado</span>
          <span>{formatProductPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-stone-600">
          <span>Desconto</span>
          <span>{formatProductPrice(safeDiscount)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-stone-200/80 pt-2 text-base font-medium text-stone-900">
          <span>Total estimado</span>
          <span>{formatProductPrice(total)}</span>
        </div>
      </div>
    </FormSection>
  );
}
