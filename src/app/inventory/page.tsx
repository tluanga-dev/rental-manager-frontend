'use client';

import React from 'react';
import { InventoryDashboard } from '@/components/inventory/inventory-dashboard';
import { useRouter } from 'next/navigation';

export default function InventoryPage() {
  const router = useRouter();

  const handleViewLocation = (locationId: string) => {
    router.push(`/inventory/locations/${locationId}`);
  };

  const handleViewAlert = (alert: any) => {
    // Handle alert viewing - could open a modal or navigate to detail page
    console.log('Viewing alert:', alert);
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    // Handle alert acknowledgement
    console.log('Acknowledging alert:', alertId);
  };

  return (
    <div className="container mx-auto p-6">
      <InventoryDashboard
        onViewLocation={handleViewLocation}
        onViewAlert={handleViewAlert}
        onAcknowledgeAlert={handleAcknowledgeAlert}
      />
    </div>
  );
}