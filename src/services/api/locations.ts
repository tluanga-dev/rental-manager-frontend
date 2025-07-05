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
      
      // Ensure trailing slash for consistent API endpoint
      const response = await apiClient.get<LocationListResponse>('/locations/', { params });
      
      console.log('📡 Raw API response:', response);
      console.log('📡 Response data:', response.data);
      
      // Handle the wrapped response format from axios interceptor
      const responseData = response.data.data || response.data;
      
      console.log('📡 Extracted response data:', responseData);
      
      if (responseData && responseData.items) {
        console.log('📡 Found items:', responseData.items.length);
        return responseData.items;
      }
      
      // Handle direct array response
      if (Array.isArray(responseData)) {
        console.log('📡 Direct array response:', responseData.length);
        return responseData;
      }
      
      console.warn('📡 Unexpected response format:', responseData);
      return [];
      
    } catch (error) {
      console.error('📡 Locations API error:', error);
      
      // Try fallback without trailing slash
      try {
        console.log('📡 Trying fallback endpoint...');
        const response = await apiClient.get<Location[]>('/locations');
        const responseData = response.data.data || response.data;
        const locations = Array.isArray(responseData) ? responseData : [];
        
        console.log('📡 Fallback response:', locations.length, 'locations');
        
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
      } catch (fallbackError) {
        console.error('📡 Fallback API also failed:', fallbackError);
        return [];
      }
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
