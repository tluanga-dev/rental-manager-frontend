"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  Building2, 
  Calendar, 
  FileText, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  Wand2,
  Users
} from 'lucide-react';

import { useBatchPurchaseStore } from '@/stores/batch-purchase-store';
import type { ValidationResults } from '@/types/batch-purchase';

interface ReviewSubmitStepProps {
  onSubmit: () => void;
}

export function ReviewSubmitStep({ onSubmit }: ReviewSubmitStepProps) {
  const {
    supplier_id,
    location_id,
    purchase_date,
    invoice_number,
    invoice_date,
    tax_rate,
    notes,
    items,
    auto_generate_codes,
    is_validating,
    is_submitting,
    validation_results,
    validateForm,
    getTotalAmount,
  } = useBatchPurchaseStore();

  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');

  useEffect(() => {
    // Validate the form when the component mounts
    const performValidation = async () => {
      setValidationStatus('validating');
      try {
        const results = await validateForm();
        setValidationStatus(results.is_valid ? 'valid' : 'invalid');
      } catch (error) {
        setValidationStatus('invalid');
      }
    };

    performValidation();
  }, [validateForm]);

  const subtotal = items.reduce((total, item) => total + (item.quantity * item.unit_cost), 0);
  const taxAmount = subtotal * (tax_rate / 100);
  const total = subtotal + taxAmount;

  const newItemsCount = items.filter(item => item.type === 'new').length;
  const existingItemsCount = items.filter(item => item.type === 'existing').length;

  return (
    <div className="space-y-6">
      {/* Validation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            {validationStatus === 'validating' && <Clock className="h-4 w-4 animate-spin" />}
            {validationStatus === 'valid' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
            {validationStatus === 'invalid' && <AlertCircle className="h-4 w-4 text-red-600" />}
            Validation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {validationStatus === 'validating' && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>Validating purchase details...</AlertDescription>
            </Alert>
          )}
          
          {validationStatus === 'valid' && validation_results && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Purchase is ready to submit. 
                {validation_results.items_to_create > 0 && (
                  <span> Will create {validation_results.items_to_create} new item(s) and {validation_results.skus_to_create} new SKU(s).</span>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {validationStatus === 'invalid' && validation_results && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix the following issues:
                <ul className="mt-2 list-disc list-inside space-y-1">
                  {validation_results.validation_errors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Purchase Details Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Purchase Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Supplier</p>
                <p className="text-xs text-muted-foreground">ID: {supplier_id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-xs text-muted-foreground">ID: {location_id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Purchase Date</p>
                <p className="text-xs text-muted-foreground">{purchase_date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Tax Rate</p>
                <p className="text-xs text-muted-foreground">{tax_rate}%</p>
              </div>
            </div>
          </div>
          
          {(invoice_number || invoice_date) && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {invoice_number && (
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Invoice Number</p>
                      <p className="text-xs text-muted-foreground">{invoice_number}</p>
                    </div>
                  </div>
                )}
                {invoice_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Invoice Date</p>
                      <p className="text-xs text-muted-foreground">{invoice_date}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          
          {notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-1">Notes</p>
                <p className="text-xs text-muted-foreground">{notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Items Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4" />
            Items Summary ({items.length} items)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {newItemsCount > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">New Items & SKUs</p>
                    <p className="text-xs text-blue-700">Will be created automatically</p>
                  </div>
                </div>
                <Badge variant="secondary">{newItemsCount}</Badge>
              </div>
            )}
            
            {existingItemsCount > 0 && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Existing SKUs</p>
                    <p className="text-xs text-green-700">Will update inventory</p>
                  </div>
                </div>
                <Badge variant="outline">{existingItemsCount}</Badge>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Badge variant={item.type === 'new' ? 'secondary' : 'outline'} className="text-xs">
                      {item.type === 'new' ? 'New' : 'Existing'}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">
                        {item.type === 'new' 
                          ? item.new_sku?.sku_name || `New SKU ${index + 1}`
                          : `Existing SKU`
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity} × ${item.unit_cost.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${(item.quantity * item.unit_cost).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {tax_rate > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax ({tax_rate}%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-medium text-lg">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-generation Settings */}
      {auto_generate_codes && validation_results && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Auto-Generated Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {validation_results.generated_item_codes.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">ITEM CODES</p>
                  <div className="flex flex-wrap gap-1">
                    {validation_results.generated_item_codes.map((code, index) => (
                      <Badge key={index} variant="outline" className="text-xs">{code}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {validation_results.generated_sku_codes.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">SKU CODES</p>
                  <div className="flex flex-wrap gap-1">
                    {validation_results.generated_sku_codes.map((code, index) => (
                      <Badge key={index} variant="outline" className="text-xs">{code}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={onSubmit}
            disabled={validationStatus !== 'valid' || is_submitting}
            className="w-full"
            size="lg"
          >
            {is_submitting ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Creating Purchase...
              </>
            ) : (
              <>
                <Package className="mr-2 h-4 w-4" />
                Create Purchase
              </>
            )}
          </Button>
          
          {validationStatus === 'invalid' && (
            <p className="text-xs text-red-600 text-center mt-2">
              Please fix validation errors before submitting
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}