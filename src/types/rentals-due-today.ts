// Types for rentals due today feature

export interface RentalItem {
  sku_code: string;
  item_name: string;
  quantity: number;
  unit_price: number;
}

export interface RentalDueToday {
  transaction_id: string;
  transaction_number: string;
  customer_id: string;
  customer_name: string;
  customer_phone?: string;
  rental_start_date: string;
  rental_end_date: string;
  rental_days: number;
  is_overdue: boolean;
  days_overdue: number;
  days_remaining: number;
  total_amount: number;
  deposit_amount: number;
  balance_due: number;
  items: RentalItem[];
  location_id: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RentalDueTodaySummary {
  total_due_today: number;
  total_overdue: number;
  total_due_soon: number;
  total_revenue_at_risk: number;
  total_deposits_held: number;
}

export interface RentalDueTodayListResponse {
  rentals: RentalDueToday[];
  total: number;
  skip: number;
  limit: number;
  summary: RentalDueTodaySummary;
}
