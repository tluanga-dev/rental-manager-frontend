'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { skuSchema, type SKUFormData } from '@/lib/validations';
import { ItemMaster } from '@/types/api';

interface SKUFormProps {
  onSubmit: (data: SKUFormData) => void;
  initialData?: Partial<SKUFormData>;
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
  const form = useForm<SKUFormData>({
    resolver: zodResolver(skuSchema),
    defaultValues: {
      sku_code: initialData?.sku_code || '',
      item_master_id: initialData?.item_master_id || '',
      rental_price: initialData?.rental_price || 0,
      sale_price: initialData?.sale_price || 0,
      deposit_amount: initialData?.deposit_amount || 0,
    },
  });

  const handleSubmit = (data: SKUFormData) => {
    onSubmit(data);
  };

  const generateSKUCode = () => {
    const selectedItemId = form.watch('item_master_id');
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit SKU' : 'Create SKU'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item_master_id">Item Master *</Label>
              <Select
                value={form.watch('item_master_id')}
                onValueChange={(value) => form.setValue('item_master_id', value)}
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
              {form.formState.errors.item_master_id && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.item_master_id.message}
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
                  disabled={!form.watch('item_master_id')}
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rental_price">Rental Price (₹/day) *</Label>
              <Input
                id="rental_price"
                type="number"
                min="0"
                step="0.01"
                {...form.register('rental_price', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {form.formState.errors.rental_price && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.rental_price.message}
                </p>
              )}
              {form.watch('rental_price') > 0 && (
                <p className="text-xs text-muted-foreground">
                  Daily rate: {formatCurrency(form.watch('rental_price'))}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale_price">Sale Price (₹) *</Label>
              <Input
                id="sale_price"
                type="number"
                min="0"
                step="0.01"
                {...form.register('sale_price', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {form.formState.errors.sale_price && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.sale_price.message}
                </p>
              )}
              {form.watch('sale_price') > 0 && (
                <p className="text-xs text-muted-foreground">
                  Sale price: {formatCurrency(form.watch('sale_price'))}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit_amount">Deposit Amount (₹) *</Label>
              <Input
                id="deposit_amount"
                type="number"
                min="0"
                step="0.01"
                {...form.register('deposit_amount', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {form.formState.errors.deposit_amount && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.deposit_amount.message}
                </p>
              )}
              {form.watch('deposit_amount') > 0 && (
                <p className="text-xs text-muted-foreground">
                  Deposit: {formatCurrency(form.watch('deposit_amount'))}
                </p>
              )}
            </div>
          </div>

          {/* Pricing Summary */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Pricing Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Daily Rental</p>
                  <p className="font-semibold">
                    {formatCurrency(form.watch('rental_price') || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Weekly Rental (7 days)</p>
                  <p className="font-semibold">
                    {formatCurrency((form.watch('rental_price') || 0) * 7)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Monthly Rental (30 days)</p>
                  <p className="font-semibold">
                    {formatCurrency((form.watch('rental_price') || 0) * 30)}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Sale Price</p>
                    <p className="font-semibold">
                      {formatCurrency(form.watch('sale_price') || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Security Deposit</p>
                    <p className="font-semibold">
                      {formatCurrency(form.watch('deposit_amount') || 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Deposit percentage calculation */}
              {form.watch('sale_price') > 0 && form.watch('deposit_amount') > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Deposit is {((form.watch('deposit_amount') / form.watch('sale_price')) * 100).toFixed(1)}% of sale price
                </div>
              )}
            </CardContent>
          </Card>

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