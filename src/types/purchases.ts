// Core Purchase Types
export interface Purchase {
  id: string;
  supplier_id: string;
  purchase_date: string;
  notes?: string;
  reference_number?: string;
  total_amount: number;
  total_items: number;
  status: PurchaseStatus;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  items: PurchaseItem[];
  supplier?: SupplierSummary;
}

export interface PurchaseItem {
  id: string;
  sku_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  condition: ItemCondition;
  notes?: string;
  location_id?: string;
  sku?: SkuSummary;
  location?: LocationSummary;
}

// Purchase Return Types
export interface PurchaseReturn {
  id: string;
  supplier_id: string;
  original_purchase_id: string;
  return_date: string;
  refund_amount: number;
  return_authorization?: string;
  notes?: string;
  status: ReturnStatus;
  payment_status: PaymentStatus;
  total_items: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  items: PurchaseReturnItem[];
  supplier?: SupplierSummary;
  original_purchase?: PurchaseSummary;
}

export interface PurchaseReturnItem {
  id: string;
  sku_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  return_reason: ReturnReason;
  condition?: ItemCondition;
  notes?: string;
  sku?: SkuSummary;
}

// Form Types
export interface PurchaseFormData {
  supplier_id: string;
  purchase_date: string;
  notes?: string;
  reference_number?: string;
  items: PurchaseItemFormData[];
}

export interface PurchaseItemFormData {
  sku_id: string;
  quantity: number;
  unit_cost: number;
  condition: ItemCondition;
  notes?: string;
  location_id?: string;
}

export interface PurchaseReturnFormData {
  supplier_id: string;
  original_purchase_id: string;
  return_date: string;
  refund_amount: number;
  return_authorization?: string;
  notes?: string;
  items: PurchaseReturnItemFormData[];
}

export interface PurchaseReturnItemFormData {
  sku_id: string;
  quantity: number;
  unit_cost: number;
  return_reason: ReturnReason;
  condition?: ItemCondition;
  notes?: string;
}

// Summary Types
export interface SupplierSummary {
  id: string;
  company_name: string;
  supplier_code: string;
  display_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  supplier_type: string;
  supplier_tier: string;
  is_active: boolean;
}

export interface SkuSummary {
  id: string;
  sku_code: string;
  display_name: string;
  current_price: number;
  category?: string;
  brand?: string;
  condition_restrictions?: ItemCondition[];
}

export interface LocationSummary {
  id: string;
  name: string;
  location_code: string;
  location_type: string;
  is_active: boolean;
}

export interface PurchaseSummary {
  id: string;
  reference_number?: string;
  purchase_date: string;
  total_amount: number;
  total_items: number;
  status: PurchaseStatus;
}

// Enums and Constants
export type PurchaseStatus = 
  | 'COMPLETED'
  | 'CANCELLED'
  | 'PARTIALLY_RETURNED';

export type ReturnStatus = 
  | 'COMPLETED'
  | 'CANCELLED'
  | 'PROCESSING';

export type PaymentStatus = 
  | 'PAID'
  | 'PENDING'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type ItemCondition = 'A' | 'B' | 'C' | 'D';

export type ReturnReason = 
  | 'DEFECTIVE'
  | 'WRONG_ITEM'
  | 'OVERSTOCKED'
  | 'QUALITY_ISSUE'
  | 'OTHER';

// Filter and Search Types
export interface PurchaseFilters {
  supplier_id?: string;
  start_date?: string;
  end_date?: string;
  status?: PurchaseStatus;
  payment_status?: PaymentStatus;
  search?: string;
  skip?: number;
  limit?: number;
}

export interface PurchaseReturnFilters {
  supplier_id?: string;
  original_purchase_id?: string;
  start_date?: string;
  end_date?: string;
  status?: ReturnStatus;
  return_reason?: ReturnReason;
  search?: string;
  skip?: number;
  limit?: number;
}

// Validation Types
export interface PurchaseReturnValidation {
  is_valid: boolean;
  available_items: Array<{
    sku_id: string;
    max_returnable_quantity: number;
    original_quantity: number;
    already_returned: number;
  }>;
  errors: string[];
}

// Analytics Types
export interface PurchaseAnalytics {
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
      reason: ReturnReason;
      count: number;
      percentage: number;
    }>;
  };
}

// UI State Types
export interface PurchaseTableState {
  loading: boolean;
  purchases: Purchase[];
  total: number;
  skip: number;
  limit: number;
  filters: PurchaseFilters;
  selectedPurchases: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PurchaseReturnTableState {
  loading: boolean;
  returns: PurchaseReturn[];
  total: number;
  skip: number;
  limit: number;
  filters: PurchaseReturnFilters;
  selectedReturns: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PurchaseFormState {
  loading: boolean;
  submitting: boolean;
  data: PurchaseFormData;
  errors: Record<string, string>;
  supplierOptions: SupplierSummary[];
  skuOptions: SkuSummary[];
  locationOptions: LocationSummary[];
}

export interface PurchaseReturnFormState {
  loading: boolean;
  submitting: boolean;
  data: PurchaseReturnFormData;
  errors: Record<string, string>;
  validation?: PurchaseReturnValidation;
  originalPurchase?: Purchase;
  availableItems: Array<{
    sku: SkuSummary;
    original_quantity: number;
    already_returned: number;
    max_returnable: number;
    unit_cost: number;
  }>;
}

// Constants
export const ITEM_CONDITIONS: Array<{ value: ItemCondition; label: string; description: string }> = [
  { value: 'A', label: 'Excellent (A)', description: 'Like new condition, no visible wear' },
  { value: 'B', label: 'Good (B)', description: 'Minor wear, fully functional' },
  { value: 'C', label: 'Fair (C)', description: 'Moderate wear, may need minor repair' },
  { value: 'D', label: 'Poor (D)', description: 'Heavy wear, needs significant repair' }
];

export const RETURN_REASONS: Array<{ value: ReturnReason; label: string; description: string }> = [
  { value: 'DEFECTIVE', label: 'Defective', description: 'Item is defective or not working properly' },
  { value: 'WRONG_ITEM', label: 'Wrong Item', description: 'Received incorrect item from supplier' },
  { value: 'OVERSTOCKED', label: 'Overstocked', description: 'Returning excess inventory' },
  { value: 'QUALITY_ISSUE', label: 'Quality Issue', description: 'Item quality does not meet standards' },
  { value: 'OTHER', label: 'Other', description: 'Other reason (specify in notes)' }
];

export const PURCHASE_STATUSES: Array<{ value: PurchaseStatus; label: string; color: string }> = [
  { value: 'COMPLETED', label: 'Completed', color: 'green' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'red' },
  { value: 'PARTIALLY_RETURNED', label: 'Partially Returned', color: 'yellow' }
];

export const RETURN_STATUSES: Array<{ value: ReturnStatus; label: string; color: string }> = [
  { value: 'COMPLETED', label: 'Completed', color: 'green' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'red' },
  { value: 'PROCESSING', label: 'Processing', color: 'blue' }
];

export const PAYMENT_STATUSES: Array<{ value: PaymentStatus; label: string; color: string }> = [
  { value: 'PAID', label: 'Paid', color: 'green' },
  { value: 'PENDING', label: 'Pending', color: 'yellow' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'red' },
  { value: 'REFUNDED', label: 'Refunded', color: 'blue' },
  { value: 'PARTIALLY_REFUNDED', label: 'Partially Refunded', color: 'orange' }
];