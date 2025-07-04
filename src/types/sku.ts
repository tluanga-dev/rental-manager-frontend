export interface SKU {
  id: string;
  sku_code: string;
  sku_name: string;
  item_id: string;
  item_name: string;
  barcode?: string;
  model_number?: string;
  weight?: number;
  dimensions?: string;
  is_rentable: boolean;
  is_saleable: boolean;
  min_rental_days?: number;
  max_rental_days?: number;
  rental_base_price?: number;
  sale_base_price?: number;
  created_at: string;
  updated_at: string;
}
