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
  DollarSign
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { categoriesApi } from '@/services/api/categories';

interface SKU {
  id: string;
  skuCode: string;
  barcode?: string;
  itemMasterName: string;
  itemMasterCode: string;
  category: string;
  brand: string;
  skuSuffix: string;
  variantInfo: string;
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
  rentalPrice: number;
  replacementCost: number;
  stockQuantity: number;
  availableQuantity: number;
  isActive: boolean;
  createdAt: string;
}

function SKUsContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);

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

  // TODO: Replace with API call to fetch SKUs
  const skus: SKU[] = [];

  const filteredSKUs = skus.filter(sku => {
    const matchesSearch = sku.skuCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sku.itemMasterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (sku.barcode && sku.barcode.includes(searchTerm));
    const matchesCategory = categoryFilter === 'all' || sku.category === categoryFilter;
    const matchesBrand = brandFilter === 'all' || sku.brand === brandFilter;
    const matchesCondition = conditionFilter === 'all' || sku.condition === conditionFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && sku.isActive) ||
                         (statusFilter === 'inactive' && !sku.isActive);
    
    return matchesSearch && matchesCategory && matchesBrand && matchesCondition && matchesStatus;
  });

  const getConditionBadge = (condition: string) => {
    const variants: Record<string, string> = {
      'NEW': 'bg-green-100 text-green-800',
      'LIKE_NEW': 'bg-blue-100 text-blue-800',
      'GOOD': 'bg-yellow-100 text-yellow-800',
      'FAIR': 'bg-orange-100 text-orange-800',
      'POOR': 'bg-red-100 text-red-800',
    };
    return <Badge className={variants[condition] || ''}>{condition.replace('_', ' ')}</Badge>;
  };

  const getAvailabilityBadge = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (percentage < 30) return <Badge variant="destructive">Low Stock</Badge>;
    if (percentage < 70) return <Badge variant="secondary">In Stock</Badge>;
    return <Badge variant="default">Available</Badge>;
  };

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
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,456</div>
            <p className="text-xs text-muted-foreground">+45 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active SKUs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,412</div>
            <p className="text-xs text-muted-foreground">97% active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5,234</div>
            <p className="text-xs text-muted-foreground">Units</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,456</div>
            <p className="text-xs text-muted-foreground">66% available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">SKUs</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-6">
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
              <Label htmlFor="category">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger id="brand">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  <SelectItem value="Canon">Canon</SelectItem>
                  <SelectItem value="Nikon">Nikon</SelectItem>
                  <SelectItem value="Sony">Sony</SelectItem>
                  <SelectItem value="Godox">Godox</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="condition">Condition</Label>
              <Select value={conditionFilter} onValueChange={setConditionFilter}>
                <SelectTrigger id="condition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="LIKE_NEW">Like New</SelectItem>
                  <SelectItem value="GOOD">Good</SelectItem>
                  <SelectItem value="FAIR">Fair</SelectItem>
                  <SelectItem value="POOR">Poor</SelectItem>
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
              <Button variant="secondary" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SKUs Table */}
      <Card>
        <CardHeader>
          <CardTitle>SKUs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU Code</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSKUs.map((sku) => (
                <TableRow key={sku.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="flex items-center">
                        <Barcode className="h-4 w-4 mr-2 text-gray-400" />
                        {sku.skuCode}
                      </div>
                      {sku.barcode && (
                        <p className="text-xs text-gray-500 mt-1">
                          {sku.barcode}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{sku.itemMasterName}</p>
                      <p className="text-sm text-gray-500">
                        {sku.brand} • {sku.category}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{sku.variantInfo}</p>
                  </TableCell>
                  <TableCell>{getConditionBadge(sku.condition)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{sku.availableQuantity}/{sku.stockQuantity}</p>
                      <p className="text-xs text-gray-500">Available/Total</p>
                      {getAvailabilityBadge(sku.availableQuantity, sku.stockQuantity)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">${sku.rentalPrice}/day</p>
                      <p className="text-xs text-gray-500">
                        Value: ${sku.replacementCost}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={sku.isActive ? 'default' : 'secondary'}>
                      {sku.isActive ? 'Active' : 'Inactive'}
                    </Badge>
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
                        onClick={() => router.push(`/inventory/stock?sku=${sku.id}`)}
                      >
                        <MapPin className="h-4 w-4" />
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
              Showing 1 to 4 of 1,456 results
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
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