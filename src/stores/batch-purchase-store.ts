import React from 'react';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { produce } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import type {
  BatchPurchaseFormState,
  BatchPurchaseItem,
  ValidationResults,
  BatchPurchaseResponse,
  SKUDetails,
} from '@/types/batch-purchase';
import { BatchPurchaseFormSchema } from '@/types/batch-purchase';
import { batchPurchaseAPI, BatchPurchaseValidationError } from '@/services/batch-purchase-api';

interface BatchPurchaseStore extends BatchPurchaseFormState {
  // Actions
  setSupplier: (supplierId: string) => void;
  setLocation: (locationId: string) => void;
  setPurchaseDate: (date: string) => void;
  setInvoiceNumber: (invoiceNumber: string) => void;
  setInvoiceDate: (date: string) => void;
  setTaxRate: (rate: number) => void;
  setNotes: (notes: string) => void;
  
  // Item actions
  addItem: (type: 'existing' | 'new') => void;
  removeItem: (itemId: string) => void;
  updateItem: (itemId: string, updates: Partial<BatchPurchaseItem>) => void;
  setItemSKU: (itemId: string, skuId: string, skuDetails: SKUDetails) => void;
  
  // Wizard actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  canGoToStep: (step: number) => boolean;
  
  // Validation actions
  validateCurrentStep: () => Promise<boolean>;
  validateForm: () => Promise<ValidationResults>;
  
  // Submission actions
  submitPurchase: () => Promise<BatchPurchaseResponse>;
  
  // Auto-save actions
  autoSave: () => Promise<void>;
  loadDraft: () => void;
  clearDraft: () => void;
  
  // Utility actions
  reset: () => void;
  getTotalAmount: () => number;
  getItemsCount: () => number;
}

const initialState: BatchPurchaseFormState = {
  // Purchase details
  supplier_id: '',
  location_id: '',
  purchase_date: new Date().toISOString().split('T')[0],
  invoice_number: '',
  invoice_date: '',
  tax_rate: 0,
  notes: '',
  
  // Items
  items: [],
  
  // Workflow options
  auto_generate_codes: true,
  
  // Workflow state
  current_step: 1,
  validation_results: null,
  is_validating: false,
  is_submitting: false,
  
  // Auto-save state
  last_saved: null,
  has_unsaved_changes: false,
  save_status: 'idle',
};

