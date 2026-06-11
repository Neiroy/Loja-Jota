import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/layout/page-header';
import { getProduct } from '@/features/products/actions/product.actions';
import { ProductDetailCard } from '@/features/products/components/product-detail-card';
import { ToggleProductStatusButton } from '@/features/products/components/toggle-product-status-button';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ProdutoDetalhePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProdutoDetalhePage({
  params,
}: ProdutoDetalhePageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        description="Detalhes do produto e controle de estoque."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={`/produtos/${product.id}/editar`}
              className={cn(buttonVariants({ variant: 'outline' }))}
            >
              Editar
            </Link>
            <ToggleProductStatusButton
              productId={product.id}
              isActive={product.is_active}
              productName={product.name}
            />
          </div>
        }
      />

      <ProductDetailCard product={product} />
    </div>
  );
}
