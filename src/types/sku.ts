export interface SKU {
  id: string;
  sku_code: string;
  sku_name: string;
  item_id: string;
  barcode?: string;
  model_number?: string;
  weight?: number;
  dimensions?: Record<string, number>;
  is_rentable: boolean;
  is_saleable: boolean;
  min_rental_days: number;
  max_rental_days?: number;
  rental_base_price?: number;
  sale_base_price?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface SKUCreate {
  sku_code: string;
  sku_name: string;
  item_id: string;
  barcode?: string;
  model_number?: string;
  weight?: number;
  dimensions?: Record<string, number>;
  is_rentable?: boolean;
  is_saleable?: boolean;
  min_rental_days?: number;
  max_rental_days?: number;
  rental_base_price?: number;
  sale_base_price?: number;
}

export interface SKUUpdate {
  sku_name?: string;
  barcode?: string;
  model_number?: string;
  weight?: number;
  dimensions?: Record<string, number>;
}

export interface SKURentalUpdate {
  is_rentable?: boolean;
  min_rental_days?: number;
  max_rental_days?: number;
  rental_base_price?: number;
}

export interface SKUSaleUpdate {
  is_saleable?: boolean;
  sale_base_price?: number;
}

export interface SKUListResponse {
  items: SKU[];
  total: number;
  skip: number;
  limit: number;
}
