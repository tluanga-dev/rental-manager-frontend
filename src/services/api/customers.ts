import { apiClient } from '@/lib/api-client';

// Customer Types
export interface CustomerCreate {
  customer_code: string;
  customer_type: 'INDIVIDUAL' | 'BUSINESS';
  business_name?: string;
  first_name?: string;
  last_name?: string;
  tax_id?: string;
  customer_tier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  credit_limit: number;
}

export interface CustomerUpdate {
  business_name?: string;
  first_name?: string;
  last_name?: string;
  tax_id?: string;
  customer_tier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  credit_limit?: number;
}

export interface CustomerResponse {
  id: string;
  customer_code: string;
  customer_type: 'INDIVIDUAL' | 'BUSINESS';
  business_name: string | null;
  first_name: string | null;
  last_name: string | null;
  tax_id: string | null;
  customer_tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  credit_limit: number;
  blacklist_status: 'CLEAR' | 'BLACKLISTED';
  lifetime_value: number;
  last_transaction_date: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface CustomerListResponse {
  items: CustomerResponse[];
  total: number;
  skip: number;
  limit: number;
}

export interface CustomerBlacklistRequest {
  action: 'blacklist' | 'unblacklist';
}

export interface CustomerCreditLimitUpdate {
  credit_limit: number;
}

export interface CustomerTierUpdate {
  customer_tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
}

export interface CustomerAnalytics {
  total_customers: number;
  active_customers: number;
  blacklisted_customers: number;
  tier_distribution: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  monthly_new_customers: Array<{
    month: string;
    count: number;
  }>;
  top_customers_by_value: Array<{
    customer: CustomerResponse;
    lifetime_value: number;
  }>;
  customer_types: {
    individual: number;
    business: number;
  };
}

export interface CustomerTransaction {
  id: string;
  transaction_type: 'SALE' | 'RENTAL';
  transaction_status: string;
  transaction_date: string;
  total_amount: number;
  payment_status: string;
  items_count: number;
  location_name?: string;
}

export interface CustomerTransactionHistory {
  customer: CustomerResponse;
  transactions: CustomerTransaction[];
  summary: {
    total_transactions: number;
    total_spent: number;
    average_transaction: number;
    last_transaction_date: string | null;
    favorite_items: string[];
  };
}

export const customersApi = {
  // Create a new customer
  create: async (data: CustomerCreate): Promise<CustomerResponse> => {
    const response = await apiClient.post('/customers/', data);
    return response.data.success ? response.data.data : response.data;
  },

  // Get all customers with optional filters
  list: async (params?: {
    skip?: number;
    limit?: number;
    customer_type?: 'INDIVIDUAL' | 'BUSINESS';
    customer_tier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
    blacklist_status?: 'CLEAR' | 'BLACKLISTED';
    search?: string;
    is_active?: boolean;
  }): Promise<CustomerListResponse> => {
    const response = await apiClient.get('/customers/', { params });
    return response.data.success ? response.data.data : response.data;
  },

  // Get customer by ID
  getById: async (id: string): Promise<CustomerResponse> => {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data.success ? response.data.data : response.data;
  },

  // Get customer by code
  getByCode: async (code: string): Promise<CustomerResponse> => {
    const response = await apiClient.get(`/customers/code/${code}`);
    return response.data.success ? response.data.data : response.data;
  },

  // Update customer
  update: async (id: string, data: CustomerUpdate): Promise<CustomerResponse> => {
    const response = await apiClient.put(`/customers/${id}`, data);
    return response.data.success ? response.data.data : response.data;
  },

  // Manage blacklist status
  manageBlacklist: async (id: string, action: 'blacklist' | 'unblacklist'): Promise<CustomerResponse> => {
    const response = await apiClient.post(`/customers/${id}/blacklist`, { action });
    return response.data.success ? response.data.data : response.data;
  },

  // Update credit limit
  updateCreditLimit: async (id: string, credit_limit: number): Promise<CustomerResponse> => {
    const response = await apiClient.put(`/customers/${id}/credit-limit`, { credit_limit });
    return response.data.success ? response.data.data : response.data;
  },

  // Update customer tier
  updateTier: async (id: string, customer_tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'): Promise<CustomerResponse> => {
    const response = await apiClient.put(`/customers/${id}/tier`, { customer_tier });
    return response.data.success ? response.data.data : response.data;
  },

  // Delete customer (soft delete)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
  },

