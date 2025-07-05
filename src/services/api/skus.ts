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
    try {
      const response = await apiClient.get<SKUListResponse>('/skus', { params });
      const data = response.data;
      
      // Handle different response structures
      // 1. Check if response has success/data wrapper
      if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
        return (data as any).data;
      }
      
      // 2. Check if response is already in the expected format
      if (data && typeof data === 'object' && 'items' in data) {
        return data;
      }
      
      // 3. If it's an array, wrap it in the expected format
      if (Array.isArray(data)) {
        return {
          items: data,
          total: data.length,
          skip: params.skip || 0,
          limit: params.limit || data.length
        };
      }
      
      // 4. Default fallback - return empty list
      console.warn('Unexpected SKU response format:', data);
      return {
        items: [],
        total: 0,
        skip: params.skip || 0,
        limit: params.limit || 20
      };
    } catch (error) {
      console.error('Error fetching SKUs:', error);
      // Return empty list on error
      return {
        items: [],
        total: 0,
        skip: params.skip || 0,
        limit: params.limit || 20
      };
    }
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
