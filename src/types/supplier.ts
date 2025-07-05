// Base supplier interface for dropdown component
export interface Supplier {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
}

// Extended supplier interface with full details
export interface SupplierDetails extends Supplier {
  display_name: string;
  company_name: string;
  supplier_type: 'MANUFACTURER' | 'DISTRIBUTOR' | 'WHOLESALER' | 'RETAILER' | 'SERVICE_PROVIDER';
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  payment_terms: 'NET15' | 'NET30' | 'NET45' | 'NET60' | 'NET90' | 'COD' | 'PREPAID';
  credit_limit: number;
  supplier_tier: 'PREFERRED' | 'STANDARD' | 'RESTRICTED';
  total_orders: number;
  total_spend: number;
  average_delivery_days: number;
  quality_rating: number;
  last_order_date: string | null;
  created_at: string;
  updated_at: string;
  performance_score: number;
}

// For legacy compatibility with existing components
export interface SupplierSummary {
  id: string;
  supplier_code: string;
  display_name: string;
  company_name: string;
  supplier_tier: string;
  supplier_type: string;
  is_active: boolean;
}