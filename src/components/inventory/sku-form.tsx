'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { skuCreateSchema, type SKUCreateFormData } from '@/lib/validations';
import { Plus, Minus } from 'lucide-react';

interface ItemMaster {
  id: string;
  name: string;
  description?: string;
}

interface SKUFormProps {
  onSubmit: (data: SKUCreateFormData) => void;
  initialData?: Partial<SKUCreateFormData>;
  itemMasters: ItemMaster[];
  isLoading?: boolean;
  isEditing?: boolean;
}

export function SKUForm({ 
  onSubmit, 
  initialData, 
  itemMasters, 
  isLoading, 
  isEditing 
}: SKUFormProps) {
  const [dimensions, setDimensions] = useState<Array<{key: string, value: string}>>([
    { key: 'length', value: '' },
    { key: 'width', value: '' },
    { key: 'height', value: '' }
  ]);

  const form = useForm<SKUCreateFormData>({
    resolver: zodResolver(skuCreateSchema),
    defaultValues: {
      sku_code: initialData?.sku_code || '',
      sku_name: initialData?.sku_name || '',
      item_id: initialData?.item_id || '',
      barcode: initialData?.barcode || '',
      model_number: initialData?.model_number || '',
      weight: initialData?.weight || undefined,
      dimensions: initialData?.dimensions || {},
      is_rentable: initialData?.is_rentable ?? false,
      is_saleable: initialData?.is_saleable ?? true,
      min_rental_days: initialData?.min_rental_days || 1,
      max_rental_days: initialData?.max_rental_days || undefined,
      rental_base_price: initialData?.rental_base_price || undefined,
      sale_base_price: initialData?.sale_base_price || undefined,
    },
  });

  const handleSubmit = (data: SKUCreateFormData) => {
    // Convert dimensions array to object
    const dimensionsObj: Record<string, number> = {};
    dimensions.forEach(({ key, value }) => {
      if (key && value && !isNaN(Number(value))) {
        dimensionsObj[key] = Number(value);
      }
    });
    
    const submitData = {
      ...data,
      dimensions: Object.keys(dimensionsObj).length > 0 ? dimensionsObj : undefined
    };
    
    onSubmit(submitData);
  };

  const generateSKUCode = () => {
    const selectedItemId = form.watch('item_id');
    if (!selectedItemId) return;
    
    const selectedItem = itemMasters.find(item => item.id === selectedItemId);
    if (!selectedItem) return;
    
    // Generate SKU code based on item name and timestamp
    const timestamp = Date.now().toString().slice(-6);
    const itemPrefix = selectedItem.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6);
    
    const skuCode = `${itemPrefix}-${timestamp}`;
    form.setValue('sku_code', skuCode);
  };

  const addDimension = () => {
    setDimensions([...dimensions, { key: '', value: '' }]);
  };

  const removeDimension = (index: number) => {
    setDimensions(dimensions.filter((_, i) => i !== index));
  };

  const updateDimension = (index: number, field: 'key' | 'value', value: string) => {
    const newDimensions = [...dimensions];
    newDimensions[index][field] = value;
    setDimensions(newDimensions);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const isRentable = form.watch('is_rentable');
  const isSaleable = form.watch('is_saleable');

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit SKU' : 'Create New SKU'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="physical">Physical Specs</TabsTrigger>
              <TabsTrigger value="rental">Rental Settings</TabsTrigger>
              <TabsTrigger value="sale">Sale Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item_id">Item Master *</Label>
                  <Select
                    value={form.watch('item_id')}
                    onValueChange={(value) => form.setValue('item_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select item master" />
                    </SelectTrigger>
                    <SelectContent>
                      {itemMasters.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.item_id && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.item_id.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku_code">SKU Code *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="sku_code"
                      {...form.register('sku_code')}
                      placeholder="Enter SKU code"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateSKUCode}
                      disabled={!form.watch('item_id')}
                    >
                      Generate
                    </Button>
                  </div>
                  {form.formState.errors.sku_code && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.sku_code.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku_name">SKU Name *</Label>
                  <Input
                    id="sku_name"
                    {...form.register('sku_name')}
                    placeholder="Enter SKU name"
                  />
                  {form.formState.errors.sku_name && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.sku_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    {...form.register('barcode')}
                    placeholder="Enter barcode/UPC"
                  />
                  {form.formState.errors.barcode && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.barcode.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model_number">Model Number</Label>
                  <Input
                    id="model_number"
                    {...form.register('model_number')}
                    placeholder="Enter model number"
                  />
                  {form.formState.errors.model_number && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.model_number.message}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="physical" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register('weight', { valueAsNumber: true })}
                  placeholder="Enter weight in kg"
                />
                {form.formState.errors.weight && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.weight.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Dimensions (cm)</Label>
                <div className="space-y-2">
                  {dimensions.map((dimension, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        placeholder="Dimension name (e.g., length)"
                        value={dimension.key}
                        onChange={(e) => updateDimension(index, 'key', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Value"
                        value={dimension.value}
                        onChange={(e) => updateDimension(index, 'value', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeDimension(index)}
                        disabled={dimensions.length <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDimension}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Dimension
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rental" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_rentable"
                  checked={form.watch('is_rentable')}
                  onCheckedChange={(checked) => form.setValue('is_rentable', checked as boolean)}
                />
                <Label htmlFor="is_rentable">Available for Rental</Label>
              </div>

              {isRentable && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min_rental_days">Minimum Rental Days *</Label>
                      <Input
                        id="min_rental_days"
                        type="number"
                        min="1"
                        {...form.register('min_rental_days', { valueAsNumber: true })}
                        placeholder="1"
                      />
                      {form.formState.errors.min_rental_days && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.min_rental_days.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max_rental_days">Maximum Rental Days</Label>
                      <Input
                        id="max_rental_days"
                        type="number"
                        min="1"
                        {...form.register('max_rental_days', { valueAsNumber: true })}
                        placeholder="Optional"
                      />
                      {form.formState.errors.max_rental_days && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.max_rental_days.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rental_base_price">Base Rental Price (₹/day)</Label>
                    <Input
                      id="rental_base_price"
                      type="number"
                      step="0.01"
                      min="0"
                      {...form.register('rental_base_price', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                    {form.formState.errors.rental_base_price && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.rental_base_price.message}
                      </p>
                    )}
                    {form.watch('rental_base_price') && form.watch('rental_base_price')! > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <p>Daily: {formatCurrency(form.watch('rental_base_price')!)}</p>
                        <p>Weekly: {formatCurrency(form.watch('rental_base_price')! * 7)}</p>
                        <p>Monthly: {formatCurrency(form.watch('rental_base_price')! * 30)}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="sale" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_saleable"
                  checked={form.watch('is_saleable')}
                  onCheckedChange={(checked) => form.setValue('is_saleable', checked as boolean)}
                />
                <Label htmlFor="is_saleable">Available for Sale</Label>
              </div>

              {isSaleable && (
                <div className="space-y-2">
                  <Label htmlFor="sale_base_price">Base Sale Price (₹)</Label>
                  <Input
                    id="sale_base_price"
                    type="number"
                    step="0.01"
                    min="0"
                    {...form.register('sale_base_price', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {form.formState.errors.sale_base_price && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.sale_base_price.message}
                    </p>
                  )}
                  {form.watch('sale_base_price') && form.watch('sale_base_price')! > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Sale price: {formatCurrency(form.watch('sale_base_price')!)}
                    </p>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Update SKU' : 'Create SKU'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}