'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { TransactionWizard } from '@/components/transactions';

function NewSaleContent() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          New Sale
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create a new sales transaction
        </p>
      </div>
      
      <TransactionWizard 
        transactionType="SALE" 
        onComplete={() => {}}
        onCancel={() => {}}
      />
    </div>
  );
}

export default function NewSalePage() {
  return (
    <ProtectedRoute requiredPermissions={['SALE_CREATE']}>
      <NewSaleContent />
    </ProtectedRoute>
  );
}