'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/app-store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { LocationForm } from '@/components/locations/location-form';
import { locationsApi } from '@/services/api/locations';

interface EditLocationPageProps {
  params: {
    id: string;
  };
}

export default function EditLocationPage({ params }: EditLocationPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addNotification } = useAppStore();
  const [error, setError] = useState<string>('');

  // Fetch location details
  const { 
    data: location, 
    isLoading, 
    error: fetchError 
  } = useQuery({
    queryKey: ['locations', params.id],
    queryFn: () => locationsApi.getById(params.id),
  });

  // Update location mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => locationsApi.update(params.id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      addNotification({
        type: 'success',
        title: 'Location Updated',
        message: `Location "${data.location_name}" has been updated successfully`
      });
      router.push(`/inventory/locations/${params.id}`);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to update location';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: errorMessage
      });
    },
  });

  const handleSubmit = async (data: any) => {
    setError('');
    updateMutation.mutate(data);
  };

  const handleCancel = () => {
    router.push(`/inventory/locations/${params.id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (fetchError || !location) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {fetchError?.message || 'Location not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <LocationForm
        location={location}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={updateMutation.isPending}
        error={error}
      />
    </div>
  );
}