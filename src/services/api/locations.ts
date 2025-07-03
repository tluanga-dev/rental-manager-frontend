import { apiClient } from '@/lib/api-client';
import type { Location } from '@/types/location';

export const locationsApi = {
  list: async () => {
    const response = await apiClient.get<Location[]>('/locations');
    return response.data;
  },
};
