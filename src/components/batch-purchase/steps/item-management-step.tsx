"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, Wand2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useBatchPurchaseStore } from '@/stores/batch-purchase-store';

export function ItemManagementStep() {
  const { items, addItem, removeItem, getItemsCount } = useBatchPurchaseStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Manage Items</h3>
          <p className="text-sm text-muted-foreground">
            Add items to your purchase. You can use existing SKUs or create new items and SKUs.
          </p>
        </div>
        <Badge variant="secondary">
          {getItemsCount()} {getItemsCount() === 1 ? 'item' : 'items'}
        </Badge>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No items added yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Start by adding items to your purchase. You can use existing SKUs or create new ones.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => addItem('existing')} variant="outline">
                <Package className="mr-2 h-4 w-4" />
                Use Existing SKU
              </Button>
              <Button onClick={() => addItem('new')}>
                <Wand2 className="mr-2 h-4 w-4" />
                Create New Item & SKU
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    Item {index + 1}
                    {item.type === 'existing' ? (
                      <Badge variant="outline" className="ml-2">Existing SKU</Badge>
                    ) : (
                      <Badge variant="secondary" className="ml-2">New Item & SKU</Badge>
                    )}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {item.type === 'existing' ? (
                  <div className="space-y-2">
                    {item.sku_id ? (
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">SKU Selected</p>
                        <p className="text-xs text-muted-foreground">ID: {item.sku_id}</p>
                      </div>
                    ) : (
                      <Alert>
                        <AlertDescription>
                          SKU selection functionality will be implemented in the next step.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Item Master</h4>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm">
                          Item Name: {item.new_item_master?.item_name || 'Not set'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Category: {item.new_item_master?.category_id ? 'Selected' : 'Not selected'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">SKU Details</h4>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm">
                          SKU Name: {item.new_sku?.sku_name || 'Not set'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Type: {item.new_sku?.is_rentable && item.new_sku?.is_saleable 
                            ? 'Rentable & Saleable' 
                            : item.new_sku?.is_rentable 
                              ? 'Rentable Only'
                              : 'Sale Only'
                          }
                        </p>
                      </div>
                    </div>
                    <Alert>
                      <AlertDescription>
                        Detailed item and SKU creation forms will be implemented in the next iteration.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-center">
            <div className="flex gap-3">
              <Button onClick={() => addItem('existing')} variant="outline">
                <Package className="mr-2 h-4 w-4" />
                Add Existing SKU
              </Button>
              <Button onClick={() => addItem('new')}>
                <Wand2 className="mr-2 h-4 w-4" />
                Create New Item & SKU
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}