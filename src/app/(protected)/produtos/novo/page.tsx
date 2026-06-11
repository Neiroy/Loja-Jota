import { PageHeader } from '@/components/layout/page-header';
import { ProductForm } from '@/features/products/components/product-form';

export default function NovoProdutoPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo produto"
        description="Cadastre um produto para controle interno de estoque e vendas."
      />
      <ProductForm mode="create" cancelHref="/produtos" />
    </div>
  );
}
