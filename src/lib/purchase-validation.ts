import type { 
  PurchaseFormData, 
  PurchaseReturnFormData, 
  ItemCondition, 
  ReturnReason,
  Purchase,
  PurchaseItem 
} from '@/types/purchases';
import type { SKU } from '@/types/sku';
import type { SupplierResponse } from '@/services/api/suppliers';

// Validation Rules
export class PurchaseValidationRules {
  static readonly MIN_QUANTITY = 1;
  static readonly MAX_QUANTITY = 10000;
  static readonly MIN_UNIT_COST = 0.01;
  static readonly MAX_UNIT_COST = 1000000;
  static readonly MIN_REFUND_AMOUNT = 0;
  static readonly MAX_PURCHASE_ITEMS = 50;
  static readonly MAX_RETURN_ITEMS = 50;
  
  // Business rules
  static readonly RESTRICTED_SUPPLIERS_ALLOW_RETURNS = false;
  static readonly PREPAID_TERMS_REQUIRE_IMMEDIATE_PAYMENT = true;
  static readonly CONDITION_DOWNGRADE_RETURN_ALLOWED = true;
}

// Purchase Validation
export interface PurchaseValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class PurchaseValidator {
  static validatePurchaseForm(data: PurchaseFormData, skus: SKU[], supplier?: SupplierResponse): PurchaseValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!data.supplier_id) {
      errors.push('Supplier is required');
    }

    if (!data.purchase_date) {
      errors.push('Purchase date is required');
    } else {
      const purchaseDate = new Date(data.purchase_date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      if (purchaseDate > today) {
        errors.push('Purchase date cannot be in the future');
      }
      
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      if (purchaseDate < oneYearAgo) {
        warnings.push('Purchase date is more than one year ago');
      }
    }

    // Items validation
    if (!data.items || data.items.length === 0) {
      errors.push('At least one item is required');
    } else {
      if (data.items.length > PurchaseValidationRules.MAX_PURCHASE_ITEMS) {
        errors.push(`Maximum ${PurchaseValidationRules.MAX_PURCHASE_ITEMS} items allowed per purchase`);
      }

      data.items.forEach((item, index) => {
        const itemPrefix = `Item ${index + 1}:`;
        
        // SKU validation
        if (!item.sku_id) {
          errors.push(`${itemPrefix} SKU is required`);
        } else {
          const sku = skus.find(s => s.id === item.sku_id);
          if (sku && !sku.is_saleable) {
            warnings.push(`${itemPrefix} SKU "${sku.sku_name}" is not marked as saleable`);
          }
        }

        // Quantity validation
        if (item.quantity < PurchaseValidationRules.MIN_QUANTITY) {
          errors.push(`${itemPrefix} Quantity must be at least ${PurchaseValidationRules.MIN_QUANTITY}`);
        }
        if (item.quantity > PurchaseValidationRules.MAX_QUANTITY) {
          errors.push(`${itemPrefix} Quantity cannot exceed ${PurchaseValidationRules.MAX_QUANTITY}`);
        }

        // Unit cost validation
        if (item.unit_cost < PurchaseValidationRules.MIN_UNIT_COST) {
          errors.push(`${itemPrefix} Unit cost must be at least $${PurchaseValidationRules.MIN_UNIT_COST}`);
        }
        if (item.unit_cost > PurchaseValidationRules.MAX_UNIT_COST) {
          errors.push(`${itemPrefix} Unit cost cannot exceed $${PurchaseValidationRules.MAX_UNIT_COST.toLocaleString()}`);
        }

        // Price comparison with SKU base price
        const sku = skus.find(s => s.id === item.sku_id);
        if (sku && sku.sale_base_price) {
          const priceDifference = Math.abs(item.unit_cost - sku.sale_base_price) / sku.sale_base_price;
          if (priceDifference > 0.5) { // 50% difference
            warnings.push(`${itemPrefix} Unit cost varies significantly from base price ($${sku.sale_base_price})`);
          }
        }

        // Condition validation
        if (!['A', 'B', 'C', 'D'].includes(item.condition)) {
          errors.push(`${itemPrefix} Invalid condition specified`);
        }
      });

      // Check for duplicate SKUs
      const skuIds = data.items.map(item => item.sku_id);
      const duplicateSkus = skuIds.filter((id, index) => skuIds.indexOf(id) !== index);
      if (duplicateSkus.length > 0) {
        warnings.push('Some SKUs appear multiple times. Consider combining quantities.');
      }
    }

    // Supplier-specific validation
    if (supplier) {
      if (!supplier.is_active) {
        errors.push('Cannot create purchases with inactive suppliers');
      }
      
      if (supplier.supplier_tier === 'RESTRICTED') {
        warnings.push('This supplier has restricted status. Review purchase carefully.');
      }

      // Payment terms validation
      if (supplier.payment_terms === 'PREPAID' && PurchaseValidationRules.PREPAID_TERMS_REQUIRE_IMMEDIATE_PAYMENT) {
        warnings.push('Supplier requires prepaid terms - ensure payment is processed immediately');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validatePurchaseReturnForm(
    data: PurchaseReturnFormData, 
    originalPurchase?: Purchase,
    skus: SKU[] = []
  ): PurchaseValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!data.supplier_id) {
      errors.push('Supplier is required');
    }

    if (!data.original_purchase_id) {
      errors.push('Original purchase is required');
    }

    if (!data.return_date) {
      errors.push('Return date is required');
    } else {
      const returnDate = new Date(data.return_date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (returnDate > today) {
        errors.push('Return date cannot be in the future');
      }
      
      if (originalPurchase) {
        const purchaseDate = new Date(originalPurchase.purchase_date);
        if (returnDate < purchaseDate) {
          errors.push('Return date cannot be before the original purchase date');
        }
        
        const daysSincePurchase = Math.floor((returnDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSincePurchase > 365) {
          warnings.push('Return is being processed more than one year after original purchase');
        }
      }
    }

    // Refund amount validation
    if (data.refund_amount < PurchaseValidationRules.MIN_REFUND_AMOUNT) {
      errors.push('Refund amount cannot be negative');
    }

    if (originalPurchase && data.refund_amount > originalPurchase.total_amount) {
      errors.push('Refund amount cannot exceed original purchase amount');
    }

    // Items validation
    if (!data.items || data.items.length === 0) {
      errors.push('At least one item is required for return');
    } else {
      if (data.items.length > PurchaseValidationRules.MAX_RETURN_ITEMS) {
        errors.push(`Maximum ${PurchaseValidationRules.MAX_RETURN_ITEMS} items allowed per return`);
      }

      data.items.forEach((item, index) => {
        const itemPrefix = `Return Item ${index + 1}:`;
        
        // Quantity validation
        if (item.quantity < 1) {
          errors.push(`${itemPrefix} Quantity must be at least 1`);
        }

        // Unit cost validation
        if (item.unit_cost < 0) {
          errors.push(`${itemPrefix} Unit cost cannot be negative`);
        }

        // Return reason validation
        if (!item.return_reason) {
          errors.push(`${itemPrefix} Return reason is required`);
        }

        // Original purchase item validation
        if (originalPurchase) {
          const originalItem = originalPurchase.items.find(orig => orig.sku_id === item.sku_id);
          if (!originalItem) {
            errors.push(`${itemPrefix} SKU was not in the original purchase`);
          } else {
            if (item.quantity > originalItem.quantity) {
              errors.push(`${itemPrefix} Cannot return more than originally purchased (${originalItem.quantity})`);
            }
            
            if (item.unit_cost > originalItem.unit_cost) {
              warnings.push(`${itemPrefix} Return unit cost is higher than original purchase cost`);
            }
          }
        }

        // Condition-based validation
        if (item.condition && originalPurchase) {
          const originalItem = originalPurchase.items.find(orig => orig.sku_id === item.sku_id);
          if (originalItem && this.isConditionDowngrade(originalItem.condition, item.condition)) {
            if (item.return_reason !== 'DEFECTIVE' && item.return_reason !== 'QUALITY_ISSUE') {
              warnings.push(`${itemPrefix} Item condition has degraded since purchase`);
            }
          }
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private static isConditionDowngrade(originalCondition: ItemCondition, currentCondition: ItemCondition): boolean {
    const conditionRank = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
    return conditionRank[currentCondition] < conditionRank[originalCondition];
  }
}

// Business Logic Helpers
export class PurchaseBusinessLogic {
  static calculatePurchaseTotal(items: PurchaseFormData['items']): number {
    return items.reduce((total, item) => total + (item.quantity * item.unit_cost), 0);
  }

  static calculateReturnTotal(items: PurchaseReturnFormData['items']): number {
    return items.reduce((total, item) => total + (item.quantity * item.unit_cost), 0);
  }

  static generatePurchaseReference(supplier?: SupplierResponse): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = date.toTimeString().slice(0, 5).replace(':', '');
    const supplierCode = supplier?.supplier_code?.slice(0, 3).toUpperCase() || 'SUP';
    
    return `PO-${supplierCode}-${dateStr}-${timeStr}`;
  }

  static generateReturnReference(originalPurchase?: Purchase): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const originalRef = originalPurchase?.reference_number?.slice(-6) || originalPurchase?.id.slice(0, 6) || 'UNKNOWN';
    
    return `RET-${originalRef}-${dateStr}`;
  }

  static shouldWarnAboutSupplier(supplier: SupplierResponse): { warn: boolean; reason?: string } {
    if (!supplier.is_active) {
      return { warn: true, reason: 'Supplier is inactive' };
    }
    
    if (supplier.supplier_tier === 'RESTRICTED') {
      return { warn: true, reason: 'Supplier has restricted status' };
    }
    
    if (supplier.quality_rating < 3) {
      return { warn: true, reason: 'Supplier has low quality rating' };
    }
    
    return { warn: false };
  }

  static getRecommendedRefundAmount(
    returnItems: PurchaseReturnFormData['items'],
    originalPurchase?: Purchase
  ): number {
    if (!originalPurchase) return 0;
    
    let recommendedAmount = 0;
    
    returnItems.forEach(returnItem => {
      const originalItem = originalPurchase.items.find(orig => orig.sku_id === returnItem.sku_id);
      if (originalItem) {
        let refundRate = 1.0; // Default full refund
        
        // Adjust refund rate based on return reason
        switch (returnItem.return_reason) {
          case 'DEFECTIVE':
          case 'WRONG_ITEM':
            refundRate = 1.0; // Full refund
            break;
          case 'QUALITY_ISSUE':
            refundRate = 0.9; // 90% refund
            break;
          case 'OVERSTOCKED':
            refundRate = 0.85; // 85% refund (restocking fee)
            break;
          case 'OTHER':
            refundRate = 0.8; // 80% refund
            break;
        }
        
        // Adjust for condition downgrade
        if (returnItem.condition && originalItem.condition) {
          if (this.isConditionDowngrade(originalItem.condition, returnItem.condition)) {
            refundRate *= 0.8; // 20% reduction for condition downgrade
          }
        }
        
        recommendedAmount += returnItem.quantity * originalItem.unit_cost * refundRate;
      }
    });
    
    return Math.round(recommendedAmount * 100) / 100; // Round to 2 decimal places
  }

  private static isConditionDowngrade(originalCondition: ItemCondition, currentCondition: ItemCondition): boolean {
    const conditionRank = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
    return conditionRank[currentCondition] < conditionRank[originalCondition];
  }
}

// Utility functions for form enhancement
export class PurchaseFormUtils {
  static autoFillUnitCost(sku: SKU): number {
    return sku.sale_base_price || 0;
  }

  static suggestCondition(sku: SKU, isNewPurchase: boolean = true): ItemCondition {
    // For new purchases, default to excellent condition
    if (isNewPurchase) return 'A';
    
    // For returns or used items, might need more logic
    return 'B';
  }

  static validateBarcodeFormat(barcode: string): boolean {
    // Basic barcode validation (can be enhanced based on specific requirements)
    return /^[0-9A-Z\-]+$/.test(barcode) && barcode.length >= 6 && barcode.length <= 20;
  }

  static formatDisplayPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
}