import { formatProductPrice } from '@/features/products/utils/format-product-price';
import { getSalePaymentSummaryLines } from '@/features/sales/utils/payment-method-labels';
import { surfaceCardClassName } from '@/lib/surface';
import { cn } from '@/lib/utils';
import type {
  CardPaymentType,
  CreateSaleItemInput,
  PaymentMethod,
} from '@/schemas/sale.schema';
import type { Product } from '@/types/product.types';

type SaleSummaryProps = {
  items: CreateSaleItemInput[];
  products: Product[];
  discount: number;
  paymentMethod: PaymentMethod;
  cardPaymentType: CardPaymentType | null;
  installmentsCount: number | null;
  financingInstallmentsCount: number | null;
  downPayment: number;
};

export function SaleSummary({
  items,
  products,
  discount,
  paymentMethod,
  cardPaymentType,
  installmentsCount,
  financingInstallmentsCount,
  downPayment,
}: SaleSummaryProps) {
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
  const paymentSummaryLines = getSalePaymentSummaryLines(
    {
      payment_method: paymentMethod,
      card_payment_type: cardPaymentType,
      installments_count: installmentsCount,
      financing_installments_count: financingInstallmentsCount,
      down_payment: downPayment,
    },
    total
  );

  return (
    <aside className={cn(surfaceCardClassName, 'overflow-hidden')}>
      <div className="border-b border-stone-200/60 bg-stone-50/50 px-6 py-5">
        <h3 className="text-lg font-semibold text-stone-900">
          Resumo estimado
        </h3>
        <p className="mt-1 text-sm text-stone-500">
          Valores finais são calculados no servidor.
        </p>
      </div>
      <div className="space-y-3 px-6 py-5 text-sm">
        <div className="flex items-center justify-between text-stone-600">
          <span>Subtotal estimado</span>
          <span className="font-medium text-stone-900">
            {formatProductPrice(subtotal)}
          </span>
        </div>
        <div className="flex items-center justify-between text-stone-600">
          <span>Desconto</span>
          <span className="font-medium text-stone-900">
            {formatProductPrice(safeDiscount)}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-stone-200/60 bg-stone-50/80 px-4 py-3 text-base font-semibold text-stone-900">
          <span>Total estimado</span>
          <span>{formatProductPrice(total)}</span>
        </div>
        {paymentSummaryLines.length > 0 ? (
          <div className="space-y-1 text-sm text-stone-600">
            {paymentSummaryLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
