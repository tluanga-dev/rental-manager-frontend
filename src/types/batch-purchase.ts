import { z } from "zod";

// Validation schemas
export const BatchPurchaseItemMasterSchema = z.object({
  item_code: z.string().min(1).max(50).optional(),
  item_name: z.string().min(1).max(200),
  category_id: z.string().uuid(),
  brand_id: z.string().uuid().optional(),
  description: z.string().optional(),
  is_serialized: z.boolean().default(false),
});

export const BatchPurchaseSKUSchema = z.object({
  sku_code: z.string().min(1).max(50).optional(),
  sku_name: z.string().min(1).max(200),
  barcode: z.string().max(50).optional(),
  model_number: z.string().max(100).optional(),
  weight: z.number().min(0).optional(),
  dimensions: z.record(z.string(), z.number().min(0)).optional(),
  is_rentable: z.boolean().default(false),
  is_saleable: z.boolean().default(true),
  min_rental_days: z.number().int().min(1).default(1),
  max_rental_days: z.number().int().min(1).optional(),
  rental_base_price: z.number().min(0).optional(),
  sale_base_price: z.number().min(0).optional(),
}).refine(
  (data) => {
    if (data.max_rental_days && data.max_rental_days < data.min_rental_days) {
      return false;
    }
    return true;
  },
  {
    message: "Maximum rental days must be >= minimum rental days",
    path: ["max_rental_days"],
  }
);

export const BatchPurchaseItemSchema = z.object({
  id: z.string(), // Client-side ID
  type: z.enum(["existing", "new"]),
  
  // Existing SKU reference
  sku_id: z.string().uuid().optional(),
  
  // New item master and SKU
  new_item_master: BatchPurchaseItemMasterSchema.optional(),
  new_sku: BatchPurchaseSKUSchema.optional(),
  
  // Purchase line details
  quantity: z.number().min(0.01),
  unit_cost: z.number().min(0),
  serial_numbers: z.array(z.string()).default([]),
  condition_notes: z.string().default(""),
  notes: z.string().default(""),
}).refine(
  (data) => {
    if (data.type === "existing" && !data.sku_id) {
      return false;
    }
    if (data.type === "new" && (!data.new_item_master || !data.new_sku)) {
      return false;
    }
    return true;
  },
  {
    message: "Must specify either existing SKU or both new item master and SKU",
  }
);

export const BatchPurchaseFormSchema = z.object({
  // Purchase details
  supplier_id: z.string().uuid(),
  location_id: z.string().uuid(),
  purchase_date: z.string().date(),
  invoice_number: z.string().default(""),
  invoice_date: z.string().date().optional(),
  tax_rate: z.number().min(0).max(100).default(0),
  notes: z.string().default(""),
  
  // Items
  items: z.array(BatchPurchaseItemSchema).min(1),
  
  // Workflow options
  auto_generate_codes: z.boolean().default(true),
});

// TypeScript types
export type BatchPurchaseItemMaster = z.infer<typeof BatchPurchaseItemMasterSchema>;
export type BatchPurchaseSKU = z.infer<typeof BatchPurchaseSKUSchema>;
export type BatchPurchaseItem = z.infer<typeof BatchPurchaseItemSchema>;
export type BatchPurchaseForm = z.infer<typeof BatchPurchaseFormSchema>;

// Form state types
export interface BatchPurchaseFormState extends BatchPurchaseForm {
  // Workflow state
  current_step: number;
  validation_results: ValidationResults | null;
  is_validating: boolean;
  is_submitting: boolean;
  
  // Auto-save state
  last_saved: Date | null;
  has_unsaved_changes: boolean;
  save_status: 'idle' | 'saving' | 'saved' | 'error';
}

export interface ValidationResults {
  is_valid: boolean;
  validation_errors: string[];
  warnings: string[];
  items_to_create: number;
  skus_to_create: number;
  existing_skus: number;
  generated_item_codes: string[];
  generated_sku_codes: string[];
}

export interface SKUDetails {
  id: string;
  sku_code: string;
  sku_name: string;
  item_id: string;
  item_name: string;
  category_name: string;
  brand_name?: string;
  is_rentable: boolean;
  is_saleable: boolean;
  rental_base_price?: number;
  sale_base_price?: number;
}

// API types
export interface BatchPurchaseRequest {
  supplier_id: string;
  location_id: string;
  purchase_date: string;
  invoice_number?: string;
  invoice_date?: string;
  tax_rate: number;
  notes?: string;
  items: Array<{
    sku_id?: string;
    new_item_master?: BatchPurchaseItemMaster;
    new_sku?: BatchPurchaseSKU;
    quantity: number;
    unit_cost: number;
    serial_numbers?: string[];
    condition_notes?: string;
    notes?: string;
  }>;
  auto_generate_codes: boolean;
  validate_only: boolean;
}

export interface BatchPurchaseResponse {
  transaction_id: string;
  transaction_number: string;
  created_item_masters: string[];
  created_skus: string[];
  used_existing_skus: string[];
  total_amount: number;
  total_items: number;
  processing_time_ms: number;
}

export interface BatchPurchaseValidationResponse {
  is_valid: boolean;
  validation_errors: string[];
  warnings: string[];
  items_to_create: number;
  skus_to_create: number;
  existing_skus: number;
  generated_item_codes: string[];
  generated_sku_codes: string[];
}

export interface BatchPurchaseError {
  error_type: string;
  error_message: string;
  failed_at_step: string;
  created_entities_rolled_back?: Record<string, string[]>;
  validation_errors?: string[];
  suggested_actions: string[];
}

// Wizard step types
export const WIZARD_STEPS = [
  { id: 1, title: "Purchase Details", key: "purchase-details" },
  { id: 2, title: "Item Management", key: "item-management" },
  { id: 3, title: "Purchase Items", key: "purchase-items" },
  { id: 4, title: "Review & Submit", key: "review-submit" },
] as const;

export type WizardStepKey = typeof WIZARD_STEPS[number]["key"];

// Form field groups for step validation
export const STEP_FIELD_GROUPS = {
  "purchase-details": [
    "supplier_id",
    "location_id", 
    "purchase_date",
    "tax_rate"
  ],
  "item-management": [
    "items"
  ],
  "purchase-items": [
    "items.*.quantity",
    "items.*.unit_cost"
  ],
  "review-submit": []
} as const;