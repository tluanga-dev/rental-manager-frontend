export type LocationType = 'WAREHOUSE' | 'STORE' | 'SERVICE_CENTER' | 'OTHER';

export interface Location {
  id: string;
  location_code: string;
  location_name: string;
  location_type: LocationType;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  contact_number?: string;
  email?: string;
  manager_user_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
