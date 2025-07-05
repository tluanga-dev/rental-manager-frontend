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

interface CreateLocationData {
  location_code: string;
  location_name: string;
  location_type: 'WAREHOUSE' | 'STORE' | 'SERVICE_CENTER' | 'OTHER';
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  contact_number?: string;
  email?: string;
  manager_user_id?: string;
}

interface UpdateLocationData extends Partial<CreateLocationData> {}

interface AssignManagerData {
  manager_user_id: string;
}

export const locationsApi = {
  // List locations with pagination and filters
  list: async (params: LocationListParams = {}): Promise<Location[]> => {
    try {
      console.log('📡 Calling locations API with params:', params);
      
      // Use trailing slash and configure axios to follow redirects properly
      const response = await apiClient.get<LocationListResponse>('/locations/', { 
        params,
        maxRedirects: 5 // Allow following redirects
      });
      
      console.log('📡 Raw API response status:', response.status);
      console.log('📡 Raw API response:', response);
      console.log('📡 Response data:', response.data);
      
      // Handle the wrapped response format from axios interceptor
      let responseData = response.data;
      
      // Check if it's wrapped in our API response format {success: true, data: {...}}
      if (responseData && typeof responseData === 'object' && 'success' in responseData && responseData.success) {
        console.log('📡 Found wrapped response, unwrapping...');
        responseData = responseData.data;
      }
      
      console.log('📡 Extracted response data:', responseData);
      
      // Handle LocationListResponse format: {items: [], total: number, skip: number, limit: number}
      if (responseData && typeof responseData === 'object' && 'items' in responseData && Array.isArray(responseData.items)) {
        console.log('📡 Found paginated items:', responseData.items.length);
        console.log('📡 Total items available:', responseData.total);
        return responseData.items;
      }
      
      // Handle direct array response (fallback)
      if (Array.isArray(responseData)) {
        console.log('📡 Direct array response:', responseData.length);
        return responseData;
      }
      
      console.warn('📡 Unexpected response format:', responseData);
      return [];
      
    } catch (error) {
      console.error('📡 Locations API error:', error);
      throw error; // Re-throw to trigger React Query error handling
    }
  },

  // Get location by ID
  getById: async (id: string): Promise<Location> => {
    const response = await apiClient.get<Location>(`/locations/${id}`);
    return response.data;
  },

  // Create a new location
  create: async (data: CreateLocationData): Promise<Location> => {
    const response = await apiClient.post<Location>('/locations', data);
    return response.data;
  },

  // Update an existing location
  update: async (id: string, data: UpdateLocationData): Promise<Location> => {
    const response = await apiClient.put<Location>(`/locations/${id}`, data);
    return response.data;
  },

  // Delete a location (soft delete)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/locations/${id}`);
  },

  // Activate a location
  activate: async (id: string): Promise<Location> => {
    const response = await apiClient.post<Location>(`/locations/${id}/activate`);
    return response.data;
  },

  // Deactivate a location
  deactivate: async (id: string): Promise<Location> => {
    const response = await apiClient.post<Location>(`/locations/${id}/deactivate`);
    return response.data;
  },

  // Assign manager to location
  assignManager: async (id: string, data: AssignManagerData): Promise<Location> => {
    const response = await apiClient.post<Location>(`/locations/${id}/assign-manager`, data);
    return response.data;
  },

  // Remove manager from location
  removeManager: async (id: string): Promise<Location> => {
    const response = await apiClient.post<Location>(`/locations/${id}/remove-manager`);
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
