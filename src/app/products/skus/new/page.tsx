'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { SKUForm } from '@/components/inventory/sku-form';
import { skusApi } from '@/services/api/skus';
import { type SKUCreateFormData } from '@/lib/validations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ItemMaster {
  id: string;
  name: string;
  description?: string;
}

function NewSKUContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [itemMasters, setItemMasters] = useState<ItemMaster[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load item masters for the form
  useEffect(() => {
    const loadItemMasters = async () => {
      try {
        // TODO: Replace with actual item masters API call
        // For now, using mock data
        setItemMasters([
          { id: '1', name: 'Canon EOS R5', description: 'Professional mirrorless camera' },
          { id: '2', name: 'Sony FX3', description: 'Professional cinema camera' },
          { id: '3', name: 'Godox AD600', description: 'Studio strobe light' },
        ]);
      } catch (error) {
        console.error('Error loading item masters:', error);
        setError('Failed to load item masters');
      }
    };

    loadItemMasters();
  }, []);

  const handleSubmit = async (data: SKUCreateFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await skusApi.create(data as any);
      router.push('/products/skus');
      // TODO: Add success toast notification
    } catch (error: any) {
      console.error('Error creating SKU:', error);
      setError(error.response?.data?.detail || 'Failed to create SKU');
    } finally {
      setIsLoading(false);
    }
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
            Create New SKU
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Add a new product variant to your inventory
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
          itemMasters={itemMasters}
          isLoading={isLoading}
          isEditing={false}
        />
      </div>
    </div>
  );
}

export default function NewSKUPage() {
  return (
    <ProtectedRoute requiredPermissions={['INVENTORY_CREATE']}>
      <NewSKUContent />
    </ProtectedRoute>
  );
}