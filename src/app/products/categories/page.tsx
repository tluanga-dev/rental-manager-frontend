'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CategoryTree } from '@/components/inventory';
import { 
  Plus, 
  Search, 
  ChevronRight,
  Edit,
  Trash2,
  MoveVertical,
  Grid3X3,
  Eye
} from 'lucide-react';
import { useRouter } from 'next/navigation';

function CategoriesContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // Mock category data - replace with API call
  const categories = [
    {
      id: '1',
      name: 'Cameras',
      description: 'Photography equipment',
      parent_id: undefined,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      path: 'Cameras',
      level: 1,
      isLeaf: false,
      productCount: 85,
      children: [
        {
          id: '11',
          name: 'Digital',
          description: 'Digital cameras',
          parent_id: '1',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          path: 'Cameras/Digital',
          level: 2,
          isLeaf: false,
          productCount: 75,
          children: [
            {
              id: '111',
              name: 'Mirrorless',
              description: 'Mirrorless cameras',
              parent_id: '11',
              is_active: true,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              path: 'Cameras/Digital/Mirrorless',
              level: 3,
              isLeaf: true,
              productCount: 45,
            },
            {
              id: '112',
              name: 'DSLR',
              description: 'DSLR cameras',
              parent_id: '11',
              is_active: true,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              path: 'Cameras/Digital/DSLR',
              level: 3,
              isLeaf: true,
              productCount: 30,
            },
          ],
        },
        {
          id: '12',
          name: 'Film',
          description: 'Film cameras',
          parent_id: '1',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          path: 'Cameras/Film',
          level: 2,
          isLeaf: true,
          productCount: 10,
        },
      ],
    },
    {
      id: '2',
      name: 'Lighting',
      path: 'Lighting',
      level: 1,
      isLeaf: false,
      productCount: 62,
      children: [
        {
          id: '21',
          name: 'Studio',
          path: 'Lighting/Studio',
          level: 2,
          isLeaf: false,
          productCount: 40,
          children: [
            {
              id: '211',
              name: 'Flash',
              path: 'Lighting/Studio/Flash',
              level: 3,
              isLeaf: true,
              productCount: 25,
            },
            {
              id: '212',
              name: 'Continuous',
              path: 'Lighting/Studio/Continuous',
              level: 3,
              isLeaf: true,
              productCount: 15,
            },
          ],
        },
        {
          id: '22',
          name: 'Portable',
          path: 'Lighting/Portable',
          level: 2,
          isLeaf: true,
          productCount: 22,
        },
      ],
    },
    {
      id: '3',
      name: 'Audio',
      path: 'Audio',
      level: 1,
      isLeaf: false,
      productCount: 45,
      children: [
        {
          id: '31',
          name: 'Microphones',
          path: 'Audio/Microphones',
          level: 2,
          isLeaf: true,
          productCount: 30,
        },
        {
          id: '32',
          name: 'Recorders',
          path: 'Audio/Recorders',
          level: 2,
          isLeaf: true,
          productCount: 15,
        },
      ],
    },
  ];

  const breadcrumb = selectedCategory?.path?.split('/') || [];

  // Function to flatten categories tree into a list
  const getAllCategories = () => {
    const flatList: any[] = [];
    
    const flatten = (categories: any[], parentPath = '') => {
      categories.forEach(category => {
        flatList.push(category);
        if (category.children && category.children.length > 0) {
          flatten(category.children, category.path);
        }
      });
    };
    
    flatten(categories);
    return flatList.sort((a, b) => a.path.localeCompare(b.path));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Category Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Organize your products with hierarchical categories
          </p>
        </div>
        <Button onClick={() => router.push('/products/categories/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Root Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Leaf Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Max Depth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 levels</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Tree */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Category Hierarchy</CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CategoryTree 
              categories={categories as any}
              onCreateCategory={() => {}}
              onUpdateCategory={() => {}}
              onDeleteCategory={() => {}}
              onSelectCategory={setSelectedCategory}
              selectedCategoryId={selectedCategory?.id}
            />
          </CardContent>
        </Card>

        {/* Category Details */}
        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCategory ? (
              <div className="space-y-4">
                {/* Breadcrumb */}
                <div className="flex items-center text-sm text-gray-600">
                  {breadcrumb.map((part, index) => (
                    <div key={index} className="flex items-center">
                      {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
                      <span>{part}</span>
                    </div>
                  ))}
                </div>

                {/* Category Info */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Category Name</label>
                    <p className="text-lg">{selectedCategory.name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Category Type</label>
                    <p>
                      <Badge variant={selectedCategory.isLeaf ? 'default' : 'secondary'}>
                        {selectedCategory.isLeaf ? 'Leaf Category' : 'Parent Category'}
                      </Badge>
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Hierarchy Level</label>
                    <p>Level {selectedCategory.level}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Products</label>
                    <p>{selectedCategory.productCount} products</p>
                  </div>

                  {selectedCategory.isLeaf && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        This is a leaf category. Products can be assigned to this category.
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-4">
                  <Button className="w-full" variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Category
                  </Button>
                  {!selectedCategory.isLeaf && (
                    <Button className="w-full" variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Subcategory
                    </Button>
                  )}
                  <Button className="w-full" variant="outline">
                    <MoveVertical className="mr-2 h-4 w-4" />
                    Move Category
                  </Button>
                  {selectedCategory.productCount === 0 && (
                    <Button className="w-full" variant="outline" className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Category
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Grid3X3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a category to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Categories List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Categories</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Grid3X3 className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Category Name</th>
                  <th className="text-left py-2 px-4">Full Path</th>
                  <th className="text-left py-2 px-4">Level</th>
                  <th className="text-left py-2 px-4">Type</th>
                  <th className="text-left py-2 px-4">Products</th>
                  <th className="text-left py-2 px-4">Subcategories</th>
                  <th className="text-left py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getAllCategories().map((category) => (
                  <tr key={category.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-2 px-4">
                      <div className="flex items-center">
                        {category.level > 1 && (
                          <span className="text-gray-400 mr-2">
                            {'— '.repeat(category.level - 1)}
                          </span>
                        )}
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-600">{category.path}</td>
                    <td className="py-2 px-4 text-sm">{category.level}</td>
                    <td className="py-2 px-4">
                      <Badge variant={category.isLeaf ? 'default' : 'secondary'}>
                        {category.isLeaf ? 'Leaf' : 'Parent'}
                      </Badge>
                    </td>
                    <td className="py-2 px-4 text-sm">{category.productCount || 0}</td>
                    <td className="py-2 px-4 text-sm">
                      {category.children ? category.children.length : 0}
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/products/categories/${category.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {category.productCount === 0 && (!category.children || category.children.length === 0) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <ProtectedRoute requiredPermissions={['INVENTORY_VIEW']}>
      <CategoriesContent />
    </ProtectedRoute>
  );
}