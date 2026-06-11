import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/layout/page-header';
import { getProduct } from '@/features/products/actions/product.actions';
import { ProductForm } from '@/features/products/components/product-form';

type EditarProdutoPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarProdutoPage({
  params,
}: EditarProdutoPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar produto"
        description={`Atualize os dados de ${product.name}.`}
      />
      <ProductForm
        mode="edit"
        product={product}
        cancelHref={`/produtos/${product.id}`}
      />
    </div>
  );
}
