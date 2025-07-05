# Batch Purchase UX Specification

## Overview

The batch purchase feature provides a streamlined wizard interface for creating purchases with embedded item master and SKU creation. This eliminates the need for users to create items and SKUs separately before recording purchases.

## Workflow Design

### 4-Step Wizard Flow

#### Step 1: Purchase Details
**Purpose:** Capture basic purchase information
**Fields:**
- Supplier selection (searchable dropdown)
- Location selection (dropdown)
- Purchase date (date picker)
- Invoice number (optional text)
- Invoice date (optional date picker)
- Tax rate (percentage input with presets)
- Notes (textarea)

**Validation:**
- Supplier must be a business customer
- Purchase date cannot be in the future
- Tax rate must be between 0-100%

**Auto-save:** Every 30 seconds or on field blur

#### Step 2: Item Management
**Purpose:** Add items with optional new item master/SKU creation
**Interface:** Dynamic item list with add/remove functionality

**Per Item:**
- **Option A: Existing SKU**
  - SKU search/selection (searchable dropdown with SKU code, name, item name)
  - Auto-populate item details from selected SKU
  
- **Option B: Create New Item & SKU**
  - Item Master section (collapsible)
    - Item code (auto-generated if empty, editable)
    - Item name (required)
    - Category selection (hierarchical dropdown)
    - Brand selection (optional dropdown)
    - Description (textarea)
    - Serialized toggle
  
  - SKU Details section
    - SKU code (auto-generated if empty, editable)
    - SKU name (required)
    - Barcode (optional)
    - Model number (optional)
    - Physical specifications (weight, dimensions)
    - Rental settings (toggle, pricing, min/max days)
    - Sale settings (toggle, pricing)

**Interaction Patterns:**
- Toggle between "Select Existing SKU" and "Create New Item & SKU"
- Real-time validation with visual feedback
- Auto-generation of codes with preview
- Duplicate detection with warnings

#### Step 3: Purchase Items
**Purpose:** Specify quantities, costs, and item-specific details
**Interface:** Table view of selected/created items

**Per Item Fields:**
- Quantity (number input with validation)
- Unit cost (currency input)
- Serial numbers (dynamic list for serialized items)
- Condition notes (textarea)
- Item notes (textarea)

**Features:**
- Real-time total calculation
- Bulk edit actions (apply cost to all, etc.)
- Sort and filter capabilities
- Validation indicators

#### Step 4: Review & Submit
**Purpose:** Final review and confirmation
**Interface:** Read-only summary with edit links

**Summary Sections:**
- Purchase details with edit link to Step 1
- Items to be created (item masters, SKUs) with counts
- Purchase line items with totals
- Final validation results

**Actions:**
- Submit purchase (primary action)
- Save as draft (secondary action)
- Go back to edit (secondary action)

## Form State Management

### Unified State Schema
```typescript
interface BatchPurchaseFormState {
  // Step 1: Purchase Details
  supplier_id: string | null;
  location_id: string | null;
  purchase_date: string;
  invoice_number: string;
  invoice_date: string;
  tax_rate: number;
  notes: string;
  
  // Step 2 & 3: Items
  items: BatchPurchaseItem[];
  
  // Workflow state
  current_step: number;
  auto_generate_codes: boolean;
  validation_results: ValidationResults | null;
  is_validating: boolean;
  is_submitting: boolean;
  
  // Auto-save state
  last_saved: Date | null;
  has_unsaved_changes: boolean;
  save_status: 'idle' | 'saving' | 'saved' | 'error';
}

interface BatchPurchaseItem {
  id: string; // Client-side ID for tracking
  type: 'existing' | 'new';
  
  // Existing SKU reference
  sku_id?: string;
  sku_details?: SKUDetails; // Populated from API
  
  // New item master
  new_item_master?: {
    item_code: string;
    item_name: string;
    category_id: string;
    brand_id?: string;
    description?: string;
    is_serialized: boolean;
  };
  
  // New SKU
  new_sku?: {
    sku_code: string;
    sku_name: string;
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
  };
  
  // Purchase line details
  quantity: number;
  unit_cost: number;
  serial_numbers: string[];
  condition_notes: string;
  notes: string;
}
```

### State Persistence
- **Local Storage:** Auto-save every 30 seconds
- **Draft API:** Save complete state to backend for recovery
- **Session Recovery:** Restore state on page reload
- **Cross-tab Sync:** Sync state across browser tabs

## Validation Strategy

### Real-time Validation
- **Field-level:** Validate on blur/change
- **Cross-field:** Validate when dependencies change
- **Form-level:** Validate on step completion
- **Server-side:** Validate before final submission

