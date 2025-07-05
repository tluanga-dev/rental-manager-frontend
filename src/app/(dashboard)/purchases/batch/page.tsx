import { BatchPurchaseWizard } from '@/components/batch-purchase/batch-purchase-wizard';

export default function BatchPurchasePage() {
  return <BatchPurchaseWizard />;
}

export const metadata = {
  title: 'Purchase with Items | Rental Manager',
  description: 'Create a purchase and add new items and SKUs in one workflow',
};