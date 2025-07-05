'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { CalendarIcon, Plus, Trash2, Package, Save, ArrowLeft, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { SupplierDropdown } from '@/components/suppliers/SupplierDropdown/SupplierDropdown';
import { SimpleSkuSelector } from './simple-sku-selector';
import { useCreatePurchase } from '@/hooks/use-purchases';
import { skusApi } from '@/services/api/skus';
import { locationsApi } from '@/services/api/locations';
import { PurchaseValidator, PurchaseBusinessLogic } from '@/lib/purchase-validation';
import { cn } from '@/lib/utils';
import type { SkuSummary, LocationSummary, ItemCondition, PurchaseFormData } from '@/types/purchases';
import type { SKU } from '@/types/sku';
import type { Location } from '@/types/location';
import { ITEM_CONDITIONS } from '@/types/purchases';

const purchaseItemSchema = z.object({
  sku_id: z.string().min(1, 'SKU is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_cost: z.number().min(0, 'Unit cost must be positive'),
  condition: z.enum(['A', 'B', 'C', 'D']),
  notes: z.string().optional(),
  location_id: z.string().optional(),
});

const purchaseFormSchema = z.object({
  supplier_id: z.string().min(1, 'Supplier is required'),
  purchase_date: z.date(),
  notes: z.string().optional(),
  reference_number: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
});

type PurchaseFormValues = z.infer<typeof purchaseFormSchema>;

interface PurchaseRecordingFormProps {
  onSuccess?: (purchase: any) => void;
  onCancel?: () => void;
}

export function PurchaseRecordingForm({ onSuccess, onCancel }: PurchaseRecordingFormProps) {
  const router = useRouter();
  const createPurchase = useCreatePurchase();

  // State for options
  const [skus, setSkus] = useState<SkuSummary[]>([]);
  const [locations, setLocations] = useState<LocationSummary[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  
  // State for validation
  const [formValidation, setFormValidation] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>({ isValid: true, errors: [], warnings: [] });
  
  // Enhanced data for validation
  const [fullSkus, setFullSkus] = useState<SKU[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<any>();

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      supplier_id: '',
      purchase_date: new Date(),
      notes: '',
      reference_number: '',
      items: [
        {
          sku_id: '',
          quantity: 1,
          unit_cost: 0,
          condition: 'A',
          notes: '',
          location_id: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Load options on mount
  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        const [skusData, locationsData] = await Promise.all([
          skusApi.list({ is_active: true, limit: 1000 }),
          locationsApi.list({ is_active: true }),
        ]);

        // Store full SKU data for validation
        setFullSkus(skusData.items);
        
        // Convert SKU data to SkuSummary format
        const skuSummaries: SkuSummary[] = skusData.items.map((sku: SKU) => ({
          id: sku.id,
          sku_code: sku.sku_code,
          display_name: `${sku.sku_name} (${sku.sku_code})`,
          current_price: sku.sale_base_price || 0,
          category: undefined, // Not available in current SKU type
          brand: undefined, // Not available in current SKU type
          condition_restrictions: undefined // Not available in current SKU type
        }));
        setSkus(skuSummaries);

        // Convert Location data to LocationSummary format (handle both array and paginated response)
        const locationsArray = Array.isArray(locationsData) ? locationsData : locationsData?.items || [];
        const locationSummaries: LocationSummary[] = locationsArray.map((location: Location) => ({
          id: location.id,
          name: location.location_name,
          location_code: location.location_code,
          location_type: location.location_type,
          is_active: location.is_active
        }));
        setLocations(locationSummaries);
      } catch (error) {
        console.error('Failed to load options:', error);
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  // Selected supplier is now managed directly in SupplierDropdown onChange handler

  // Real-time form validation
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.items && value.items.length > 0 && fullSkus.length > 0) {
        const formData = form.getValues() as any;
        const validation = PurchaseValidator.validatePurchaseForm(
          formData,
          fullSkus,
          selectedSupplier
        );
        setFormValidation(validation);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, fullSkus, selectedSupplier]);

  const onSubmit = async (values: PurchaseFormValues) => {
    try {
      const formData: PurchaseFormData = {
        supplier_id: values.supplier_id,
        purchase_date: format(values.purchase_date, 'yyyy-MM-dd'),
        notes: values.notes,
        reference_number: values.reference_number,
        items: values.items.map(item => ({
          sku_id: item.sku_id,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          condition: item.condition as ItemCondition,
          notes: item.notes,
          location_id: item.location_id || undefined,
        })),
      };

      const result = await createPurchase.mutateAsync(formData);
      
      if (onSuccess) {
        onSuccess(result);
      } else {
        router.push(`/purchases/history/${result.id}`);
      }
    } catch (error) {
      // Error handling is done in the mutation
      console.error('Purchase creation failed:', error);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  const addItem = () => {
    append({
      sku_id: '',
      quantity: 1,
      unit_cost: 0,
      condition: 'A',
      notes: '',
      location_id: '',
    });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const calculateTotal = () => {
    const items = form.watch('items');
    return items.reduce((total, item) => total + (item.quantity * item.unit_cost), 0);
  };

  const getTotalItems = () => {
    const items = form.watch('items');
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  if (loadingOptions) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Package className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-sm text-muted-foreground">Loading form options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="-ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Record Purchase</h1>
            <p className="text-muted-foreground">Record a completed purchase and add items to inventory</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Purchase Details */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Details</CardTitle>
              <CardDescription>
                Enter the basic information about this purchase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplier_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier *</FormLabel>
                      <FormControl>
                        <SupplierDropdown
                          value={field.value}
                          onChange={(supplierId, supplier) => {
                            field.onChange(supplierId);
                            // Update selected supplier for validation
                            setSelectedSupplier(supplier as any);
                          }}
                          placeholder="Search or select supplier"
                          fullWidth
                          searchable
                          clearable
                          showCode
                          error={!!form.formState.errors.supplier_id}
                          helperText={form.formState.errors.supplier_id?.message}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchase_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Purchase Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="reference_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Number</FormLabel>
                      <FormControl>
                        <Input placeholder="PO-001, Invoice #123, etc." {...field} />
                      </FormControl>
                      <FormDescription>
                        Optional reference for tracking this purchase
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes about this purchase..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Purchase Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Purchase Items</CardTitle>
                  <CardDescription>
                    Add items that were purchased and their details
                  </CardDescription>
                </div>
                <Button type="button" onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Form Validation Results */}
              {!formValidation.isValid && formValidation.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div>
                      <p className="font-medium">Please fix the following errors:</p>
                      <ul className="list-disc list-inside mt-2">
                        {formValidation.errors.map((error: string, index: number) => (
                          <li key={index} className="text-sm">{error}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Form Validation Warnings */}
              {formValidation.warnings.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div>
                      <p className="font-medium">Please review the following warnings:</p>
                      <ul className="list-disc list-inside mt-2">
                        {formValidation.warnings.map((warning: string, index: number) => (
                          <li key={index} className="text-sm">{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {fields.map((field, index) => (
                <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.sku_id`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU *</FormLabel>
                          <FormControl>
                            <SimpleSkuSelector
                              value={field.value}
                              onValueChange={field.onChange}
                              onSkuSelect={(sku) => {
                                // Auto-populate unit cost from SKU base price
                                if (sku.sale_base_price) {
                                  form.setValue(`items.${index}.unit_cost`, sku.sale_base_price);
                                }
                              }}
                              placeholder="Select SKU"
                              saleable={true}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.unit_cost`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Cost *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.condition`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condition *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ITEM_CONDITIONS.map((condition) => (
                                <SelectItem key={condition.value} value={condition.value}>
                                  <div className="flex flex-col">
                                    <span>{condition.label}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {condition.description}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.location_id`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <Select onValueChange={(value) => field.onChange(value === "none" ? "" : value)} value={field.value || "none"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select location (optional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">No specific location</SelectItem>
                              {locations.map((location) => (
                                <SelectItem key={location.id} value={location.id}>
                                  {location.name} ({location.location_code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.notes`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Input placeholder="Item-specific notes..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Item Total */}
                  <div className="flex justify-end pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      Item Total: ${(form.watch(`items.${index}.quantity`) * form.watch(`items.${index}.unit_cost`)).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}

              {fields.length === 0 && (
                <Alert>
                  <AlertDescription>
                    No items added yet. Click "Add Item" to add purchase items.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Total Items</p>
                  <p className="text-2xl font-bold">{getTotalItems()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Total Amount</p>
                  <p className="text-2xl font-bold">${calculateTotal().toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Status</p>
                  <Badge>Ready to Record</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createPurchase.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPurchase.isPending}
              className="min-w-[120px]"
            >
              {createPurchase.isPending ? (
                <>
                  <Package className="mr-2 h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Record Purchase
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}