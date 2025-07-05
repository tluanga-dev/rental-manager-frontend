import { apiClient } from '@/lib/api-client';

// Purchase Transaction Types
export interface PurchaseItemRecord {
  sku_id: string;
  quantity: number;
  unit_cost: number;
  condition: 'A' | 'B' | 'C' | 'D';
  notes?: string;
  location_id?: string;
}

export interface PurchaseRecord {
  supplier_id: string;
  purchase_date: string; // ISO date string
  notes?: string;
  reference_number?: string;
  items: PurchaseItemRecord[];
}

export interface PurchaseResponse {
  id: string;
  supplier_id: string;
  purchase_date: string;
  notes: string | null;
  reference_number: string | null;
  total_amount: number;
  total_items: number;
  status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  items: PurchaseItemResponse[];
  supplier?: {
    id: string;
    company_name: string;
    supplier_code: string;
    display_name: string;
  };
}

export interface PurchaseItemResponse {
  id: string;
  sku_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  condition: string;
  notes: string | null;
  location_id: string | null;
  sku?: {
    id: string;
    sku_code: string;
    display_name: string;
    current_price: number;
  };
  location?: {
    id: string;
    name: string;
    location_code: string;
  };
}

export interface PurchaseListResponse {
  items: PurchaseResponse[];
  total: number;
  skip: number;
  limit: number;
}

// Purchase Return Types
export interface PurchaseReturnItemRecord {
  sku_id: string;
  quantity: number;
  unit_cost: number;
  return_reason: 'DEFECTIVE' | 'WRONG_ITEM' | 'OVERSTOCKED' | 'QUALITY_ISSUE' | 'OTHER';
  condition?: 'A' | 'B' | 'C' | 'D';
  notes?: string;
}

export interface PurchaseReturnRecord {
  supplier_id: string;
  original_purchase_id: string;
  return_date: string; // ISO date string
  refund_amount: number;
  return_authorization?: string;
  notes?: string;
  items: PurchaseReturnItemRecord[];
}

export interface PurchaseReturnResponse {
  id: string;
  supplier_id: string;
  original_purchase_id: string;
  return_date: string;
  refund_amount: number;
  return_authorization: string | null;
  notes: string | null;
  status: string;
  payment_status: string;
  total_items: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  items: PurchaseReturnItemResponse[];
  supplier?: {
    id: string;
    company_name: string;
    supplier_code: string;
    display_name: string;
  };
  original_purchase?: {
    id: string;
    reference_number: string | null;
    purchase_date: string;
    total_amount: number;
  };
}

export interface PurchaseReturnItemResponse {
  id: string;
  sku_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  return_reason: string;
  condition: string | null;
  notes: string | null;
  sku?: {
    id: string;
    sku_code: string;
    display_name: string;
    current_price: number;
  };
}

export interface PurchaseReturnListResponse {
  items: PurchaseReturnResponse[];
  total: number;
  skip: number;
  limit: number;
}

// API Response wrapper types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const purchasesApi = {
  // Purchase Management
  recordPurchase: async (data: PurchaseRecord): Promise<PurchaseResponse> => {
    const response = await apiClient.post('/transactions/purchases', data);
    return response.data.success ? response.data.data : response.data;
  },

  getPurchases: async (params?: {
    skip?: number;
    limit?: number;
    supplier_id?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
    search?: string;
  }): Promise<PurchaseListResponse> => {
    const response = await apiClient.get('/transactions/purchases', { params });
    return response.data.success ? response.data.data : response.data;
  },

  getPurchaseById: async (id: string): Promise<PurchaseResponse> => {
    const response = await apiClient.get(`/transactions/purchases/${id}`);
    return response.data.success ? response.data.data : response.data;
  },

  getPurchasesBySupplier: async (
    supplierId: string,
    params?: {
      skip?: number;
      limit?: number;
      start_date?: string;
      end_date?: string;
    }
  ): Promise<PurchaseListResponse> => {
    const response = await apiClient.get(`/transactions/purchases/supplier/${supplierId}`, { params });
    return response.data.success ? response.data.data : response.data;
  },

  // Purchase Returns Management
  recordPurchaseReturn: async (data: PurchaseReturnRecord): Promise<PurchaseReturnResponse> => {
    const response = await apiClient.post('/transactions/purchase-returns', data);
    return response.data.success ? response.data.data : response.data;
  },

  getPurchaseReturns: async (params?: {
    skip?: number;
    limit?: number;
    supplier_id?: string;
    original_purchase_id?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
    search?: string;
  }): Promise<PurchaseReturnListResponse> => {
    const response = await apiClient.get('/transactions/purchase-returns', { params });
    return response.data.success ? response.data.data : response.data;
  },

  getPurchaseReturnById: async (id: string): Promise<PurchaseReturnResponse> => {
    const response = await apiClient.get(`/transactions/purchase-returns/${id}`);
    return response.data.success ? response.data.data : response.data;
  },

  getPurchaseReturnsByPurchase: async (
    purchaseId: string,
    params?: {
      skip?: number;
      limit?: number;
    }
  ): Promise<PurchaseReturnListResponse> => {
    const response = await apiClient.get(`/transactions/purchase-returns/purchase/${purchaseId}`, { params });
    return response.data.success ? response.data.data : response.data;
  },

  // Utility Methods
  searchPurchases: async (query: string, limit: number = 10): Promise<PurchaseResponse[]> => {
    const response = await apiClient.get('/transactions/purchases/search', {
      params: { q: query, limit }
    });
    return response.data.success ? response.data.data : response.data;
  },

  validatePurchaseReturn: async (
    originalPurchaseId: string,
    items: PurchaseReturnItemRecord[]
  ): Promise<{
    is_valid: boolean;
    available_items: Array<{
      sku_id: string;
      max_returnable_quantity: number;
      original_quantity: number;
      already_returned: number;
    }>;
    errors: string[];
  }> => {
    const response = await apiClient.post('/transactions/purchase-returns/validate', {
      original_purchase_id: originalPurchaseId,
      items
    });
    return response.data.success ? response.data.data : response.data;
  },

  // Analytics and Reports
  getPurchaseAnalytics: async (params?: {
    start_date?: string;
    end_date?: string;
    supplier_id?: string;
  }): Promise<{
    total_purchases: number;
    total_amount: number;
    total_items: number;
    average_order_value: number;
    top_suppliers: Array<{
      supplier_id: string;
      supplier_name: string;
      total_purchases: number;
      total_amount: number;
    }>;
    monthly_trends: Array<{
      month: string;
      purchase_count: number;
      total_amount: number;
    }>;
    return_statistics: {
      total_returns: number;
      total_refund_amount: number;
      return_rate: number;
      top_return_reasons: Array<{
        reason: string;
        count: number;
        percentage: number;
      }>;
    };
  }> => {
    const response = await apiClient.get('/analytics/purchases', { params });
    return response.data.success ? response.data.data : response.data;
  }
};