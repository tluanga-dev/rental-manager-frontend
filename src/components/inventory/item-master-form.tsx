'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { itemMasterSchema, type ItemMasterFormData } from '@/lib/validations';
import { Brand, Category } from '@/types/api';

interface ItemMasterFormProps {
  onSubmit: (data: ItemMasterFormData) => void;
  initialData?: Partial<ItemMasterFormData>;
  brands: Brand[];
  categories: Category[];
  isLoading?: boolean;
  isEditing?: boolean;
}

export function ItemMasterForm({ 
  onSubmit, 
  initialData, 
  brands, 
  categories, 
  isLoading, 
  isEditing 
}: ItemMasterFormProps) {
  const form = useForm<ItemMasterFormData>({
    resolver: zodResolver(itemMasterSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      brand_id: initialData?.brand_id || '',
      category_id: initialData?.category_id || '',
    },
  });

  const handleSubmit = (data: ItemMasterFormData) => {
    onSubmit(data);
  };

  // Build hierarchical display names for categories
  const buildCategoryPath = (category: Category, allCategories: Category[]): string => {
    if (!category.parent_id) {
      return category.name;
    }
    
    const parent = allCategories.find(c => c.id === category.parent_id);
    if (parent) {
      return `${buildCategoryPath(parent, allCategories)} > ${category.name}`;
    }
    
    return category.name;
  };

  const categoriesWithPath = categories.map(category => ({
    ...category,
    displayName: buildCategoryPath(category, categories)
  }));

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Item Master' : 'Create Item Master'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Enter item name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand_id">Brand *</Label>
              <Select
                value={form.watch('brand_id')}
                onValueChange={(value) => form.setValue('brand_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.brand_id && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.brand_id.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id">Category *</Label>
            <Select
              value={form.watch('category_id')}
              onValueChange={(value) => form.setValue('category_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoriesWithPath.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.category_id && (
              <p className="text-sm text-red-500">
                {form.formState.errors.category_id.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Enter item description (optional)"
              rows={4}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Update Item' : 'Create Item'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}