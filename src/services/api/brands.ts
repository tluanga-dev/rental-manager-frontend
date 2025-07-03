import { apiClient } from '@/lib/api-client';

// Brand Types
export interface BrandCreate {
  brand_name: string;
  brand_code?: string;
  description?: string;
}

export interface BrandUpdate {
  brand_name?: string;
  brand_code?: string;
  description?: string;
}

export interface Brand {
  id: string;
  brand_name: string;
  brand_code?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  is_active: boolean;
}

export interface BrandListResponse {
  items: Brand[];
  total: number;
  skip: number;
  limit: number;
}

export interface BrandListParams {
  skip?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
}

// Brands API
export const brandsApi = {
  create: async (brandData: BrandCreate): Promise<Brand> => {
    const response = await apiClient.post('/brands/', brandData);
    return response.data.success ? response.data.data : response.data;
  },

  list: async (params: BrandListParams = {}): Promise<BrandListResponse> => {
    const response = await apiClient.get('/brands/', { params });
    return response.data.success ? response.data.data : response.data;
  },

  getById: async (brandId: string): Promise<Brand> => {
    const response = await apiClient.get(`/brands/${brandId}`);
    return response.data.success ? response.data.data : response.data;
  },

  getByCode: async (brandCode: string): Promise<Brand> => {
    const response = await apiClient.get(`/brands/by-code/${brandCode}`);
    return response.data.success ? response.data.data : response.data;
  },

  getByName: async (brandName: string): Promise<Brand> => {
    const response = await apiClient.get(`/brands/by-name/${brandName}`);
    return response.data.success ? response.data.data : response.data;
  },

  update: async (brandId: string, brandData: BrandUpdate): Promise<Brand> => {
    const response = await apiClient.put(`/brands/${brandId}`, brandData);
    return response.data.success ? response.data.data : response.data;
  },

  delete: async (brandId: string): Promise<void> => {
    await apiClient.delete(`/brands/${brandId}`);
  },
};