import { apiClient } from '@/lib/api-client';

// Supplier Types
export interface SupplierCreate {
  supplier_code: string;
  company_name: string;
  supplier_type: 'MANUFACTURER' | 'DISTRIBUTOR' | 'WHOLESALER' | 'RETAILER' | 'SERVICE_PROVIDER';
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  payment_terms?: 'NET15' | 'NET30' | 'NET45' | 'NET60' | 'NET90' | 'COD' | 'PREPAID';
  credit_limit?: number;
  supplier_tier?: 'PREFERRED' | 'STANDARD' | 'RESTRICTED';
}

export interface SupplierUpdate {
  company_name?: string;
  supplier_type?: 'MANUFACTURER' | 'DISTRIBUTOR' | 'WHOLESALER' | 'RETAILER' | 'SERVICE_PROVIDER';
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  payment_terms?: 'NET15' | 'NET30' | 'NET45' | 'NET60' | 'NET90' | 'COD' | 'PREPAID';
  credit_limit?: number;
  supplier_tier?: 'PREFERRED' | 'STANDARD' | 'RESTRICTED';
}

export interface SupplierResponse {
  id: string;
  supplier_code: string;
  company_name: string;
  supplier_type: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_id: string | null;
  payment_terms: string;
  credit_limit: number;
  supplier_tier: string;
  is_active: boolean;
  total_orders: number;
  total_spend: number;
  average_delivery_days: number;
  quality_rating: number;
  last_order_date: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  display_name: string;
  performance_score: number;
}

export interface SupplierListResponse {
  items: SupplierResponse[];
  total: number;
  skip: number;
  limit: number;
}

export interface SupplierAnalytics {
  total_suppliers: number;
  active_suppliers: number;
  supplier_type_distribution: {
    manufacturer: number;
    distributor: number;
    wholesaler: number;
    retailer: number;
    service_provider: number;
  };
  supplier_tier_distribution: {
    preferred: number;
    standard: number;
    restricted: number;
  };
  payment_terms_distribution: {
    [key: string]: number;
  };
  monthly_new_suppliers: Array<{
    month: string;
    count: number;
  }>;
  top_suppliers_by_spend: Array<{
    supplier: SupplierResponse;
    total_spend: number;
  }>;
  total_spend: number;
  average_quality_rating: number;
}

export interface SupplierPerformanceHistory {
  supplier: SupplierResponse;
  performance_metrics: {
    total_orders: number;
    total_spend: number;
    average_delivery_days: number;
    quality_rating: number;
    performance_score: number;
    last_order_date: string | null;
  };
  trends: {
    delivery_trend: string;
    quality_trend: string;
    spend_trend: string;
  };
  recommendations: string[];
}

