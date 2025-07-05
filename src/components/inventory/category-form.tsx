'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { categorySchema, type CategoryFormData } from '@/lib/validations';
import { Category } from '@/types/api';

interface CategoryFormProps {
  onSubmit: (data: CategoryFormData) => void;
  initialData?: Partial<CategoryFormData>;
  parentCategories?: Category[];
  isLoading?: boolean;
  isEditing?: boolean;
}

export function CategoryForm({ 
  onSubmit, 
  initialData, 
  parentCategories = [], 
  isLoading, 
  isEditing 
}: CategoryFormProps) {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      parent_id: initialData?.parent_id || undefined,
    },
  });

  const handleSubmit = (data: CategoryFormData) => {
    onSubmit(data);
  };

  // Build hierarchical display names for parent categories
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

  const availableParents = parentCategories.map(category => ({
    ...category,
    displayName: buildCategoryPath(category, parentCategories)
  }));

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Category' : 'Create Category'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Enter category name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent_id">Parent Category</Label>
            <Select
              value={form.watch('parent_id') || ''}
              onValueChange={(value) => 
                form.setValue('parent_id', value || undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent category (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Root Category)</SelectItem>
                {availableParents.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.parent_id && (
              <p className="text-sm text-red-500">
                {form.formState.errors.parent_id.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Enter category description (optional)"
              rows={3}
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
              {isLoading ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}