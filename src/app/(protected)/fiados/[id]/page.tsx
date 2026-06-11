import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/layout/page-header';
import { getReceivable } from '@/features/receivables/actions/receivable.actions';
import { ReceivableDetailCard } from '@/features/receivables/components/receivable-detail-card';
import { formatReceivableDate } from '@/features/receivables/utils/format-receivable-date';

type FiadoDetalhePageProps = {
  params: Promise<{ id: string }>;
};

export default async function FiadoDetalhePage({
  params,
}: FiadoDetalhePageProps) {
  const { id } = await params;
  const receivable = await getReceivable(id);

  if (!receivable) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Fiado de ${receivable.customer_name}`}
        description={`Vencimento em ${formatReceivableDate(receivable.due_date)}`}
      />
      <ReceivableDetailCard receivable={receivable} />
    </div>
  );
}
