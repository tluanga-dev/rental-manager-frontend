"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SupplierDropdown } from '@/components/suppliers/SupplierDropdown';
import { LocationSelector } from '@/components/locations/location-selector';

import { useBatchPurchaseStore } from '@/stores/batch-purchase-store';
import { cn } from '@/lib/utils';
import type { Location } from '@/types/location';

const purchaseDetailsSchema = z.object({
  supplier_id: z.string().min(1, 'Supplier is required'),
  location_id: z.string().min(1, 'Location is required'),
  purchase_date: z.date(),
  invoice_number: z.string(),
  invoice_date: z.date().optional(),
  tax_rate: z.number().min(0).max(100),
  notes: z.string(),
});

type PurchaseDetailsForm = z.infer<typeof purchaseDetailsSchema>;

export function PurchaseDetailsStep() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [locationsError, setLocationsError] = useState<string | null>(null);

  const {
    supplier_id,
    location_id,
    purchase_date,
    invoice_number,
    invoice_date,
    tax_rate,
    notes,
    setSupplier,
    setLocation,
    setPurchaseDate,
    setInvoiceNumber,
    setInvoiceDate,
    setTaxRate,
    setNotes,
  } = useBatchPurchaseStore();

  const form = useForm<PurchaseDetailsForm>({
    resolver: zodResolver(purchaseDetailsSchema),
    defaultValues: {
      supplier_id,
      location_id,
      purchase_date: purchase_date ? new Date(purchase_date) : new Date(),
      invoice_number,
      invoice_date: invoice_date ? new Date(invoice_date) : undefined,
      tax_rate,
      notes,
    },
  });

  // Load locations on mount
  useEffect(() => {
    loadLocations();
  }, []);

  // Sync form with store when values change
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (data.supplier_id !== supplier_id) {
        setSupplier(data.supplier_id || '');
      }
      if (data.location_id !== location_id) {
        setLocation(data.location_id || '');
      }
      if (data.purchase_date) {
        setPurchaseDate(data.purchase_date.toISOString().split('T')[0]);
      }
      if (data.invoice_number !== invoice_number) {
        setInvoiceNumber(data.invoice_number || '');
      }
      if (data.invoice_date) {
        setInvoiceDate(data.invoice_date.toISOString().split('T')[0]);
      }
      if (data.tax_rate !== tax_rate) {
        setTaxRate(data.tax_rate || 0);
      }
      if (data.notes !== notes) {
        setNotes(data.notes || '');
      }
    });

    return () => subscription.unsubscribe();
  }, [
    form, 
    supplier_id, location_id, purchase_date, invoice_number, invoice_date, tax_rate, notes,
    setSupplier, setLocation, setPurchaseDate, setInvoiceNumber, setInvoiceDate, setTaxRate, setNotes
  ]);

  const loadLocations = async () => {
    try {
      setLoadingLocations(true);
      setLocationsError(null);
      
      // Import and use the locations API service
      const { locationsApi } = await import('@/services/api/locations');
      const data = await locationsApi.list({ is_active: true });
      
      // Handle both array and paginated response
      const locationsArray = Array.isArray(data) ? data : data?.items || [];
      setLocations(locationsArray);
    } catch (error) {
      console.error('Failed to load locations:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setLocationsError(`Failed to load locations: ${errorMessage}`);
    } finally {
      setLoadingLocations(false);
    }
  };

  // selectedLocation is no longer needed as LocationSelector handles display internally

  // Common tax rate presets
  const taxPresets = [0, 5, 7, 8.25, 10, 13, 15];

  return (
    <div className="space-y-6">
      <Form {...form}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Supplier Selection */}
          <FormField
            control={form.control}
            name="supplier_id"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Supplier *</FormLabel>
                <FormControl>
                  <SupplierDropdown
                    value={field.value}
                    onChange={(id, supplier) => field.onChange(id || '')}
                    placeholder="Select supplier..."
                    fullWidth
                    showCode={true}
                    includeInactive={false}
                  />
                </FormControl>
                {/* Legacy error handling - can be removed since SupplierSelector handles this */}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location Selection */}
          <FormField
            control={form.control}
            name="location_id"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Location *</FormLabel>
                <FormControl>
                  <LocationSelector
                    locations={locations}
                    selectedLocationId={field.value || ''}
                    onSelect={(location) => {
                      field.onChange(location.id);
                    }}
                    placeholder="Select location..."
                    required={true}
                    allowedTypes={['WAREHOUSE', 'STORE']} // Prefer warehouses and stores for batch purchases
                    showActiveOnly={true}
                    className={cn(
                      "w-full",
                      form.formState.errors.location_id && "border-red-500"
                    )}
                    error={form.formState.errors.location_id?.message}
                  />
                </FormControl>
                {locationsError && (
                  <div className="text-red-500 text-sm mt-2">
                    {locationsError}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Purchase Date */}
          <FormField
            control={form.control}
            name="purchase_date"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Purchase Date *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  The actual date when the purchase was completed
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tax Rate */}
          <FormField
            control={form.control}
            name="tax_rate"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Tax Rate (%)</FormLabel>
                <div className="space-y-2">
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <div className="flex gap-1 flex-wrap">
                    {taxPresets.map((preset) => (
                      <Button
                        key={preset}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => form.setValue("tax_rate", preset)}
                      >
                        {preset}%
                      </Button>
                    ))}
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Invoice Number */}
          <FormField
            control={form.control}
            name="invoice_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Number</FormLabel>
                <FormControl>
                  <Input placeholder="INV-2024-001" {...field} />
                </FormControl>
                <FormDescription>
                  External supplier invoice number (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Invoice Date */}
          <FormField
            control={form.control}
            name="invoice_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date (optional)</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Date on the supplier's invoice (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes about this purchase..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Any additional information about this purchase
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>
    </div>
  );
}