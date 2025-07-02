'use client';

import { useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Search, 
  Filter,
  Edit,
  Eye,
  Package,
  Barcode,
  Grid3X3
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  categoryPath: string;
  brand: string;
  itemType: 'PRODUCT' | 'SERVICE' | 'BUNDLE';
  isSerialized: boolean;
  skuCount: number;
  activeSkuCount: number;
  isActive: boolean;
  createdAt: string;
}

function ProductsContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Mock data - replace with API call
  const products: Product[] = [
    {
      id: '1',
      itemCode: 'CAM-001',
      itemName: 'Canon EOS R5 Mirrorless Camera',
      category: 'Mirrorless',
      categoryPath: 'Cameras/Digital/Mirrorless',
      brand: 'Canon',
      itemType: 'PRODUCT',
      isSerialized: true,
      skuCount: 3,
      activeSkuCount: 3,
      isActive: true,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      itemCode: 'LGT-001',
      itemName: 'Godox AD600 Pro Studio Flash',
      category: 'Flash',
      categoryPath: 'Lighting/Studio/Flash',
      brand: 'Godox',
      itemType: 'PRODUCT',
      isSerialized: true,
      skuCount: 2,
      activeSkuCount: 2,
      isActive: true,
      createdAt: '2024-01-14',
    },
    {
      id: '3',
      itemCode: 'KIT-001',
      itemName: 'Professional Photography Bundle',
      category: 'Bundles',
      categoryPath: 'Bundles',
      brand: 'Multiple',
      itemType: 'BUNDLE',
      isSerialized: false,
      skuCount: 1,
      activeSkuCount: 1,
      isActive: true,
      createdAt: '2024-01-13',
    },
    {
      id: '4',
      itemCode: 'SVC-001',
      itemName: 'Equipment Setup Service',
      category: 'Services',
      categoryPath: 'Services',
      brand: 'In-House',
      itemType: 'SERVICE',
      isSerialized: false,
      skuCount: 1,
      activeSkuCount: 1,
      isActive: true,
      createdAt: '2024-01-12',
    },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.itemCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesBrand = brandFilter === 'all' || product.brand === brandFilter;
    const matchesType = typeFilter === 'all' || product.itemType === typeFilter;
    
    return matchesSearch && matchesCategory && matchesBrand && matchesType;
  });

  const getItemTypeBadge = (type: string) => {
    switch (type) {
      case 'PRODUCT':
        return <Badge className="bg-blue-100 text-blue-800">Product</Badge>;
      case 'SERVICE':
        return <Badge className="bg-green-100 text-green-800">Service</Badge>;
      case 'BUNDLE':
        return <Badge className="bg-purple-100 text-purple-800">Bundle</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Product Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage master product definitions and their variants
          </p>
        </div>
        <Button onClick={() => router.push('/products/items/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">+23 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Serialized Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <p className="text-xs text-muted-foreground">71% of products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,456</div>
            <p className="text-xs text-muted-foreground">Avg 4.2 per product</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">338</div>
            <p className="text-xs text-muted-foreground">98.8% active</p>
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
                  placeholder="Search products..."
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
                  <SelectItem value="Mirrorless">Mirrorless</SelectItem>
                  <SelectItem value="DSLR">DSLR</SelectItem>
                  <SelectItem value="Flash">Flash</SelectItem>
                  <SelectItem value="Continuous">Continuous</SelectItem>
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
              <Label htmlFor="type">Product Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="PRODUCT">Product</SelectItem>
                  <SelectItem value="SERVICE">Service</SelectItem>
                  <SelectItem value="BUNDLE">Bundle</SelectItem>
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

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Code</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Serialized</TableHead>
                <TableHead>SKUs</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-2 text-gray-400" />
                      {product.itemCode}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.itemName}</p>
                      <p className="text-sm text-gray-500">{product.categoryPath}</p>
                    </div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>{getItemTypeBadge(product.itemType)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={product.isSerialized}
                      disabled
                      className="scale-75"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <p className="font-medium">{product.activeSkuCount}/{product.skuCount}</p>
                      <p className="text-xs text-gray-500">Active/Total</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.isActive ? 'default' : 'secondary'}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/products/items/${product.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/products/items/${product.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/products/skus?item=${product.id}`)}
                      >
                        <Barcode className="h-4 w-4" />
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
              Showing 1 to 4 of 342 results
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

export default function ProductsPage() {
  return (
    <ProtectedRoute requiredPermissions={['INVENTORY_VIEW']}>
      <ProductsContent />
    </ProtectedRoute>
  );
}