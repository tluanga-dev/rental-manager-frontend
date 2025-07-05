'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  MoreHorizontal, 
  Eye, 
  RotateCcw, 
  FileText, 
  Calendar,
  Building2,
  Package,
  DollarSign,
  Search,
  Filter,
  Download
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { usePurchases } from '@/hooks/use-purchases';
import { cn } from '@/lib/utils';
import type { Purchase, PurchaseFilters } from '@/types/purchases';
import { PURCHASE_STATUSES, PAYMENT_STATUSES } from '@/types/purchases';

interface PurchaseHistoryTableProps {
  filters?: PurchaseFilters;
  onFiltersChange?: (filters: PurchaseFilters) => void;
  showFilters?: boolean;
  compact?: boolean;
}

export function PurchaseHistoryTable({ 
  filters: externalFilters, 
  onFiltersChange,
  showFilters = true,
  compact = false 
}: PurchaseHistoryTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(externalFilters?.search || '');

  const {
    purchases,
    total,
    isLoading,
    error,
    filters,
    updateFilters,
    resetFilters
  } = usePurchases(externalFilters);

  const handleFilterChange = (newFilters: Partial<PurchaseFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    updateFilters(newFilters);
    onFiltersChange?.(updatedFilters);
  };

  const handleSearch = () => {
    handleFilterChange({ search: searchTerm, skip: 0 });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    resetFilters();
    onFiltersChange?.({});
  };

  const handleViewPurchase = (purchase: Purchase) => {
    router.push(`/purchases/history/${purchase.id}`);
  };

  const handleCreateReturn = (purchase: Purchase) => {
    router.push(`/purchases/returns/new?purchase_id=${purchase.id}`);
  };

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

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load purchase history. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Purchase History</CardTitle>
                <CardDescription>
                  View and manage all recorded purchases
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button onClick={() => router.push('/purchases/record')}>
                  <Package className="h-4 w-4 mr-1" />
                  Record Purchase
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Search purchases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <Select
                value={filters.status || ''}
                onValueChange={(value) => handleFilterChange({ 
                  status: value || undefined, 
                  skip: 0 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  {PURCHASE_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="date"
                placeholder="Start date"
                value={filters.start_date || ''}
                onChange={(e) => handleFilterChange({ 
                  start_date: e.target.value || undefined,
                  skip: 0 
                })}
              />

              <Input
                type="date"
                placeholder="End date"
                value={filters.end_date || ''}
                onChange={(e) => handleFilterChange({ 
                  end_date: e.target.value || undefined,
                  skip: 0 
                })}
              />
            </div>

            {(filters.search || filters.status || filters.start_date || filters.end_date) && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {total} purchase{total !== 1 ? 's' : ''} found
                </p>
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading rows
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : purchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {filters.search || filters.status ? 'No purchases found matching your criteria' : 'No purchases recorded yet'}
                        </p>
                        {!filters.search && !filters.status && (
                          <Button onClick={() => router.push('/purchases/record')} size="sm">
                            Record your first purchase
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  purchases.map((purchase) => (
                    <TableRow key={purchase.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {format(new Date(purchase.purchase_date), 'MMM dd, yyyy')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(purchase.created_at), 'HH:mm')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          {purchase.reference_number ? (
                            <span className="font-medium">{purchase.reference_number}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            ID: {purchase.id.slice(0, 8)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {purchase.supplier?.display_name || purchase.supplier_id}
                          </span>
                          {purchase.supplier?.supplier_code && (
                            <span className="text-xs text-muted-foreground">
                              {purchase.supplier.supplier_code}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-medium">{purchase.total_items}</span>
                          <span className="text-xs text-muted-foreground">
                            {purchase.items.length} line{purchase.items.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">
                          {formatCurrency(purchase.total_amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(purchase.status, 'purchase')}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(purchase.payment_status, 'payment')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewPurchase(purchase)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {purchase.status === 'COMPLETED' && (
                              <DropdownMenuItem onClick={() => handleCreateReturn(purchase)}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Create Return
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              Export Receipt
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > (filters.limit || 20) && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(filters.skip || 0) + 1} to {Math.min((filters.skip || 0) + (filters.limit || 20), total)} of {total} purchases
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange({ skip: Math.max(0, (filters.skip || 0) - (filters.limit || 20)) })}
              disabled={!filters.skip || filters.skip === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange({ skip: (filters.skip || 0) + (filters.limit || 20) })}
              disabled={!purchases.length || purchases.length < (filters.limit || 20)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}