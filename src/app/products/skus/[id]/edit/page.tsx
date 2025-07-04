'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { SKUForm } from '@/components/inventory/sku-form';
import { skusApi } from '@/services/api/skus';
import { type SKUCreateFormData } from '@/lib/validations';
import { type SKU } from '@/types/sku';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ItemMaster {
  id: string;
  name: string;
  description?: string;
}

interface EditSKUProps {
  params: {
    id: string;
  };
}

function EditSKUContent({ params }: EditSKUProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [itemMasters, setItemMasters] = useState<ItemMaster[]>([]);
  const [sku, setSKU] = useState<SKU | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load SKU data and item masters
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsInitialLoading(true);
        
        // Load SKU data
        const skuData = await skusApi.get(params.id);
        setSKU(skuData);

        // Load item masters for the form
        // TODO: Replace with actual item masters API call
        setItemMasters([
          { id: '1', name: 'Canon EOS R5', description: 'Professional mirrorless camera' },
          { id: '2', name: 'Sony FX3', description: 'Professional cinema camera' },
          { id: '3', name: 'Godox AD600', description: 'Studio strobe light' },
        ]);
      } catch (error: any) {
        console.error('Error loading SKU data:', error);
        setError(error.response?.data?.detail || 'Failed to load SKU data');
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadData();
  }, [params.id]);

  const handleSubmit = async (data: SKUCreateFormData) => {
    if (!sku) return;

    setIsLoading(true);
    setError(null);

    try {
      // Update basic info
      const updateData = {
        sku_name: data.sku_name,
        barcode: data.barcode,
        model_number: data.model_number,
        weight: data.weight,
        dimensions: data.dimensions,
      };

      await skusApi.update(sku.id, updateData);

      // Update rental settings if changed
      if (data.is_rentable !== sku.is_rentable || 
          data.min_rental_days !== sku.min_rental_days ||
          data.max_rental_days !== sku.max_rental_days ||
          data.rental_base_price !== sku.rental_base_price) {
        
        await skusApi.updateRentalSettings(sku.id, {
          is_rentable: data.is_rentable,
          min_rental_days: data.min_rental_days,
          max_rental_days: data.max_rental_days,
          rental_base_price: data.rental_base_price,
        });
      }

      // Update sale settings if changed
      if (data.is_saleable !== sku.is_saleable || 
          data.sale_base_price !== sku.sale_base_price) {
        
        await skusApi.updateSaleSettings(sku.id, {
          is_saleable: data.is_saleable,
          sale_base_price: data.sale_base_price,
        });
      }

      router.push('/products/skus');
      // TODO: Add success toast notification
    } catch (error: any) {
      console.error('Error updating SKU:', error);
      setError(error.response?.data?.detail || 'Failed to update SKU');
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading SKU data...</span>
        </div>
      </div>
    );
  }

  if (!sku) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-800 text-sm">
              SKU not found
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Convert SKU data to form format
  const initialData: Partial<SKUCreateFormData> = {
    sku_code: sku.sku_code,
    sku_name: sku.sku_name,
    item_id: sku.item_id,
    barcode: sku.barcode,
    model_number: sku.model_number,
    weight: sku.weight,
    dimensions: sku.dimensions,
    is_rentable: sku.is_rentable,
    is_saleable: sku.is_saleable,
    min_rental_days: sku.min_rental_days,
    max_rental_days: sku.max_rental_days,
    rental_base_price: sku.rental_base_price,
    sale_base_price: sku.sale_base_price,
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Edit SKU: {sku.sku_code}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update product variant information
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-800 text-sm">
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <div className="flex justify-center">
        <SKUForm
          onSubmit={handleSubmit}
          initialData={initialData}
          itemMasters={itemMasters}
          isLoading={isLoading}
          isEditing={true}
        />
      </div>
    </div>
  );
}

export default function EditSKUPage({ params }: EditSKUProps) {
  return (
    <ProtectedRoute requiredPermissions={['INVENTORY_UPDATE']}>
      <EditSKUContent params={params} />
    </ProtectedRoute>
  );
}