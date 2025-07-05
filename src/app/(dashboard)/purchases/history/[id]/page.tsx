'use client';

import { PurchaseDetailView } from '@/components/purchases/purchase-detail-view';

interface PurchaseDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PurchaseDetailPage({ params }: PurchaseDetailPageProps) {
  const { id } = await params;
  return (
    <div className="container mx-auto py-6">
      <PurchaseDetailView purchaseId={id} />
    </div>
  );
}