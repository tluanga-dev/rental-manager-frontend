import { apiClient } from '@/lib/api-client';
import type { 
  SKU, 
  SKUCreate, 
  SKUUpdate, 
  SKURentalUpdate, 
  SKUSaleUpdate, 
  SKUListResponse 
} from '@/types/sku';

interface SKUListParams {
  skip?: number;
  limit?: number;
  item_id?: string;
  is_rentable?: boolean;
  is_saleable?: boolean;
  search?: string;
  is_active?: boolean;
}

export const skusApi = {
  // List SKUs with pagination and filters
  list: async (params: SKUListParams = {}): Promise<SKUListResponse> => {
    const response = await apiClient.get<SKUListResponse>('/skus', { params });
    return response.data;
  },

  // Get SKU by ID
  get: async (id: string): Promise<SKU> => {
    const response = await apiClient.get<SKU>(`/skus/${id}`);
    return response.data;
  },

  // Get SKU by code
  getByCode: async (code: string): Promise<SKU> => {
    const response = await apiClient.get<SKU>(`/skus/code/${code}`);
    return response.data;
  },

  // Get SKU by barcode
  getByBarcode: async (barcode: string): Promise<SKU> => {
    const response = await apiClient.get<SKU>(`/skus/barcode/${barcode}`);
    return response.data;
  },

  // Create new SKU
  create: async (data: SKUCreate): Promise<SKU> => {
    const response = await apiClient.post<SKU>('/skus', data);
    return response.data;
  },

  // Update SKU basic info
  update: async (id: string, data: SKUUpdate): Promise<SKU> => {
    const response = await apiClient.put<SKU>(`/skus/${id}`, data);
    return response.data;
  },

  // Update SKU rental settings
  updateRentalSettings: async (id: string, data: SKURentalUpdate): Promise<SKU> => {
    const response = await apiClient.put<SKU>(`/skus/${id}/rental`, data);
    return response.data;
  },

  // Update SKU sale settings
  updateSaleSettings: async (id: string, data: SKUSaleUpdate): Promise<SKU> => {
    const response = await apiClient.put<SKU>(`/skus/${id}/sale`, data);
    return response.data;
  },

  // Delete SKU (soft delete)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/skus/${id}`);
  },

  // Get SKUs by item ID
  getByItem: async (itemId: string, params: { skip?: number; limit?: number } = {}): Promise<SKUListResponse> => {
    const response = await apiClient.get<SKUListResponse>(`/skus/item/${itemId}/skus`, { params });
    return response.data;
  },

  // Get rentable SKUs
  getRentable: async (params: { skip?: number; limit?: number } = {}): Promise<SKUListResponse> => {
    const response = await apiClient.get<SKUListResponse>('/skus/rentable/', { params });
    return response.data;
  },

  // Get saleable SKUs
  getSaleable: async (params: { skip?: number; limit?: number } = {}): Promise<SKUListResponse> => {
    const response = await apiClient.get<SKUListResponse>('/skus/saleable/', { params });
    return response.data;
  },
};
