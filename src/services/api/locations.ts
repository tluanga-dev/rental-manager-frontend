import { apiClient } from '@/lib/api-client';
import type { Location } from '@/types/location';

interface LocationListParams {
  skip?: number;
  limit?: number;
  location_type?: string;
  is_active?: boolean;
  search?: string;
}

interface LocationListResponse {
  items: Location[];
  total: number;
  skip: number;
  limit: number;
}

export const locationsApi = {
  // List locations with pagination and filters
  list: async (params: LocationListParams = {}): Promise<Location[]> => {
    try {
      // Try the paginated endpoint first
      const response = await apiClient.get<LocationListResponse>('/locations', { params });
      if (response.data.items) {
        return response.data.items;
      }
      // Fallback for non-paginated response
      return response.data as any;
    } catch (error) {
      // Fallback to simple list if paginated endpoint doesn't exist
      const response = await apiClient.get<Location[]>('/locations');
      const locations = Array.isArray(response.data) ? response.data : [];
      
      // Apply client-side filtering if needed
      let filteredLocations = locations;
      if (params.is_active !== undefined) {
        filteredLocations = filteredLocations.filter(loc => loc.is_active === params.is_active);
      }
      if (params.location_type) {
        filteredLocations = filteredLocations.filter(loc => loc.location_type === params.location_type);
      }
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredLocations = filteredLocations.filter(loc => 
          loc.location_name.toLowerCase().includes(searchLower) ||
          loc.location_code.toLowerCase().includes(searchLower)
        );
      }
      
      return filteredLocations;
    }
  },

  // Get location by ID
  getById: async (id: string): Promise<Location> => {
    const response = await apiClient.get<Location>(`/locations/${id}`);
    return response.data;
  },

  // Get active locations only
  getActive: async (): Promise<Location[]> => {
    return locationsApi.list({ is_active: true });
  },

  // Search locations by name
  search: async (query: string, limit: number = 10): Promise<Location[]> => {
    const locations = await locationsApi.list({ search: query, limit });
    return locations.slice(0, limit);
  }
};
