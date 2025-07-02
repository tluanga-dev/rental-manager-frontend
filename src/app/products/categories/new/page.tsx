'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft,
  Grid3X3,
  ChevronRight,
  Save,
  X
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { categoriesApi } from '@/services/api/categories';

interface CategoryOption {
  id: string;
  name: string;
  path: string;
  level: number;
  isLeaf: boolean;
}

function NewCategoryContent() {
  const router = useRouter();
  const { addNotification } = useAppStore();
  
  // Form states
  const [categoryName, setCategoryName] = useState('');
  const [parentCategory, setParentCategory] = useState<string>('');
  const [isLeaf, setIsLeaf] = useState(false);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  // Filter out leaf categories from parent options
  const parentOptions = categories.filter(cat => !cat.isLeaf);

  const getSelectedParent = () => {
    return parentOptions.find(cat => cat.id === parentCategory);
  };

  const getCategoryPath = () => {
    const parent = getSelectedParent();
    if (!parent || parent.id === 'root') return categoryName;
    return `${parent.path}/${categoryName}`;
  };

  const getCategoryLevel = () => {
    const parent = getSelectedParent();
    if (!parent || parent.id === 'root') return 1;
    return parent.level + 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Category name is required',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the API request payload
      const createPayload = {
        category_name: categoryName.trim(),
        parent_category_id: parentCategory === 'root' || !parentCategory ? null : parentCategory,
        display_order: 0,
      };

      console.log('Creating category with payload:', createPayload);

      // Make API call to create category
      const createdCategory = await categoriesApi.create(createPayload);

      console.log('Category created successfully:', createdCategory);

      addNotification({
        type: 'success',
        title: 'Category Created',
        message: `Category "${createdCategory.category_name}" has been created successfully at path: ${createdCategory.category_path}`,
      });

      router.push('/products/categories');
    } catch (error: any) {
      console.error('Error creating category:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to create category. Please try again.';
      
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbPath = getSelectedParent()?.path?.split('/').filter(Boolean) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Create New Category
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Add a new category to organize your products
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Form Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Category Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category-name">Category Name*</Label>
                <Input
                  id="category-name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g., Mirrorless, Flash, Microphones"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  The name of the category as it will appear in the hierarchy
                </p>
              </div>

              <div>
                <Label htmlFor="parent-category">Parent Category*</Label>
                <Select value={parentCategory} onValueChange={setParentCategory}>
                  <SelectTrigger id="parent-category">
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentOptions.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.level > 0 ? '— '.repeat(category.level) : ''}{category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Choose where this category should be placed in the hierarchy
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is-leaf">Leaf Category</Label>
                  <p className="text-sm text-gray-500">
                    Leaf categories can have products assigned to them
                  </p>
                </div>
                <Switch
                  id="is-leaf"
                  checked={isLeaf}
                  onCheckedChange={setIsLeaf}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description of this category..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Category Path</Label>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    {breadcrumbPath.length > 0 && (
                      <>
                        {breadcrumbPath.map((part, index) => (
                          <div key={index} className="flex items-center">
                            {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
                            <span>{part}</span>
                          </div>
                        ))}
                        <ChevronRight className="h-4 w-4 mx-1" />
                      </>
                    )}
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {categoryName || 'Category Name'}
                    </span>
                  </div>
                </div>

                <div>
                  <Label>Hierarchy Level</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Level {getCategoryLevel()}
                  </p>
                </div>

                <div>
                  <Label>Category Type</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {isLeaf ? 'Leaf Category (can have products)' : 'Parent Category (can have subcategories)'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-blue-900 dark:text-blue-100">
                  <Grid3X3 className="h-5 w-5 inline mr-2" />
                  Category Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <p>• Categories can be nested up to unlimited levels</p>
                <p>• Only leaf categories can have products assigned</p>
                <p>• Parent categories can only contain subcategories</p>
                <p>• Category names should be clear and descriptive</p>
                <p>• Once created, the category type (leaf/parent) cannot be changed</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Creating...' : 'Create Category'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewCategoryPage() {
  return (
    <ProtectedRoute requiredPermissions={['INVENTORY_VIEW']}>
      <NewCategoryContent />
    </ProtectedRoute>
  );
}