export const suppliersApi = {
  // Create a new supplier
  create: async (data: SupplierCreate): Promise<SupplierResponse> => {
    const response = await apiClient.post('/suppliers/', data);
    return response.data.success ? response.data.data : response.data;
  },

  // Get all suppliers with optional filters
  list: async (params?: {
    skip?: number;
    limit?: number;
    supplier_type?: string;
    supplier_tier?: string;
    payment_terms?: string;
    search?: string;
    is_active?: boolean;
  }): Promise<SupplierListResponse> => {
    const response = await apiClient.get('/suppliers/', { params });
    return response.data.success ? response.data.data : response.data;
  },

  // Get supplier by ID
  getById: async (id: string): Promise<SupplierResponse> => {
    const response = await apiClient.get(`/suppliers/${id}`);
    return response.data.success ? response.data.data : response.data;
  },

  // Get supplier by code
  getByCode: async (code: string): Promise<SupplierResponse> => {
    const response = await apiClient.get(`/suppliers/code/${code}`);
    return response.data.success ? response.data.data : response.data;
  },

  // Update supplier
  update: async (id: string, data: SupplierUpdate): Promise<SupplierResponse> => {
    const response = await apiClient.put(`/suppliers/${id}`, data);
    return response.data.success ? response.data.data : response.data;
  },

  // Update supplier status
  updateStatus: async (id: string, is_active: boolean): Promise<SupplierResponse> => {
    const response = await apiClient.patch(`/suppliers/${id}/status`, { is_active });
    return response.data.success ? response.data.data : response.data;
  },

  // Update supplier performance metrics
  updatePerformance: async (id: string, metrics: {
    total_orders?: number;
    total_spend?: number;
    average_delivery_days?: number;
    quality_rating?: number;
  }): Promise<SupplierResponse> => {
    const response = await apiClient.patch(`/suppliers/${id}/performance`, metrics);
    return response.data.success ? response.data.data : response.data;
  },

  // Delete supplier (soft delete)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/suppliers/${id}`);
  },

  // Search suppliers by name
  searchByName: async (name: string, limit: number = 10): Promise<SupplierResponse[]> => {
    const response = await apiClient.get('/suppliers/search/name', { 
      params: { name, limit } 
    });
    return response.data.success ? response.data.data : response.data;
  },

  // Get suppliers by tier
  getByTier: async (
    tier: string, 
    skip: number = 0, 
    limit: number = 100
  ): Promise<SupplierListResponse> => {
    const response = await apiClient.get(`/suppliers/tier/${tier}`, { 
      params: { skip, limit } 
    });
    return response.data.success ? response.data.data : response.data;
  },

  // Get top suppliers by spend
  getTopBySpend: async (limit: number = 10): Promise<SupplierResponse[]> => {
    const response = await apiClient.get('/suppliers/top/by-spend', { 
      params: { limit } 
    });
    return response.data.success ? response.data.data : response.data;
  },

  // Get supplier analytics
  getAnalytics: async (): Promise<SupplierAnalytics> => {
    try {
      const response = await apiClient.get('/analytics/suppliers');
      // The axios interceptor wraps the response in { success: true, data: actualData }
      const analytics = response.data.success ? response.data.data : response.data;
      console.log('Supplier Analytics API response:', analytics);
      return analytics;
    } catch (error) {
      console.warn('Supplier Analytics API failed, using fallback:', error);
      // Fallback - calculate from supplier list for now
      const suppliers = await suppliersApi.list({ limit: 1000 });
      
      const analytics: SupplierAnalytics = {
        total_suppliers: suppliers.total,
        active_suppliers: suppliers.items.filter(s => s.is_active).length,
        supplier_type_distribution: {
          manufacturer: suppliers.items.filter(s => s.supplier_type === 'MANUFACTURER').length,
          distributor: suppliers.items.filter(s => s.supplier_type === 'DISTRIBUTOR').length,
          wholesaler: suppliers.items.filter(s => s.supplier_type === 'WHOLESALER').length,
          retailer: suppliers.items.filter(s => s.supplier_type === 'RETAILER').length,
          service_provider: suppliers.items.filter(s => s.supplier_type === 'SERVICE_PROVIDER').length,
        },
        supplier_tier_distribution: {
          preferred: suppliers.items.filter(s => s.supplier_tier === 'PREFERRED').length,
          standard: suppliers.items.filter(s => s.supplier_tier === 'STANDARD').length,
          restricted: suppliers.items.filter(s => s.supplier_tier === 'RESTRICTED').length,
        },
        payment_terms_distribution: {},
        monthly_new_suppliers: [], // Would need date grouping
        top_suppliers_by_spend: suppliers.items
          .sort((a, b) => b.total_spend - a.total_spend)
          .slice(0, 10)
          .map(supplier => ({
            supplier,
            total_spend: supplier.total_spend
          })),
        total_spend: suppliers.items.reduce((sum, s) => sum + s.total_spend, 0),
        average_quality_rating: suppliers.items.length > 0 
          ? suppliers.items.reduce((sum, s) => sum + s.quality_rating, 0) / suppliers.items.length 
          : 0
      };
      
      return analytics;
    }
  },

  // Get supplier performance history
  getPerformanceHistory: async (supplierId: string): Promise<SupplierPerformanceHistory> => {
    try {
      const response = await apiClient.get(`/analytics/suppliers/${supplierId}/performance`);
      // The axios interceptor wraps the response in { success: true, data: actualData }
      const data = response.data.success ? response.data.data : response.data;
      
      // Ensure the response has the expected structure
      return {
        supplier: data.supplier,
        performance_metrics: {
          total_orders: data.performance_metrics?.total_orders || 0,
          total_spend: data.performance_metrics?.total_spend || 0,
          average_delivery_days: data.performance_metrics?.average_delivery_days || 0,
          quality_rating: data.performance_metrics?.quality_rating || 0,
          performance_score: data.performance_metrics?.performance_score || 0,
          last_order_date: data.performance_metrics?.last_order_date || null,
        },
        trends: {
          delivery_trend: data.trends?.delivery_trend || 'stable',
          quality_trend: data.trends?.quality_trend || 'stable',
          spend_trend: data.trends?.spend_trend || 'stable',
        },
        recommendations: data.recommendations || []
      };
    } catch (error) {
      console.warn('Failed to load supplier performance history, using fallback:', error);
      // Fallback - return supplier with empty performance history
      const supplier = await suppliersApi.getById(supplierId);
      return {
        supplier,
        performance_metrics: {
          total_orders: supplier.total_orders,
          total_spend: supplier.total_spend,
          average_delivery_days: supplier.average_delivery_days,
          quality_rating: supplier.quality_rating,
          performance_score: supplier.performance_score,
          last_order_date: supplier.last_order_date
        },
        trends: {
          delivery_trend: 'stable',
          quality_trend: 'stable',
          spend_trend: 'stable'
        },
        recommendations: []
      };
    }
  }
};