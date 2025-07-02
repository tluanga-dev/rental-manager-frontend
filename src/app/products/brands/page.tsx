'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Tag
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';

interface Brand {
  id: string;
  brandName: string;
  brandCode: string;
  description?: string;
  productCount: number;
  isActive: boolean;
  createdAt: string;
}

function BrandsContent() {
  const { addNotification } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  
  // Form states
  const [brandName, setBrandName] = useState('');
  const [brandCode, setBrandCode] = useState('');
  const [description, setDescription] = useState('');

  // Mock data - replace with API call
  const brands: Brand[] = [
    {
      id: '1',
      brandName: 'Canon',
      brandCode: 'CANON',
      description: 'Japanese multinational corporation specializing in optical, imaging, and industrial products',
      productCount: 45,
      isActive: true,
      createdAt: '2024-01-01',
    },
    {
      id: '2',
      brandName: 'Nikon',
      brandCode: 'NIKON',
      description: 'Japanese multinational corporation specializing in optics and imaging products',
      productCount: 38,
      isActive: true,
      createdAt: '2024-01-02',
    },
    {
      id: '3',
      brandName: 'Sony',
      brandCode: 'SONY',
      description: 'Japanese multinational conglomerate corporation',
      productCount: 52,
      isActive: true,
      createdAt: '2024-01-03',
    },
    {
      id: '4',
      brandName: 'Godox',
      brandCode: 'GODOX',
      description: 'Professional photography lighting equipment manufacturer',
      productCount: 28,
      isActive: true,
      createdAt: '2024-01-04',
    },
    {
      id: '5',
      brandName: 'DJI',
      brandCode: 'DJI',
      description: 'Chinese technology company known for drones and camera stabilizers',
      productCount: 18,
      isActive: true,
      createdAt: '2024-01-05',
    },
  ];

  const filteredBrands = brands.filter(brand =>
    brand.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.brandCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddBrand = () => {
    // Validate
    if (!brandName || !brandCode) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Brand name and code are required',
      });
      return;
    }

    // Here you would make API call to create brand
    addNotification({
      type: 'success',
      title: 'Brand Created',
      message: `Brand "${brandName}" has been created successfully`,
    });

    // Reset form and close dialog
    setBrandName('');
    setBrandCode('');
    setDescription('');
    setIsAddDialogOpen(false);
  };

  const handleEditBrand = () => {
    if (!selectedBrand) return;

    // Here you would make API call to update brand
    addNotification({
      type: 'success',
      title: 'Brand Updated',
      message: `Brand "${brandName}" has been updated successfully`,
    });

    // Reset form and close dialog
    setSelectedBrand(null);
    setBrandName('');
    setBrandCode('');
    setDescription('');
    setIsEditDialogOpen(false);
  };

  const handleDeleteBrand = (brand: Brand) => {
    if (brand.productCount > 0) {
      addNotification({
        type: 'error',
        title: 'Cannot Delete Brand',
        message: `Brand "${brand.brandName}" has ${brand.productCount} products associated with it`,
      });
      return;
    }

    // Here you would make API call to delete brand
    addNotification({
      type: 'success',
      title: 'Brand Deleted',
      message: `Brand "${brand.brandName}" has been deleted`,
    });
  };

  const openEditDialog = (brand: Brand) => {
    setSelectedBrand(brand);
    setBrandName(brand.brandName);
    setBrandCode(brand.brandCode);
    setDescription(brand.description || '');
    setIsEditDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Brand Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage product brands and manufacturers
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Brand
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Brands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">54</div>
            <p className="text-xs text-muted-foreground">+3 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Brands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">52</div>
            <p className="text-xs text-muted-foreground">96% active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Brand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Sony</div>
            <p className="text-xs text-muted-foreground">52 products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Latest additions</p>
          </CardContent>
        </Card>
      </div>

      {/* Brands Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Brands</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand Name</TableHead>
                <TableHead>Brand Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBrands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-gray-400" />
                      {brand.brandName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {brand.brandCode}
                    </code>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {brand.description || '-'}
                  </TableCell>
                  <TableCell>{brand.productCount}</TableCell>
                  <TableCell>
                    <Badge variant={brand.isActive ? 'default' : 'secondary'}>
                      {brand.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{brand.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(brand)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBrand(brand)}
                        disabled={brand.productCount > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Brand Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Brand</DialogTitle>
            <DialogDescription>
              Create a new brand for your products
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="brand-name">Brand Name*</Label>
              <Input
                id="brand-name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g., Canon"
              />
            </div>
            <div>
              <Label htmlFor="brand-code">Brand Code*</Label>
              <Input
                id="brand-code"
                value={brandCode}
                onChange={(e) => setBrandCode(e.target.value.toUpperCase())}
                placeholder="e.g., CANON"
                className="uppercase"
              />
              <p className="text-sm text-gray-500 mt-1">
                Alphanumeric code, hyphens and underscores allowed
              </p>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the brand..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBrand}>
              Create Brand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Brand Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
            <DialogDescription>
              Update brand information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-brand-name">Brand Name*</Label>
              <Input
                id="edit-brand-name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-brand-code">Brand Code*</Label>
              <Input
                id="edit-brand-code"
                value={brandCode}
                onChange={(e) => setBrandCode(e.target.value.toUpperCase())}
                className="uppercase"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditBrand}>
              Update Brand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function BrandsPage() {
  return (
    <ProtectedRoute requiredPermissions={['INVENTORY_VIEW']}>
      <BrandsContent />
    </ProtectedRoute>
  );
}