import { apiClient } from '@/lib/api-client';
import type {
  InventoryUnit,
  StockLevel,
  InventoryTransfer,
  InventoryReservation,
  InventoryMovement,
  InventoryDashboardSummary,
  InventoryFilters,
  InventoryStatus,
  ConditionGrade,
  TransferStatus,
} from '@/types/inventory';

// Inventory Units API
export const inventoryUnitsApi = {
  // Create inventory unit
  create: async (data: {
    sku_id: string;
    location_id: string;
    serial_number?: string;
    purchase_date?: string;
    purchase_price?: number;
    condition_grade: ConditionGrade;
    notes?: string;
  }) => {
    const response = await apiClient.post<InventoryUnit>('/inventory/units', data);
    return response.data;
  },

  // Get inventory unit by ID
  getById: async (unitId: string) => {
    const response = await apiClient.get<InventoryUnit>(`/inventory/units/${unitId}`);
    return response.data;
  },

  // Get inventory unit by code
  getByCode: async (inventoryCode: string) => {
    const response = await apiClient.get<InventoryUnit>(`/inventory/units/code/${inventoryCode}`);
    return response.data;
  },

  // List inventory units with filters
  list: async (filters?: InventoryFilters) => {
    const params = new URLSearchParams();
    
    if (filters?.location_ids?.length) {
      filters.location_ids.forEach(id => params.append('location_ids', id));
    }
    if (filters?.sku_ids?.length) {
      filters.sku_ids.forEach(id => params.append('sku_ids', id));
    }
    if (filters?.statuses?.length) {
      filters.statuses.forEach(status => params.append('statuses', status));
    }
    if (filters?.condition_grades?.length) {
      filters.condition_grades.forEach(grade => params.append('condition_grades', grade));
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    
    const response = await apiClient.get<InventoryUnit[]>(`/inventory/units?${params.toString()}`);
    return response.data;
  },

  // Update inventory unit status
  updateStatus: async (unitId: string, status: InventoryStatus, notes?: string) => {
    const response = await apiClient.put<InventoryUnit>(
      `/inventory/units/${unitId}/status`,
      { status, notes }
    );
    return response.data;
  },

  // Inspect inventory unit
  inspect: async (unitId: string, data: {
    condition_grade: ConditionGrade;
    inspection_notes: string;
    damage_assessment?: any;
    photos?: string[];
    next_inspection_date?: string;
  }) => {
    const response = await apiClient.post<InventoryUnit>(
      `/inventory/units/${unitId}/inspect`,
      data
    );
    return response.data;
  },

  // Transfer inventory unit
  transfer: async (unitId: string, data: {
    to_location_id: string;
    transfer_notes?: string;
  }) => {
    const response = await apiClient.post<InventoryUnit>(
      `/inventory/units/${unitId}/transfer`,
      data
    );
    return response.data;
  },

  // Bulk transfer
  bulkTransfer: async (data: {
    unit_ids: string[];
    from_location_id: string;
    to_location_id: string;
    transfer_notes?: string;
  }) => {
    const response = await apiClient.post<{
      transferred: string[];
      failed: Array<{ unit_id: string; error: string }>;
    }>('/inventory/units/transfer/bulk', data);
    return response.data;
  },

  // Transfer by SKU
  transferBySku: async (data: {
    sku_id: string;
    from_location_id: string;
    to_location_id: string;
    quantity: number;
    transfer_notes?: string;
  }) => {
    const response = await apiClient.post<{
      transferred_units: InventoryUnit[];
      transfer_count: number;
    }>('/inventory/units/transfer/by-sku', data);
    return response.data;
  },

  // Get units needing inspection
  getUnitsNeedingInspection: async (locationId?: string, daysOverdue?: number) => {
    const params = new URLSearchParams();
    if (locationId) params.append('location_id', locationId);
    if (daysOverdue) params.append('days_overdue', daysOverdue.toString());
    
    const response = await apiClient.get<InventoryUnit[]>(
      `/inventory/units/needing-inspection?${params.toString()}`
    );
    return response.data;
  },

  // Get status count
  getStatusCount: async (locationId?: string, skuId?: string) => {
    const params = new URLSearchParams();
    if (locationId) params.append('location_id', locationId);
    if (skuId) params.append('sku_id', skuId);
    
    const response = await apiClient.get<Record<InventoryStatus, number>>(
      `/inventory/units/status-count?${params.toString()}`
    );
    return response.data;
  },

  // Get condition count
  getConditionCount: async (locationId?: string, skuId?: string) => {
    const params = new URLSearchParams();
    if (locationId) params.append('location_id', locationId);
    if (skuId) params.append('sku_id', skuId);
    
    const response = await apiClient.get<Record<ConditionGrade, number>>(
      `/inventory/units/condition-count?${params.toString()}`
    );
    return response.data;
  },
};

// Stock Levels API
export const stockLevelsApi = {
  // Create stock level
  create: async (data: {
    sku_id: string;
    location_id: string;
    reorder_point?: number;
    reorder_quantity?: number;
    max_stock?: number;
  }) => {
    const response = await apiClient.post<StockLevel>('/inventory/stock-levels', data);
    return response.data;
  },

  // List stock levels
  list: async (filters?: {
    location_id?: string;
    sku_ids?: string[];
    low_stock_only?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (filters?.location_id) params.append('location_id', filters.location_id);
    if (filters?.sku_ids?.length) {
      filters.sku_ids.forEach(id => params.append('sku_ids', id));
    }
    if (filters?.low_stock_only) params.append('low_stock_only', 'true');
    
    const response = await apiClient.get<StockLevel[]>(
      `/inventory/stock-levels?${params.toString()}`
    );
    return response.data;
  },

  // Get stock level by SKU and location
  getBySkuLocation: async (skuId: string, locationId: string) => {
    const response = await apiClient.get<StockLevel>(
      `/inventory/stock-levels/${skuId}/${locationId}`
    );
    return response.data;
  },

  // Perform stock operation
  performOperation: async (
    skuId: string,
    locationId: string,
    operation: 'receive' | 'adjust' | 'reserve' | 'release',
    quantity: number,
    notes?: string
  ) => {
    const response = await apiClient.put<StockLevel>(
      `/inventory/stock-levels/${skuId}/${locationId}/operation`,
      { operation, quantity, notes }
    );
    return response.data;
  },

  // Update stock parameters
  updateParameters: async (
    skuId: string,
    locationId: string,
    data: {
      reorder_point?: number;
      reorder_quantity?: number;
      max_stock?: number;
    }
  ) => {
    const response = await apiClient.put<StockLevel>(
      `/inventory/stock-levels/${skuId}/${locationId}/parameters`,
      data
    );
    return response.data;
  },

  // Bulk receive stock
  bulkReceive: async (locationId: string, items: Array<{
    sku_id: string;
    quantity: number;
    unit_cost?: number;
    notes?: string;
  }>) => {
    const response = await apiClient.post<{
      success: Array<{ sku_id: string; new_quantity: number }>;
      failed: Array<{ sku_id: string; error: string }>;
    }>(`/inventory/stock-levels/${locationId}/bulk-receive`, { items });
    return response.data;
  },

  // Reconcile stock
  reconcile: async (
    skuId: string,
    locationId: string,
    physicalCount: number,
    reason: string
  ) => {
    const response = await apiClient.put<{
      stock_level: StockLevel;
      adjustment: number;
      movement_id: string;
    }>(`/inventory/stock-levels/${skuId}/${locationId}/reconcile`, {
      physical_count: physicalCount,
      reason,
    });
    return response.data;
  },
};

// Stock Analysis API
export const stockAnalysisApi = {
  // Check availability
  checkAvailability: async (data: {
    sku_id: string;
    location_id: string;
    quantity: number;
    start_date?: string;
    end_date?: string;
  }) => {
    const response = await apiClient.post<{
      available: boolean;
      current_available: number;
      requested: number;
      future_available?: number;
    }>('/inventory/availability/check', data);
    return response.data;
  },

  // Check multiple SKUs availability
  checkMultipleAvailability: async (items: Array<{
    sku_id: string;
    location_id: string;
    quantity: number;
  }>) => {
    const response = await apiClient.post<{
      all_available: boolean;
      results: Array<{
        sku_id: string;
        location_id: string;
        available: boolean;
        current_available: number;
        requested: number;
      }>;
    }>('/inventory/availability/check-multiple', { items });
    return response.data;
  },

  // Get low stock alerts
  getLowStockAlerts: async (locationId?: string, severity?: 'all' | 'critical') => {
    const params = new URLSearchParams();
    if (locationId) params.append('location_id', locationId);
    if (severity) params.append('severity', severity);
    
    const response = await apiClient.get<Array<{
      sku_id: string;
      sku_name: string;
      location_id: string;
      location_name: string;
      current_stock: number;
      reorder_point: number;
      reorder_quantity: number;
      days_until_stockout?: number;
      severity: 'low' | 'critical';
    }>>(`/inventory/stock-levels/low-stock/alerts?${params.toString()}`);
    return response.data;
  },

  // Get overstock report
  getOverstockReport: async (locationId?: string, thresholdPercentage?: number) => {
    const params = new URLSearchParams();
    if (locationId) params.append('location_id', locationId);
    if (thresholdPercentage) params.append('threshold_percentage', thresholdPercentage.toString());
    
    const response = await apiClient.get<Array<{
      sku_id: string;
      sku_name: string;
      location_id: string;
      location_name: string;
      current_stock: number;
      max_stock: number;
      excess_quantity: number;
      excess_percentage: number;
      estimated_value: number;
    }>>(`/inventory/stock-levels/overstock/report?${params.toString()}`);
    return response.data;
  },

  // Get stock valuation
  getStockValuation: async (filters?: {
    location_id?: string;
    category_id?: string;
    include_zero_stock?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (filters?.location_id) params.append('location_id', filters.location_id);
    if (filters?.category_id) params.append('category_id', filters.category_id);
    if (filters?.include_zero_stock) params.append('include_zero_stock', 'true');
    
    const response = await apiClient.get<{
      total_value: number;
      total_units: number;
      by_location: Array<{
        location_id: string;
        location_name: string;
        total_value: number;
        total_units: number;
      }>;
      by_category: Array<{
        category_id: string;
        category_name: string;
        total_value: number;
        total_units: number;
      }>;
    }>(`/inventory/stock-levels/valuation?${params.toString()}`);
    return response.data;
  },
};

// Dashboard API
export const inventoryDashboardApi = {
  getSummary: async (locationId?: string) => {
    const params = locationId ? `?location_id=${locationId}` : '';
    const response = await apiClient.get<InventoryDashboardSummary>(
      `/inventory/dashboard/summary${params}`
    );
    return response.data;
  },
};

// Inventory Movements API
export const inventoryMovementsApi = {
  list: async (filters?: {
    inventory_unit_id?: string;
    location_id?: string;
    movement_type?: string;
    date_range?: { start: string; end: string };
  }) => {
    const params = new URLSearchParams();
    if (filters?.inventory_unit_id) params.append('inventory_unit_id', filters.inventory_unit_id);
    if (filters?.location_id) params.append('location_id', filters.location_id);
    if (filters?.movement_type) params.append('movement_type', filters.movement_type);
    if (filters?.date_range) {
      params.append('start_date', filters.date_range.start);
      params.append('end_date', filters.date_range.end);
    }
    
    const response = await apiClient.get<InventoryMovement[]>(
      `/inventory/movements?${params.toString()}`
    );
    return response.data;
  },
};

// Inventory Transfers API
export const inventoryTransfersApi = {
  create: async (data: {
    from_location_id: string;
    to_location_id: string;
    sku_id: string;
    quantity: number;
    requested_by: string;
    notes?: string;
  }) => {
    const response = await apiClient.post<InventoryTransfer>('/inventory/transfers', data);
    return response.data;
  },

  list: async (filters?: {
    location_id?: string;
    status?: TransferStatus;
    date_range?: { start: string; end: string };
  }) => {
    const params = new URLSearchParams();
    if (filters?.location_id) params.append('location_id', filters.location_id);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date_range) {
      params.append('start_date', filters.date_range.start);
      params.append('end_date', filters.date_range.end);
    }
    
    const response = await apiClient.get<InventoryTransfer[]>(
      `/inventory/transfers?${params.toString()}`
    );
    return response.data;
  },

  approve: async (transferId: string, approvedBy: string) => {
    const response = await apiClient.put<InventoryTransfer>(
      `/inventory/transfers/${transferId}/approve`,
      { approved_by: approvedBy }
    );
    return response.data;
  },

  complete: async (transferId: string) => {
    const response = await apiClient.put<InventoryTransfer>(
      `/inventory/transfers/${transferId}/complete`
    );
    return response.data;
  },

  cancel: async (transferId: string, reason: string) => {
    const response = await apiClient.put<InventoryTransfer>(
      `/inventory/transfers/${transferId}/cancel`,
      { reason }
    );
    return response.data;
  },
};