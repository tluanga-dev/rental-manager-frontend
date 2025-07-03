import { apiClient } from '@/lib/api-client';

export interface CategoryCreate {
  category_name: string;
  parent_category_id?: string | null;
  display_order?: number;
}

export interface CategoryResponse {
  id: string;
  category_name: string;
  parent_category_id: string | null;
  display_order: number;
  category_path: string;
  category_level: number;
  is_leaf: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_active: boolean;
}

export interface CategoryTree extends CategoryResponse {
  children?: CategoryTree[];
}

export interface CategoryUpdate {
  category_name?: string;
  display_order?: number;
}

export interface CategoryMove {
  new_parent_id?: string | null;
}

export interface PaginatedCategories {
  items: CategoryResponse[];
  total: number;
  skip: number;
  limit: number;
}

export const categoriesApi = {
  // Create a new category
  create: async (data: CategoryCreate): Promise<CategoryResponse> => {
    const response = await apiClient.post('/categories/', data);
    // Handle wrapped response from API client
    return response.data.success ? response.data.data : response.data;
  },

  // Get all categories with optional filters
  list: async (params?: {
    skip?: number;
    limit?: number;
    search?: string;
    parent_id?: string;
    is_leaf?: boolean;
    is_active?: boolean;
  }): Promise<PaginatedCategories> => {
    const response = await apiClient.get('/categories/', { params });
    // Handle wrapped response from API client
    return response.data.success ? response.data.data : response.data;
  },

  // Get category by ID
  getById: async (id: string): Promise<CategoryResponse> => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data.success ? response.data.data : response.data;
  },

  // Get category by path
  getByPath: async (path: string): Promise<CategoryResponse> => {
    const response = await apiClient.get(`/categories/path/${path}`);
    return response.data;
  },

  // Get category tree
  getTree: async (): Promise<CategoryTree[]> => {
    const response = await apiClient.get('/categories/tree/');
    return response.data;
  },

  // Get breadcrumb trail
  getBreadcrumb: async (id: string): Promise<CategoryResponse[]> => {
    const response = await apiClient.get(`/categories/${id}/breadcrumb`);
    return response.data;
  },

  // Get direct children
  getChildren: async (id: string): Promise<CategoryResponse[]> => {
    const response = await apiClient.get(`/categories/${id}/children`);
    return response.data;
  },

  // Get all leaf categories
  getLeafCategories: async (): Promise<CategoryResponse[]> => {
    const response = await apiClient.get('/categories/leaf/all');
    return response.data;
  },

  // Get category statistics
  getStatistics: async (): Promise<any> => {
    const response = await apiClient.get('/categories/statistics/summary');
    return response.data;
  },

  // Update category
  update: async (id: string, data: CategoryUpdate): Promise<CategoryResponse> => {
    const response = await apiClient.put(`/categories/${id}`, data);
    return response.data;
  },

  // Move category
  move: async (id: string, data: CategoryMove): Promise<CategoryResponse> => {
    const response = await apiClient.post(`/categories/${id}/move`, data);
    return response.data;
  },

  // Delete category (soft delete)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};