### Validation UI Patterns
```typescript
interface ValidationState {
  field_errors: Record<string, string[]>;
  form_errors: string[];
  warnings: string[];
  is_valid: boolean;
  is_validating: boolean;
}
```

**Visual Indicators:**
- Red border and icon for errors
- Yellow border and icon for warnings
- Green checkmark for valid fields
- Loading spinner during validation
- Tooltip/popover for detailed messages

### Progressive Validation
1. **Immediate:** Basic format validation (required, type, range)
2. **Debounced:** Cross-field and business logic validation
3. **Server:** Uniqueness and existence validation
4. **Final:** Complete form validation before submission

## User Experience Features

### Auto-generation
- **Smart Defaults:** Generate codes based on item/SKU names
- **Preview:** Show generated codes before committing
- **Manual Override:** Allow users to edit generated codes
- **Conflict Resolution:** Handle duplicate codes gracefully

### Search and Selection
- **Fuzzy Search:** Support partial matches and typos
- **Recent Items:** Show recently used SKUs
- **Favorites:** Allow bookmarking frequently used items
- **Bulk Import:** Support CSV/Excel import for large purchases

### Error Handling
- **Inline Errors:** Show field-specific errors immediately
- **Error Summary:** Collect all errors at form level
- **Recovery:** Provide clear steps to fix errors
- **Retry:** Allow retrying failed operations

### Performance
- **Lazy Loading:** Load data as needed
- **Debounced API Calls:** Prevent excessive requests
- **Optimistic Updates:** Show immediate feedback
- **Progress Indicators:** Show progress for long operations

## Component Architecture

### Wizard Container
```typescript
<BatchPurchaseWizard>
  <WizardStep step={1} title="Purchase Details">
    <PurchaseDetailsForm />
  </WizardStep>
  
  <WizardStep step={2} title="Item Management">
    <ItemManagementForm />
  </WizardStep>
  
  <WizardStep step={3} title="Purchase Items">
    <PurchaseItemsForm />
  </WizardStep>
  
  <WizardStep step={4} title="Review & Submit">
    <ReviewAndSubmitForm />
  </WizardStep>
</BatchPurchaseWizard>
```

### Item Management Components
```typescript
<ItemManagementForm>
  <ItemList>
    {items.map(item => (
      <ItemCard key={item.id}>
        <ItemTypeToggle />
        {item.type === 'existing' ? (
          <ExistingSKUSelector />
        ) : (
          <>
            <ItemMasterForm />
            <SKUForm />
          </>
        )}
      </ItemCard>
    ))}
  </ItemList>
  <AddItemButton />
</ItemManagementForm>
```

### Reusable Components
- `AutoSaveIndicator`: Shows save status
- `ValidationMessage`: Displays validation feedback
- `ProgressBar`: Shows wizard progress
- `ConfirmDialog`: Confirms destructive actions
- `LoadingSpinner`: Shows loading states
- `ErrorBoundary`: Handles component errors

## Accessibility Features

### Keyboard Navigation
- Tab order follows logical flow
- Arrow keys for wizard navigation
- Enter/Space for button activation
- Escape to cancel/close dialogs

### Screen Reader Support
- Proper ARIA labels and descriptions
- Form validation announcements
- Progress announcements
- Error message associations

### Visual Accessibility
- High contrast error indicators
- Focus indicators for all interactive elements
- Sufficient color contrast ratios
- Scalable text and layouts

## Mobile Considerations

### Responsive Design
- Collapsible sections for mobile
- Touch-friendly button sizes
- Simplified navigation for small screens
- Horizontal scrolling for tables

### Progressive Enhancement
- Core functionality works without JavaScript
- Enhanced features require JavaScript
- Offline support for draft saving
- Reduced bandwidth usage

## Testing Strategy

### Unit Tests
- Form validation logic
- State management functions
- Component rendering
- Error handling

### Integration Tests
- Wizard flow end-to-end
- API integration
- Error scenarios
- Auto-save functionality

### E2E Tests
- Complete purchase creation flow
- Error recovery scenarios
- Cross-browser compatibility
- Performance under load

### Accessibility Tests
- Screen reader compatibility
- Keyboard navigation
- Color contrast validation
- Focus management

## Performance Considerations

### Bundle Optimization
- Code splitting by wizard step
- Lazy loading of heavy components
- Tree shaking of unused utilities
- Compression and minification

### Runtime Performance
- Debounced validation calls
- Memoized expensive calculations
- Virtual scrolling for large lists
- Efficient re-rendering strategies

### Network Optimization
- Request deduplication
- Response caching
- Optimistic updates
- Background prefetching