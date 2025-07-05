"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, DollarSign, Hash } from 'lucide-react';

import { useBatchPurchaseStore } from '@/stores/batch-purchase-store';

const purchaseItemSchema = z.object({
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unit_cost: z.number().min(0, 'Unit cost cannot be negative'),
  condition_notes: z.string(),
  notes: z.string(),
});

export function PurchaseItemsStep() {
  const { items, updateItem, getTotalAmount, tax_rate } = useBatchPurchaseStore();

  const form = useForm({
    resolver: zodResolver(purchaseItemSchema),
  });

  if (items.length === 0) {
    return (
      <Alert>
        <Package className="h-4 w-4" />
        <AlertDescription>
          No items have been added yet. Please go back to the Item Management step to add items.
        </AlertDescription>
      </Alert>
    );
  }

  const subtotal = items.reduce((total, item) => total + (item.quantity * item.unit_cost), 0);
  const taxAmount = subtotal * (tax_rate / 100);
  const total = subtotal + taxAmount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Purchase Item Details</h3>
          <p className="text-sm text-muted-foreground">
            Specify quantities, costs, and additional details for each item.
          </p>
        </div>
        <Badge variant="secondary">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </Badge>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="h-4 w-4" />
                Item {index + 1}
                {item.type === 'existing' ? (
                  <Badge variant="outline">Existing SKU</Badge>
                ) : (
                  <Badge variant="secondary">New Item & SKU</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Item Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">ITEM DETAILS</Label>
                  {item.type === 'existing' ? (
                    <div className="mt-1 p-2 bg-muted rounded-md">
                      <p className="text-sm font-medium">Existing SKU</p>
                      <p className="text-xs text-muted-foreground">ID: {item.sku_id}</p>
                    </div>
                  ) : (
                    <div className="mt-1 p-2 bg-muted rounded-md">
                      <p className="text-sm font-medium">{item.new_sku?.sku_name || 'New SKU'}</p>
                      <p className="text-xs text-muted-foreground">
                        Item: {item.new_item_master?.item_name || 'New Item'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`quantity-${item.id}`} className="text-sm">Quantity *</Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id={`quantity-${item.id}`}
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                          className="pl-9"
                          placeholder="1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`unit-cost-${item.id}`} className="text-sm">Unit Cost *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id={`unit-cost-${item.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_cost}
                          onChange={(e) => updateItem(item.id, { unit_cost: parseFloat(e.target.value) || 0 })}
                          className="pl-9"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-2 bg-blue-50 rounded-md">
                    <p className="text-sm font-medium text-blue-900">
                      Line Total: ${(item.quantity * item.unit_cost).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`condition-${item.id}`} className="text-sm">Condition Notes</Label>
                  <Textarea
                    id={`condition-${item.id}`}
                    value={item.condition_notes}
                    onChange={(e) => updateItem(item.id, { condition_notes: e.target.value })}
                    placeholder="e.g., New in box, Good condition, etc."
                    className="min-h-[80px] mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`notes-${item.id}`} className="text-sm">Additional Notes</Label>
                  <Textarea
                    id={`notes-${item.id}`}
                    value={item.notes}
                    onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                    placeholder="Any additional notes for this item..."
                    className="min-h-[80px] mt-1"
                  />
                </div>
              </div>

              {/* Serial Numbers for Serialized Items */}
              {((item.type === 'new' && item.new_item_master?.is_serialized) || 
                (item.type === 'existing' && item.serial_numbers && item.serial_numbers.length > 0)) && (
                <div>
                  <Label className="text-sm">Serial Numbers</Label>
                  <Alert className="mt-1">
                    <AlertDescription>
                      Serial number management will be implemented in the next iteration.
                      Current serial numbers: {item.serial_numbers?.join(', ') || 'None'}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Purchase Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Purchase Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal ({items.length} items):</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {tax_rate > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax ({tax_rate}%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}