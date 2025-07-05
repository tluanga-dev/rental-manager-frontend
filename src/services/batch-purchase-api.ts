import { apiClient } from '@/lib/api-client';
import type {
  BatchPurchaseRequest,
  BatchPurchaseResponse,
  BatchPurchaseValidationResponse,
  BatchPurchaseError,
  SKUDetails,
} from '@/types/batch-purchase';

class BatchPurchaseAPI {
  /**
   * Create a batch purchase with embedded item master and SKU creation
   */
  async createBatchPurchase(request: BatchPurchaseRequest): Promise<BatchPurchaseResponse> {
    try {
      const response = await apiClient.post('/api/v1/transactions/purchases/batch', request);
      return response.data.success ? response.data.data : response.data;
    } catch (error: unknown) {
      if ((error as any)?.response?.status === 400) {
        const errorData: BatchPurchaseError = (error as any).response.data;
        throw new BatchPurchaseValidationError(errorData);
      }
      throw error;
    }
  }

  /**
   * Validate a batch purchase request without creating records
   */
  async validateBatchPurchase(request: BatchPurchaseRequest): Promise<BatchPurchaseValidationResponse> {
    const validationRequest = { ...request, validate_only: true };
    
    try {
      const response = await apiClient.post('/api/v1/transactions/purchases/batch/validate', validationRequest);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorData: BatchPurchaseError = error.response.data;
        throw new BatchPurchaseValidationError(errorData);
      }
      throw error;
    }
  }

  /**
   * Search for existing SKUs
   */
  async searchSKUs(query: string, limit: number = 10): Promise<SKUDetails[]> {
    const response = await apiClient.get('/api/v1/skus/', {
      params: {
        search: query,
        limit,
        include_item_details: true,
      }
    });
    
    return response.data.items.map((sku: any) => ({
      id: sku.id,
      sku_code: sku.sku_code,
      sku_name: sku.sku_name,
      item_id: sku.item_id,
      item_name: sku.item_name || 'Unknown Item',
      category_name: sku.category_name || 'Unknown Category',
      brand_name: sku.brand_name,
      is_rentable: sku.is_rentable,
      is_saleable: sku.is_saleable,
      rental_base_price: sku.rental_base_price,
      sale_base_price: sku.sale_base_price,
    }));
  }

  /**
   * Get SKU details by ID
   */
  async getSKUDetails(skuId: string): Promise<SKUDetails> {
    const response = await apiClient.get(`/api/v1/skus/${skuId}`);
    const sku = response.data;
    
    return {
      id: sku.id,
      sku_code: sku.sku_code,
      sku_name: sku.sku_name,
      item_id: sku.item_id,
      item_name: sku.item_name || 'Unknown Item',
      category_name: sku.category_name || 'Unknown Category',
      brand_name: sku.brand_name,
      is_rentable: sku.is_rentable,
      is_saleable: sku.is_saleable,
      rental_base_price: sku.rental_base_price,
      sale_base_price: sku.sale_base_price,
    };
  }

  /**
   * Check if item code is available
   */
  async checkItemCodeAvailability(itemCode: string): Promise<boolean> {
    try {
      await apiClient.get(`/api/v1/item-masters/code/${itemCode}`);
      return false; // Code exists, not available
    } catch (error: any) {
      if (error.response?.status === 404) {
        return true; // Code not found, available
      }
      throw error;
    }
  }

  /**
   * Check if SKU code is available
   */
  async checkSKUCodeAvailability(skuCode: string): Promise<boolean> {
    try {
      await apiClient.get(`/api/v1/skus/code/${skuCode}`);
      return false; // Code exists, not available
    } catch (error: any) {
      if (error.response?.status === 404) {
        return true; // Code not found, available
      }
      throw error;
    }
  }

  /**
   * Generate suggested item code based on item name
   */
  generateItemCode(itemName: string): string {
    // Extract alphanumeric characters and create base code
    const baseCode = itemName
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .substring(0, 10);
    
    if (!baseCode) {
      return 'ITEM';
    }
    
    return baseCode;
  }

  /**
   * Generate suggested SKU code based on SKU name
   */
  generateSKUCode(skuName: string): string {
    // Extract alphanumeric characters and create base code
    const baseCode = skuName
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .substring(0, 10);
    
    if (!baseCode) {
      return 'SKU';
    }
    
    return baseCode;
  }

  /**
   * Get categories for item master creation
   */
  async getCategories(): Promise<Array<{ id: string; name: string; parent_id?: string }>> {
    const response = await apiClient.get('/api/v1/categories/');
    return response.data.items;
  }

  /**
   * Get brands for item master creation
   */
  async getBrands(): Promise<Array<{ id: string; name: string }>> {
    const response = await apiClient.get('/api/v1/brands/');
    return response.data.items;
  }

  /**
   * Get suppliers (business customers)
   */
  async getSuppliers(): Promise<Array<{ id: string; name: string; contact_info: any }>> {
    const response = await apiClient.get('/suppliers/', {
      params: {
        limit: 100,
        is_active: true,
      }
    });
    
    const data = response.data.success ? response.data.data : response.data;
    
    return data.items.map((supplier: any) => ({
      id: supplier.id,
      name: supplier.company_name || supplier.display_name,
      contact_info: {
        email: supplier.email,
        phone: supplier.phone,
        contact_person: supplier.contact_person,
      },
    }));
  }

  /**
   * Get locations
   */
  async getLocations(): Promise<Array<{ id: string; name: string; type: string }>> {
    const response = await apiClient.get('/api/v1/locations/');
    return response.data.items;
  }
}

export class BatchPurchaseValidationError extends Error {
  public readonly errorData: BatchPurchaseError;

  constructor(errorData: BatchPurchaseError) {
    super(errorData.error_message);
    this.name = 'BatchPurchaseValidationError';
    this.errorData = errorData;
  }

  get validationErrors(): string[] {
    return this.errorData.validation_errors || [];
  }

  get suggestedActions(): string[] {
    return this.errorData.suggested_actions || [];
  }

  get failedAtStep(): string {
    return this.errorData.failed_at_step;
  }
}

// Export singleton instance
export const batchPurchaseAPI = new BatchPurchaseAPI();