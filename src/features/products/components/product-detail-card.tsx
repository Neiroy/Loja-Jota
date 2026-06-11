import { FormSection } from '@/components/shared/form-section';
import { ProductStatusBadge } from '@/features/products/components/product-status-badge';
import { ProductStockBadge } from '@/features/products/components/product-stock-badge';
import { formatProductPrice } from '@/features/products/utils/format-product-price';
import type { Product } from '@/types/product.types';

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

type DetailFieldProps = {
  label: string;
  value: React.ReactNode;
};

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">
        {label}
      </p>
      <p className="text-sm text-stone-900">{value}</p>
    </div>
  );
}

type ProductDetailCardProps = {
  product: Product;
};

export function ProductDetailCard({ product }: ProductDetailCardProps) {
  return (
    <FormSection title="Informações do produto">
      <div className="grid gap-4 sm:grid-cols-2">
        <DetailField label="Nome" value={product.name} />
        <DetailField
          label="Status"
          value={<ProductStatusBadge isActive={product.is_active} />}
        />
        <DetailField
          label="Categoria"
          value={product.category ?? 'Não informada'}
        />
        <DetailField label="Tamanho" value={product.size ?? 'Não informado'} />
        <DetailField label="Cor" value={product.color ?? 'Não informada'} />
        <DetailField
          label="Preço de venda"
          value={formatProductPrice(product.sale_price)}
        />
        <DetailField
          label="Estoque"
          value={
            <span className="inline-flex items-center gap-2">
              {product.stock_quantity} un.
              <ProductStockBadge quantity={product.stock_quantity} />
            </span>
          }
        />
        <DetailField
          label="Cadastrado em"
          value={formatDateTime(product.created_at)}
        />
        <DetailField
          label="Atualizado em"
          value={formatDateTime(product.updated_at)}
        />
      </div>
    </FormSection>
  );
}
