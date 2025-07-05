'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Building2, Save, X } from 'lucide-react';
import type { Location, LocationType } from '@/types/location';

const locationSchema = z.object({
  location_code: z.string()
    .min(1, 'Location code is required')
    .max(20, 'Location code must be 20 characters or less')
    .regex(/^[A-Z0-9_-]+$/, 'Location code must contain only uppercase letters, numbers, hyphens, and underscores'),
  location_name: z.string()
    .min(1, 'Location name is required')
    .max(100, 'Location name must be 100 characters or less'),
  location_type: z.enum(['WAREHOUSE', 'STORE', 'SERVICE_CENTER'] as const),
  address: z.string()
    .min(1, 'Address is required')
    .max(500, 'Address must be 500 characters or less'),
  city: z.string()
    .min(1, 'City is required')
    .max(50, 'City must be 50 characters or less'),
  state: z.string()
    .min(1, 'State is required')
    .max(50, 'State must be 50 characters or less'),
  country: z.string()
    .min(1, 'Country is required')
    .max(50, 'Country must be 50 characters or less'),
  postal_code: z.string()
    .optional()
    .refine(
      (val) => !val || val.length <= 20,
      { message: 'Postal code must be 20 characters or less' }
    ),
  contact_number: z.string()
    .optional()
    .refine(
      (val) => !val || val.length <= 20,
      { message: 'Contact number must be 20 characters or less' }
    )
    .refine(
      (val) => !val || /^\+\d{1,15}$/.test(val),
      { message: 'Contact number must be in E.164 format (e.g., +1234567890, max 15 digits)' }
    ),
  email: z.string()
    .optional()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      { message: 'Please enter a valid email address' }
    )
    .refine(
      (val) => !val || val.length <= 100,
      { message: 'Email must be 100 characters or less' }
    ),
  manager_user_id: z.string().optional().or(z.literal('')),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationFormProps {
  location?: Location;
  onSubmit: (data: LocationFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  error?: string | { msg?: string; message?: string; [key: string]: any };
}

const locationTypes: { value: LocationType; label: string; description: string }[] = [
  { value: 'WAREHOUSE', label: 'Warehouse', description: 'Storage and distribution facility' },
  { value: 'STORE', label: 'Store', description: 'Retail location for customer sales' },
  { value: 'SERVICE_CENTER', label: 'Service Center', description: 'Maintenance and repair facility' },
];

export function LocationForm({
  location,
  onSubmit,
  onCancel,
  isSubmitting = false,
  error,
}: LocationFormProps) {
  const isEditing = !!location;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: location ? {
      location_code: location.location_code,
      location_name: location.location_name,
      location_type: location.location_type,
      address: location.address || '',
      city: location.city || '',
      state: location.state || '',
      country: location.country || '',
      postal_code: location.postal_code || '',
      contact_number: location.contact_number || '',
      email: location.email || '',
      manager_user_id: location.manager_user_id || '',
    } : {
      location_code: '',
      location_name: '',
      location_type: 'WAREHOUSE' as LocationType,
      address: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
      contact_number: '',
      email: '',
      manager_user_id: '',
    },
  });

  const selectedLocationType = watch('location_type');

  const handleLocationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-uppercase the location code
    const value = e.target.value.toUpperCase();
    setValue('location_code', value, { shouldValidate: true });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="h-5 w-5" />
          <span>{isEditing ? 'Edit Location' : 'Create New Location'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {typeof error === 'string' ? error : (
                  error.msg || error.message || 'An error occurred'
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location_code">
                  Location Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location_code"
                  {...register('location_code')}
                  onChange={handleLocationCodeChange}
                  disabled={isEditing} // Don't allow editing location code
                  placeholder="e.g., WH001, STORE_NYC"
                  className={errors.location_code ? 'border-red-500' : ''}
                />
                {errors.location_code && (
                  <p className="text-sm text-red-500">{errors.location_code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_name">
                  Location Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location_name"
                  {...register('location_name')}
                  placeholder="e.g., Main Warehouse, Downtown Store"
                  className={errors.location_name ? 'border-red-500' : ''}
                />
                {errors.location_name && (
                  <p className="text-sm text-red-500">{errors.location_name.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_type">
                Location Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedLocationType}
                onValueChange={(value: LocationType) => setValue('location_type', value)}
              >
                <SelectTrigger className={errors.location_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select location type" />
                </SelectTrigger>
                <SelectContent>
                  {locationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.location_type && (
                <p className="text-sm text-red-500">{errors.location_type.message}</p>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Address Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="address">
                Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="Street address"
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  {...register('city')}
                  placeholder="City"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">
                  State/Province <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="state"
                  {...register('state')}
                  placeholder="State or Province"
                  className={errors.state ? 'border-red-500' : ''}
                />
                {errors.state && (
                  <p className="text-sm text-red-500">{errors.state.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  {...register('postal_code')}
                  placeholder="Postal/ZIP code"
                  className={errors.postal_code ? 'border-red-500' : ''}
                />
                {errors.postal_code && (
                  <p className="text-sm text-red-500">{errors.postal_code.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">
                Country <span className="text-red-500">*</span>
              </Label>
              <Input
                id="country"
                {...register('country')}
                placeholder="Country"
                className={errors.country ? 'border-red-500' : ''}
              />
              {errors.country && (
                <p className="text-sm text-red-500">{errors.country.message}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_number">Contact Number</Label>
                <Input
                  id="contact_number"
                  {...register('contact_number')}
                  placeholder="E.164 format (e.g., +1234567890)"
                  className={errors.contact_number ? 'border-red-500' : ''}
                />
                {errors.contact_number && (
                  <p className="text-sm text-red-500">{errors.contact_number.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="email@example.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isValid}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Location' : 'Create Location'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}