import { apiClient } from '@/lib/api-client';
import type { SKU } from '@/types/sku';

export const skusApi = {
  list: async () => {
    const response = await apiClient.get<SKU[]>('/skus');
    return response.data;
  },
};
