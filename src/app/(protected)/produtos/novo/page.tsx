import { PageHeader } from '@/components/layout/page-header';
import { ProductForm } from '@/features/products/components/product-form';

export default function NovoProdutoPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Novo produto"
        description="Cadastre um produto para controle interno de estoque e vendas."
      />
      <div className="max-w-3xl">
        <ProductForm mode="create" cancelHref="/produtos" />
      </div>
    </div>
  );
}