  // Search customers by name
  searchByName: async (name: string, limit: number = 10): Promise<CustomerResponse[]> => {
    const response = await apiClient.get('/customers/search/name', { 
      params: { name, limit } 
    });
    return response.data.success ? response.data.data : response.data;
  },

  // Get blacklisted customers
  getBlacklisted: async (skip: number = 0, limit: number = 100): Promise<CustomerListResponse> => {
    const response = await apiClient.get('/customers/blacklisted/', { 
      params: { skip, limit } 
    });
    return response.data.success ? response.data.data : response.data;
  },

  // Get customers by tier
  getByTier: async (
    tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM', 
    skip: number = 0, 
    limit: number = 100
  ): Promise<CustomerListResponse> => {
    const response = await apiClient.get(`/customers/tier/${tier}`, { 
      params: { skip, limit } 
    });
    return response.data.success ? response.data.data : response.data;
  },

  // Get customer analytics (will be implemented when backend provides this)
  getAnalytics: async (): Promise<CustomerAnalytics> => {
    try {
      const response = await apiClient.get('/analytics/customers');
      return response.data;
    } catch (error) {
      // Fallback - calculate from customer list for now
      const customers = await customersApi.list({ limit: 1000 });
      
      const analytics: CustomerAnalytics = {
        total_customers: customers.total,
        active_customers: customers.items.filter(c => c.is_active).length,
        blacklisted_customers: customers.items.filter(c => c.blacklist_status === 'BLACKLISTED').length,
        tier_distribution: {
          bronze: customers.items.filter(c => c.customer_tier === 'BRONZE').length,
          silver: customers.items.filter(c => c.customer_tier === 'SILVER').length,
          gold: customers.items.filter(c => c.customer_tier === 'GOLD').length,
          platinum: customers.items.filter(c => c.customer_tier === 'PLATINUM').length,
        },
        monthly_new_customers: [], // Would need date grouping
        top_customers_by_value: customers.items
          .sort((a, b) => b.lifetime_value - a.lifetime_value)
          .slice(0, 10)
          .map(customer => ({
            customer,
            lifetime_value: customer.lifetime_value
          })),
        customer_types: {
          individual: customers.items.filter(c => c.customer_type === 'INDIVIDUAL').length,
          business: customers.items.filter(c => c.customer_type === 'BUSINESS').length,
        }
      };
      
      return analytics;
    }
  },

  // Get customer transaction history (will integrate with transaction API)
  getTransactionHistory: async (customerId: string): Promise<CustomerTransactionHistory> => {
    try {
      const response = await apiClient.get(`/analytics/customers/${customerId}/transactions`);
      const data = response.data;
      
      // Ensure the response has the expected structure
      return {
        customer: data.customer,
        transactions: data.transactions || [],
        summary: {
          total_transactions: data.summary?.total_transactions || 0,
          total_spent: data.summary?.total_spent || 0,
          average_transaction: data.summary?.average_transaction || 0,
          last_transaction_date: data.summary?.last_transaction_date || null,
          favorite_items: data.summary?.favorite_items || []
        }
      };
    } catch (error) {
      console.warn('Failed to load transaction history, using fallback:', error);
      // Fallback - return customer with empty transaction history
      const customer = await customersApi.getById(customerId);
      return {
        customer,
        transactions: [],
        summary: {
          total_transactions: 0,
          total_spent: 0,
          average_transaction: 0,
          last_transaction_date: customer.last_transaction_date,
          favorite_items: []
        }
      };
    }
  }
};