'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/app-store';
import { LocationForm } from '@/components/locations/location-form';
import { locationsApi } from '@/services/api/locations';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function NewLocationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addNotification } = useAppStore();
  const [error, setError] = useState<string>('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdLocation, setCreatedLocation] = useState<any>(null);

  // Create location mutation
  const createMutation = useMutation({
    mutationFn: locationsApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      setCreatedLocation(data);
      setShowSuccessDialog(true);
    },
    onError: (error: any) => {
      console.error('Location creation error:', error);
      let errorMessage = 'Failed to create location';
      
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          // Handle Pydantic validation errors
          errorMessage = error.response.data.detail
            .map((err: any) => `${err.loc.join('.')}: ${err.msg}`)
            .join(', ');
        } else {
          errorMessage = error.response.data.detail;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
    },
  });

  const handleSubmit = async (data: any) => {
    setError('');
    
    // Clean up empty optional fields - convert empty strings to null
    const cleanedData = {
      ...data,
      postal_code: data.postal_code || null,
      contact_number: data.contact_number || null,
      email: data.email || null,
      manager_user_id: data.manager_user_id || null,
    };
    
    createMutation.mutate(cleanedData);
  };

  const handleCancel = () => {
    router.push('/inventory/locations');
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    router.push('/inventory/locations');
  };

  return (
    <div className="container mx-auto p-6">
      <LocationForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createMutation.isPending}
        error={error}
      />
      
      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Location Created Successfully</span>
            </DialogTitle>
            <DialogDescription>
              {createdLocation && (
                <div className="space-y-2">
                  <div>
                    Location <strong>{createdLocation.location_name}</strong> has been created successfully.
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Location Code: {createdLocation.location_code}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button onClick={handleSuccessDialogClose} className="w-full">
              Go to Locations
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}