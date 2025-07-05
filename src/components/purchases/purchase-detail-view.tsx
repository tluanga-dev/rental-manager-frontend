'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Package, 
  Building2, 
  Calendar,
  FileText,
  RotateCcw,
  Download,
  Edit,
  MoreHorizontal,
  MapPin,
  Hash,
  DollarSign
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { usePurchase, usePurchaseReturnsByPurchase } from '@/hooks/use-purchases';
import { cn } from '@/lib/utils';
import type { Purchase } from '@/types/purchases';
import { PURCHASE_STATUSES, PAYMENT_STATUSES, ITEM_CONDITIONS } from '@/types/purchases';

interface PurchaseDetailViewProps {
  purchaseId: string;
  onEdit?: (purchase: Purchase) => void;
  onCreateReturn?: (purchase: Purchase) => void;
}

export function PurchaseDetailView({ 
  purchaseId, 
  onEdit, 
  onCreateReturn 
}: PurchaseDetailViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'items' | 'returns'>('items');

  const { 
    data: purchase, 
    isLoading: loadingPurchase, 
    error: purchaseError 
  } = usePurchase(purchaseId);

  const { 
    data: returnsData, 
    isLoading: loadingReturns 
  } = usePurchaseReturnsByPurchase(purchaseId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status: string, type: 'purchase' | 'payment') => {
    const statusConfig = type === 'purchase' 
      ? PURCHASE_STATUSES.find(s => s.value === status)
      : PAYMENT_STATUSES.find(s => s.value === status);

    if (!statusConfig) return <Badge variant="secondary">{status}</Badge>;

    const variant = statusConfig.color === 'green' ? 'default' : 
                   statusConfig.color === 'red' ? 'destructive' :
                   statusConfig.color === 'yellow' ? 'secondary' : 'outline';

    return <Badge variant={variant}>{statusConfig.label}</Badge>;
  };

  const getConditionBadge = (condition: string) => {
    const conditionConfig = ITEM_CONDITIONS.find(c => c.value === condition);
    if (!conditionConfig) return <Badge variant="secondary">{condition}</Badge>;

    const variant = condition === 'A' ? 'default' :
                   condition === 'B' ? 'secondary' :
                   condition === 'C' ? 'outline' : 'destructive';

    return <Badge variant={variant}>{conditionConfig.label}</Badge>;
  };

  const handleCreateReturn = () => {
    if (purchase && onCreateReturn) {
      onCreateReturn(purchase);
    } else if (purchase) {
      router.push(`/purchases/returns/new?purchase_id=${purchase.id}`);
    }
  };

  const handleEdit = () => {
    if (purchase && onEdit) {
      onEdit(purchase);
    }
  };

  if (loadingPurchase) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-muted animate-pulse rounded" />
          <div className="h-48 bg-muted animate-pulse rounded" />
          <div className="h-48 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (purchaseError || !purchase) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load purchase details. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const returns = returnsData?.items || [];
  const totalReturned = returns.reduce((sum, ret) => sum + ret.total_items, 0);
  const totalRefunded = returns.reduce((sum, ret) => sum + ret.refund_amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="-ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Purchase {purchase.reference_number || `#${purchase.id.slice(0, 8)}`}
            </h1>
            <p className="text-muted-foreground">
              Recorded on {format(new Date(purchase.purchase_date), 'MMMM dd, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          {purchase.status === 'COMPLETED' && (
            <Button onClick={handleCreateReturn}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Create Return
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Purchase
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Print Receipt
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Total Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(purchase.total_amount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Total Items</p>
                <p className="text-2xl font-bold">{purchase.total_items}</p>
                <p className="text-xs text-muted-foreground">
                  {purchase.items.length} line{purchase.items.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Status</p>
              <div className="space-y-1">
                {getStatusBadge(purchase.status, 'purchase')}
                {getStatusBadge(purchase.payment_status, 'payment')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Returns</p>
              <p className="text-2xl font-bold">{returns.length}</p>
              {totalReturned > 0 && (
                <p className="text-xs text-muted-foreground">
                  {totalReturned} items, {formatCurrency(totalRefunded)} refunded
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Supplier Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Company Name</p>
              <p className="text-lg">{purchase.supplier?.display_name || 'Unknown Supplier'}</p>
            </div>
            {purchase.supplier?.supplier_code && (
              <div>
                <p className="text-sm font-medium">Supplier Code</p>
                <p className="text-sm text-muted-foreground">{purchase.supplier.supplier_code}</p>
              </div>
            )}
            {purchase.supplier?.contact_person && (
              <div>
                <p className="text-sm font-medium">Contact Person</p>
                <p className="text-sm text-muted-foreground">{purchase.supplier.contact_person}</p>
              </div>
            )}
            {purchase.supplier && (
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{purchase.supplier.supplier_type}</Badge>
                <Badge variant="secondary">{purchase.supplier.supplier_tier}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Purchase Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Purchase Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(purchase.purchase_date), 'MMMM dd, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(purchase.created_at), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>
            {purchase.reference_number && (
              <div>
                <p className="text-sm font-medium">Reference Number</p>
                <p className="text-sm text-muted-foreground">{purchase.reference_number}</p>
              </div>
            )}
            {purchase.notes && (
              <div>
                <p className="text-sm font-medium">Notes</p>
                <p className="text-sm text-muted-foreground">{purchase.notes}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium">Purchase ID</p>
              <p className="text-xs text-muted-foreground font-mono">{purchase.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('items')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'items'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
            )}
          >
            Purchase Items ({purchase.items.length})
          </button>
          <button
            onClick={() => setActiveTab('returns')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'returns'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
            )}
          >
            Returns ({returns.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'items' && (
        <Card>
          <CardHeader>
            <CardTitle>Purchase Items</CardTitle>
            <CardDescription>
              Items that were purchased and added to inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Cost</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchase.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {item.sku?.display_name || item.sku_id}
                          </span>
                          {item.sku?.sku_code && (
                            <span className="text-xs text-muted-foreground">
                              {item.sku.sku_code}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unit_cost)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.total_cost)}
                      </TableCell>
                      <TableCell>
                        {getConditionBadge(item.condition)}
                      </TableCell>
                      <TableCell>
                        {item.location ? (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{item.location.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.notes ? (
                          <span className="text-sm">{item.notes}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'returns' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Purchase Returns</CardTitle>
                <CardDescription>
                  Items returned to the supplier from this purchase
                </CardDescription>
              </div>
              {purchase.status === 'COMPLETED' && (
                <Button onClick={handleCreateReturn} size="sm">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  New Return
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loadingReturns ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-8 w-8 animate-spin" />
                <p className="mt-2 text-sm text-muted-foreground">Loading returns...</p>
              </div>
            ) : returns.length === 0 ? (
              <div className="text-center py-8">
                <RotateCcw className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No returns recorded for this purchase
                </p>
                {purchase.status === 'COMPLETED' && (
                  <Button onClick={handleCreateReturn} size="sm" className="mt-4">
                    Create Return
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {returns.map((returnRecord) => (
                  <div key={returnRecord.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">
                          Return #{returnRecord.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(returnRecord.return_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(returnRecord.refund_amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {returnRecord.total_items} items
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{returnRecord.status}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/purchases/returns/${returnRecord.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}