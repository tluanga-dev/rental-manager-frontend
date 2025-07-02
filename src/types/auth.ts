// Authentication and authorization types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  locationId?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  code: string;
  type: PermissionType;
  description: string;
}

export type PermissionType = 
  | 'SALE_CREATE' 
  | 'SALE_VIEW' 
  | 'SALE_UPDATE' 
  | 'SALE_DELETE'
  | 'RENTAL_CREATE' 
  | 'RENTAL_VIEW' 
  | 'RENTAL_UPDATE' 
  | 'RENTAL_DELETE'
  | 'CUSTOMER_CREATE' 
  | 'CUSTOMER_VIEW' 
  | 'CUSTOMER_UPDATE' 
  | 'CUSTOMER_DELETE'
  | 'INVENTORY_CREATE' 
  | 'INVENTORY_VIEW' 
  | 'INVENTORY_UPDATE' 
  | 'INVENTORY_DELETE'
  | 'RETURN_PROCESS' 
  | 'RETURN_VIEW'
  | 'INSPECTION_CREATE' 
  | 'INSPECTION_VIEW'
  | 'REPORT_VIEW' 
  | 'REPORT_EXPORT'
  | 'USER_MANAGE' 
  | 'SYSTEM_CONFIG';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: string[];
}

// Role-based menu configuration
export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  permissions: string[];
  children?: MenuItem[];
}

// Common role presets
export const ROLE_PERMISSIONS = {
  ADMIN: [
    'SALE_CREATE', 'SALE_VIEW', 'SALE_UPDATE', 'SALE_DELETE',
    'RENTAL_CREATE', 'RENTAL_VIEW', 'RENTAL_UPDATE', 'RENTAL_DELETE',
    'CUSTOMER_CREATE', 'CUSTOMER_VIEW', 'CUSTOMER_UPDATE', 'CUSTOMER_DELETE',
    'INVENTORY_CREATE', 'INVENTORY_VIEW', 'INVENTORY_UPDATE', 'INVENTORY_DELETE',
    'RETURN_PROCESS', 'RETURN_VIEW',
    'INSPECTION_CREATE', 'INSPECTION_VIEW',
    'REPORT_VIEW', 'REPORT_EXPORT',
    'USER_MANAGE', 'SYSTEM_CONFIG'
  ],
  MANAGER: [
    'SALE_CREATE', 'SALE_VIEW', 'SALE_UPDATE',
    'RENTAL_CREATE', 'RENTAL_VIEW', 'RENTAL_UPDATE',
    'CUSTOMER_CREATE', 'CUSTOMER_VIEW', 'CUSTOMER_UPDATE',
    'INVENTORY_VIEW', 'INVENTORY_UPDATE',
    'RETURN_PROCESS', 'RETURN_VIEW',
    'INSPECTION_CREATE', 'INSPECTION_VIEW',
    'REPORT_VIEW', 'REPORT_EXPORT'
  ],
  STAFF: [
    'SALE_CREATE', 'SALE_VIEW',
    'RENTAL_CREATE', 'RENTAL_VIEW',
    'CUSTOMER_VIEW', 'CUSTOMER_UPDATE',
    'INVENTORY_VIEW',
    'RETURN_PROCESS', 'RETURN_VIEW',
    'INSPECTION_CREATE', 'INSPECTION_VIEW'
  ],
  CUSTOMER: [
    'RENTAL_VIEW',
    'RETURN_VIEW'
  ]
} as const;