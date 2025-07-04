'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter,
  Edit,
  Eye,
  Barcode,
  Package,
  MapPin,
  Hash,
  DollarSign,
  Loader2,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { categoriesApi } from '@/services/api/categories';
import { skusApi } from '@/services/api/skus';
import { type SKU, type SKUListResponse } from '@/types/sku';

function SKUsContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRentableFilter, setIsRentableFilter] = useState<string>('all');
  const [isSaleableFilter, setIsSaleableFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);
  
  // SKU data state
  const [skus, setSKUs] = useState<SKU[]>([]);
  const [totalSKUs, setTotalSKUs] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load categories for filter dropdown
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoriesApi.list({ limit: 1000 });
        if (response?.items) {
          const categoryOptions = response.items.map(cat => ({
            id: cat.id,
            name: cat.category_name
          }));
          setCategories(categoryOptions);
        }
      } catch (error) {
        console.error('Error loading categories for filter:', error);
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  // Load SKUs data
  const loadSKUs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        skip: currentPage * pageSize,
        limit: pageSize,
        search: searchTerm || undefined,
        is_rentable: isRentableFilter === 'all' ? undefined : isRentableFilter === 'true',
        is_saleable: isSaleableFilter === 'all' ? undefined : isSaleableFilter === 'true',
        is_active: statusFilter === 'all' ? undefined : statusFilter === 'active',
      };

      const response = await skusApi.list(params);
      setSKUs(response.items);
      setTotalSKUs(response.total);
    } catch (error: any) {
      console.error('Error loading SKUs:', error);
      setError(error.response?.data?.detail || 'Failed to load SKUs');
      setSKUs([]);
      setTotalSKUs(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Load SKUs when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(0); // Reset to first page when filters change
      loadSKUs();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, isRentableFilter, isSaleableFilter, statusFilter]);

  // Load SKUs when page changes
  useEffect(() => {
    loadSKUs();
  }, [currentPage]);

  const handleDelete = async (skuId: string) => {
    if (!confirm('Are you sure you want to delete this SKU?')) return;

    try {
      await skusApi.delete(skuId);
      await loadSKUs(); // Reload the list
      // TODO: Add success toast
    } catch (error: any) {
      console.error('Error deleting SKU:', error);
      // TODO: Add error toast
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDimensions = (dimensions?: Record<string, number>) => {
    if (!dimensions || Object.keys(dimensions).length === 0) return 'N/A';
    return Object.entries(dimensions)
      .map(([key, value]) => `${key}: ${value}cm`)
      .join(', ');
  };

  const totalPages = Math.ceil(totalSKUs / pageSize);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            SKU Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage individual product variants and their inventory
          </p>
        </div>
        <Button onClick={() => router.push('/products/skus/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New SKU
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSKUs}</div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rentable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {skus.filter(sku => sku.is_rentable).length}
            </div>
            <p className="text-xs text-muted-foreground">Available for rent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saleable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {skus.filter(sku => sku.is_saleable).length}
            </div>
            <p className="text-xs text-muted-foreground">Available for sale</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {skus.filter(sku => sku.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="SKU, barcode, name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="rentable">Rentable</Label>
              <Select value={isRentableFilter} onValueChange={setIsRentableFilter}>
                <SelectTrigger id="rentable">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Rentable</SelectItem>
                  <SelectItem value="false">Not Rentable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="saleable">Saleable</Label>
              <Select value={isSaleableFilter} onValueChange={setIsSaleableFilter}>
                <SelectTrigger id="saleable">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Saleable</SelectItem>
                  <SelectItem value="false">Not Saleable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button variant="secondary" className="w-full" onClick={() => loadSKUs()}>
                <Filter className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-800 text-sm">
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SKUs Table */}
      <Card>
        <CardHeader>
          <CardTitle>SKUs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading SKUs...
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Physical Specs</TableHead>
                    <TableHead>Rental Price</TableHead>
                    <TableHead>Sale Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {skus.map((sku) => (
                    <TableRow key={sku.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Barcode className="h-4 w-4 mr-2 text-gray-400" />
                          {sku.sku_code}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{sku.sku_name}</p>
                          {sku.model_number && (
                            <p className="text-sm text-gray-500">
                              Model: {sku.model_number}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {sku.barcode || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {sku.weight && <p>Weight: {sku.weight}kg</p>}
                          <p>{formatDimensions(sku.dimensions)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {sku.is_rentable ? (
                            <>
                              <p className="font-medium">{formatCurrency(sku.rental_base_price)}/day</p>
                              <p className="text-xs text-gray-500">
                                Min: {sku.min_rental_days} days
                                {sku.max_rental_days && `, Max: ${sku.max_rental_days} days`}
                              </p>
                            </>
                          ) : (
                            <Badge variant="secondary">Not Rentable</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {sku.is_saleable ? (
                          <p className="font-medium">{formatCurrency(sku.sale_base_price)}</p>
                        ) : (
                          <Badge variant="secondary">Not Saleable</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant={sku.is_active ? 'default' : 'secondary'}>
                            {sku.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {sku.is_rentable && (
                            <Badge variant="outline" className="block">Rentable</Badge>
                          )}
                          {sku.is_saleable && (
                            <Badge variant="outline" className="block">Saleable</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/products/skus/${sku.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/products/skus/${sku.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(sku.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalSKUs)} of {totalSKUs} results
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SKUsPage() {
  return (
    <ProtectedRoute requiredPermissions={['INVENTORY_VIEW']}>
      <SKUsContent />
    </ProtectedRoute>
  );
}