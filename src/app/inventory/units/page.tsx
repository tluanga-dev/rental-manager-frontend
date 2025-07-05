'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { InventoryList } from '@/components/inventory/inventory-list';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { InventoryUnit } from '@/types/inventory';

function InventoryUnitsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editDialog, setEditDialog] = useState(false);
  const [inspectDialog, setInspectDialog] = useState(false);
  const [transferDialog, setTransferDialog] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<InventoryUnit | null>(null);

  // Get location from query params if redirected from dashboard
  const locationFromQuery = searchParams.get('location');

  const handleEditUnit = (unit: InventoryUnit) => {
    setSelectedUnit(unit);
    setEditDialog(true);
  };

  const handleInspectUnit = (unit: InventoryUnit) => {
    setSelectedUnit(unit);
    setInspectDialog(true);
  };

  const handleTransferUnit = (unit: InventoryUnit) => {
    setSelectedUnit(unit);
    setTransferDialog(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground">
          Manage your inventory units, track status, and perform operations
        </p>
      </div>

      <InventoryList
        onEditUnit={handleEditUnit}
        onInspectUnit={handleInspectUnit}
        onTransferUnit={handleTransferUnit}
      />

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Inventory Unit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Edit form for unit: {selectedUnit?.serial_number || 'N/A'}</p>
            {/* Add InventoryUnitForm component here */}
          </div>
        </DialogContent>
      </Dialog>

      {/* Inspect Dialog */}
      <Dialog open={inspectDialog} onOpenChange={setInspectDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inspect Inventory Unit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Inspection form for unit: {selectedUnit?.serial_number || 'N/A'}</p>
            {/* Add InspectionForm component here */}
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferDialog} onOpenChange={setTransferDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transfer Inventory Unit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Transfer form for unit: {selectedUnit?.serial_number || 'N/A'}</p>
            {/* Add TransferForm component here */}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function InventoryUnitsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InventoryUnitsContent />
    </Suspense>
  );
}