export const useBatchPurchaseStore = create<BatchPurchaseStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Purchase details actions
        setSupplier: (supplierId: string) => {
          set(produce((state) => {
            state.supplier_id = supplierId;
            state.has_unsaved_changes = true;
          }));
        },

        setLocation: (locationId: string) => {
          set(produce((state) => {
            state.location_id = locationId;
            state.has_unsaved_changes = true;
          }));
        },

        setPurchaseDate: (date: string) => {
          set(produce((state) => {
            state.purchase_date = date;
            state.has_unsaved_changes = true;
          }));
        },

        setInvoiceNumber: (invoiceNumber: string) => {
          set(produce((state) => {
            state.invoice_number = invoiceNumber;
            state.has_unsaved_changes = true;
          }));
        },

        setInvoiceDate: (date: string) => {
          set(produce((state) => {
            state.invoice_date = date;
            state.has_unsaved_changes = true;
          }));
        },

        setTaxRate: (rate: number) => {
          set(produce((state) => {
            state.tax_rate = rate;
            state.has_unsaved_changes = true;
          }));
        },

        setNotes: (notes: string) => {
          set(produce((state) => {
            state.notes = notes;
            state.has_unsaved_changes = true;
          }));
        },

        // Item actions
        addItem: (type: 'existing' | 'new') => {
          set(produce((state) => {
            const newItem: BatchPurchaseItem = {
              id: uuidv4(),
              type,
              quantity: 1,
              unit_cost: 0,
              serial_numbers: [],
              condition_notes: '',
              notes: '',
            };

            if (type === 'new') {
              newItem.new_item_master = {
                item_code: '',
                item_name: '',
                category_id: '',
                brand_id: '',
                description: '',
                is_serialized: false,
              };
              newItem.new_sku = {
                sku_code: '',
                sku_name: '',
                barcode: '',
                model_number: '',
                is_rentable: false,
                is_saleable: true,
                min_rental_days: 1,
              };
            }

            state.items.push(newItem);
            state.has_unsaved_changes = true;
          }));
        },

        removeItem: (itemId: string) => {
          set(produce((state) => {
            state.items = state.items.filter(item => item.id !== itemId);
            state.has_unsaved_changes = true;
          }));
        },

        updateItem: (itemId: string, updates: Partial<BatchPurchaseItem>) => {
          set(produce((state) => {
            const itemIndex = state.items.findIndex(item => item.id === itemId);
            if (itemIndex !== -1) {
              Object.assign(state.items[itemIndex], updates);
              state.has_unsaved_changes = true;
            }
          }));
        },

        setItemSKU: (itemId: string, skuId: string, skuDetails: SKUDetails) => {
          set(produce((state) => {
            const itemIndex = state.items.findIndex(item => item.id === itemId);
            if (itemIndex !== -1) {
              const item = state.items[itemIndex];
              item.type = 'existing';
              item.sku_id = skuId;
              item.new_item_master = undefined;
              item.new_sku = undefined;
              
              // Auto-populate unit cost from SKU details
              if (skuDetails.sale_base_price && item.unit_cost === 0) {
                item.unit_cost = skuDetails.sale_base_price;
              }
              
              state.has_unsaved_changes = true;
            }
          }));
        },

        // Wizard actions
        setCurrentStep: (step: number) => {
          set(produce((state) => {
            state.current_step = step;
          }));
        },

        nextStep: () => {
          const { current_step } = get();
          if (current_step < 4) {
            set(produce((state) => {
              state.current_step = current_step + 1;
            }));
          }
        },

        previousStep: () => {
          const { current_step } = get();
          if (current_step > 1) {
            set(produce((state) => {
              state.current_step = current_step - 1;
            }));
          }
        },

        canGoToStep: (step: number) => {
          const state = get();
          
          // Can always go backwards
          if (step <= state.current_step) {
            return true;
          }
          
          // Check if required fields for previous steps are filled
          if (step >= 2 && (!state.supplier_id || !state.location_id || !state.purchase_date)) {
            return false;
          }
          
          if (step >= 3 && state.items.length === 0) {
            return false;
          }
          
          if (step >= 4) {
            // Check if all items have required fields
            const hasInvalidItems = state.items.some(item => {
              if (item.type === 'existing' && !item.sku_id) return true;
              if (item.type === 'new' && (!item.new_item_master?.item_name || !item.new_sku?.sku_name)) return true;
              if (item.quantity <= 0 || item.unit_cost < 0) return true;
              return false;
            });
            
            if (hasInvalidItems) return false;
          }
          
          return true;
        },

        // Validation actions
        validateCurrentStep: async () => {
          const state = get();
          
          try {
            set(produce((draft) => {
              draft.is_validating = true;
            }));

            // Step-specific validation
            switch (state.current_step) {
              case 1:
                // Validate purchase details
                const purchaseDetailsSchema = BatchPurchaseFormSchema.pick({
                  supplier_id: true,
                  location_id: true,
                  purchase_date: true,
                  tax_rate: true,
                });
                purchaseDetailsSchema.parse(state);
                break;
                
              case 2:
                // Validate items structure
                if (state.items.length === 0) {
                  throw new Error('At least one item is required');
                }
                break;
                
              case 3:
                // Validate item details
                const itemDetailsSchema = BatchPurchaseFormSchema.pick({
                  items: true,
                });
                itemDetailsSchema.parse(state);
                break;
                
              case 4:
                // Full form validation
                BatchPurchaseFormSchema.parse(state);
                break;
            }

            return true;
          } catch (error) {
            console.error('Step validation failed:', error);
            return false;
          } finally {
            set(produce((draft) => {
              draft.is_validating = false;
            }));
          }
        },

        validateForm: async () => {
          const state = get();
          
          try {
            set(produce((draft) => {
              draft.is_validating = true;
            }));

            // Client-side validation first
            BatchPurchaseFormSchema.parse(state);

            // Server-side validation
            const request = {
              supplier_id: state.supplier_id,
              location_id: state.location_id,
              purchase_date: state.purchase_date,
              invoice_number: state.invoice_number || undefined,
              invoice_date: state.invoice_date || undefined,
              tax_rate: state.tax_rate,
              notes: state.notes || undefined,
              items: state.items.map(item => ({
                sku_id: item.sku_id,
                new_item_master: item.new_item_master,
                new_sku: item.new_sku,
                quantity: item.quantity,
                unit_cost: item.unit_cost,
                serial_numbers: item.serial_numbers,
                condition_notes: item.condition_notes || undefined,
                notes: item.notes || undefined,
              })),
              auto_generate_codes: state.auto_generate_codes,
              validate_only: true,
            };

            const validationResults = await batchPurchaseAPI.validateBatchPurchase(request);

            set(produce((draft) => {
              draft.validation_results = validationResults;
            }));

            return validationResults;
          } catch (error) {
            if (error instanceof BatchPurchaseValidationError) {
              const validationResults: ValidationResults = {
                is_valid: false,
                validation_errors: error.validationErrors,
                warnings: [],
                items_to_create: 0,
                skus_to_create: 0,
                existing_skus: 0,
                generated_item_codes: [],
                generated_sku_codes: [],
              };

              set(produce((draft) => {
                draft.validation_results = validationResults;
              }));

              return validationResults;
            }
            throw error;
          } finally {
            set(produce((draft) => {
              draft.is_validating = false;
            }));
          }
        },

        // Submission actions
        submitPurchase: async () => {
          const state = get();
          
          try {
            set(produce((draft) => {
              draft.is_submitting = true;
            }));

            const request = {
              supplier_id: state.supplier_id,
              location_id: state.location_id,
              purchase_date: state.purchase_date,
              invoice_number: state.invoice_number || undefined,
              invoice_date: state.invoice_date || undefined,
              tax_rate: state.tax_rate,
              notes: state.notes || undefined,
              items: state.items.map(item => ({
                sku_id: item.sku_id,
                new_item_master: item.new_item_master,
                new_sku: item.new_sku,
                quantity: item.quantity,
                unit_cost: item.unit_cost,
                serial_numbers: item.serial_numbers,
                condition_notes: item.condition_notes || undefined,
                notes: item.notes || undefined,
              })),
              auto_generate_codes: state.auto_generate_codes,
              validate_only: false,
            };

            const response = await batchPurchaseAPI.createBatchPurchase(request);
            
            // Clear the form after successful submission
            get().reset();
            get().clearDraft();

            return response;
          } finally {
            set(produce((draft) => {
              draft.is_submitting = false;
            }));
          }
        },

        // Auto-save actions
        autoSave: async () => {
          const state = get();
          
          if (!state.has_unsaved_changes) {
            return;
          }

          try {
            set(produce((draft) => {
              draft.save_status = 'saving';
            }));

            // Save to localStorage (in a real app, this would be an API call)
            localStorage.setItem('batch-purchase-draft', JSON.stringify(state));

            set(produce((draft) => {
              draft.save_status = 'saved';
              draft.has_unsaved_changes = false;
              draft.last_saved = new Date();
            }));

            // Reset save status after 2 seconds
            setTimeout(() => {
              set(produce((draft) => {
                draft.save_status = 'idle';
              }));
            }, 2000);
          } catch (error) {
            set(produce((draft) => {
              draft.save_status = 'error';
            }));
          }
        },

        loadDraft: () => {
          try {
            const draft = localStorage.getItem('batch-purchase-draft');
            if (draft) {
              const draftData = JSON.parse(draft);
              set(draftData);
            }
          } catch (error) {
            console.error('Failed to load draft:', error);
          }
        },

        clearDraft: () => {
          localStorage.removeItem('batch-purchase-draft');
        },

        // Utility actions
        reset: () => {
          set(initialState);
        },

        getTotalAmount: () => {
          const { items, tax_rate } = get();
          const subtotal = items.reduce((total, item) => total + (item.quantity * item.unit_cost), 0);
          const tax = subtotal * (tax_rate / 100);
          return subtotal + tax;
        },

        getItemsCount: () => {
          const { items } = get();
          return items.length;
        },
      }),
      {
        name: 'batch-purchase-store',
        partialize: (state) => ({
          // Only persist the form data, not the UI state
          supplier_id: state.supplier_id,
          location_id: state.location_id,
          purchase_date: state.purchase_date,
          invoice_number: state.invoice_number,
          invoice_date: state.invoice_date,
          tax_rate: state.tax_rate,
          notes: state.notes,
          items: state.items,
          auto_generate_codes: state.auto_generate_codes,
        }),
      }
    ),
    {
      name: 'batch-purchase-store',
    }
  )
);

// Auto-save hook
export const useAutoSave = () => {
  const autoSave = useBatchPurchaseStore(state => state.autoSave);
  const hasUnsavedChanges = useBatchPurchaseStore(state => state.has_unsaved_changes);

  // Auto-save every 30 seconds if there are unsaved changes
  React.useEffect(() => {
    if (!hasUnsavedChanges) return;

    const interval = setInterval(() => {
      autoSave();
    }, 30000);

    return () => clearInterval(interval);
  }, [hasUnsavedChanges, autoSave]);

  // Auto-save on page unload
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasUnsavedChanges) {
        autoSave();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, autoSave]);
};