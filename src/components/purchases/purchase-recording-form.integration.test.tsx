import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PurchaseRecordingForm } from './purchase-recording-form';
import { suppliersApi } from '@/services/api/suppliers';
import { skusApi } from '@/services/api/skus';
import { locationsApi } from '@/services/api/locations';

// Mock the APIs
jest.mock('@/services/api/suppliers');
jest.mock('@/services/api/skus');
jest.mock('@/services/api/locations');
jest.mock('@/hooks/use-purchases');

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

const mockSuppliers = {
  suppliers: [
    {
      id: '1',
      name: 'Acme Corporation',
      code: 'ACME001',
      status: 'active',
    },
    {
      id: '2',
      name: 'Global Supplies Inc',
      code: 'GLOB001',
      status: 'active',
    },
  ],
  total: 2,
};

const mockSKUs = {
  items: [
    {
      id: 'sku1',
      sku_code: 'SKU001',
      sku_name: 'Test Product 1',
      sale_base_price: 99.99,
    },
    {
      id: 'sku2',
      sku_code: 'SKU002',
      sku_name: 'Test Product 2',
      sale_base_price: 149.99,
    },
  ],
  total: 2,
};

const mockLocations = [
  {
    id: 'loc1',
    location_name: 'Warehouse A',
    location_code: 'WHA',
    location_type: 'WAREHOUSE',
    is_active: true,
  },
  {
    id: 'loc2',
    location_name: 'Store B',
    location_code: 'STB',
    location_type: 'STORE',
    is_active: true,
  },
];

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('PurchaseRecordingForm Integration', () => {
  beforeEach(() => {
    // Mock API responses
    (suppliersApi.getSuppliers as jest.Mock).mockResolvedValue(mockSuppliers);
    (suppliersApi.list as jest.Mock).mockResolvedValue({ items: [] });
    (skusApi.list as jest.Mock).mockResolvedValue(mockSKUs);
    (locationsApi.list as jest.Mock).mockResolvedValue(mockLocations);

    // Mock the purchase creation hook
    const useCreatePurchase = require('@/hooks/use-purchases').useCreatePurchase;
    useCreatePurchase.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({ id: 'purchase123' }),
      isPending: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders purchase recording form with supplier dropdown', async () => {
    renderWithProviders(<PurchaseRecordingForm />);

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByText('Record Purchase')).toBeInTheDocument();
    });

    // Check that supplier dropdown is present
    expect(screen.getByPlaceholderText('Select supplier')).toBeInTheDocument();
  });

  it('allows supplier selection through the dropdown', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PurchaseRecordingForm />);

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Select supplier')).toBeInTheDocument();
    });

    // Click on supplier dropdown
    const supplierInput = screen.getByPlaceholderText('Select supplier');
    await user.click(supplierInput);

    // Wait for suppliers to load and be displayed
    await waitFor(() => {
      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
    });

    // Select a supplier
    await user.click(screen.getByText('Acme Corporation'));

    // Verify supplier is selected
    await waitFor(() => {
      expect(supplierInput).toHaveValue('Acme Corporation');
    });
  });

  it('integrates supplier dropdown with form validation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PurchaseRecordingForm />);

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByText('Record Purchase')).toBeInTheDocument();
    });

    // Try to submit form without selecting supplier
    const submitButton = screen.getByText('Record Purchase');
    await user.click(submitButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Supplier is required')).toBeInTheDocument();
    });

    // Now select a supplier
    const supplierInput = screen.getByPlaceholderText('Select supplier');
    await user.click(supplierInput);

    await waitFor(() => {
      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Acme Corporation'));

    // Validation error should disappear
    await waitFor(() => {
      expect(screen.queryByText('Supplier is required')).not.toBeInTheDocument();
    });
  });

  it('maintains supplier selection when form is updated', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PurchaseRecordingForm />);

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Select supplier')).toBeInTheDocument();
    });

    // Select a supplier
    const supplierInput = screen.getByPlaceholderText('Select supplier');
    await user.click(supplierInput);

    await waitFor(() => {
      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Acme Corporation'));

    // Update another field (like notes)
    const notesField = screen.getByPlaceholderText('Additional notes about this purchase...');
    await user.type(notesField, 'Test notes');

    // Supplier should still be selected
    await waitFor(() => {
      expect(supplierInput).toHaveValue('Acme Corporation');
    });
  });

  it('shows loading state while options are being loaded', async () => {
    // Mock delayed API responses
    (suppliersApi.getSuppliers as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockSuppliers), 100))
    );

    renderWithProviders(<PurchaseRecordingForm />);

    // Should show loading state initially
    expect(screen.getByText('Loading form options...')).toBeInTheDocument();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading form options...')).not.toBeInTheDocument();
    }, { timeout: 2000 });

    // Form should be loaded
    expect(screen.getByText('Record Purchase')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    (suppliersApi.getSuppliers as jest.Mock).mockRejectedValue(new Error('API Error'));

    renderWithProviders(<PurchaseRecordingForm />);

    // Wait for form to load (even with API error)
    await waitFor(() => {
      expect(screen.getByText('Record Purchase')).toBeInTheDocument();
    });

    // Supplier dropdown should still be present
    expect(screen.getByPlaceholderText('Select supplier')).toBeInTheDocument();
  });

  it('works with form submission flow', async () => {
    const user = userEvent.setup();
    const mockMutateAsync = jest.fn().mockResolvedValue({ id: 'purchase123' });
    
    const useCreatePurchase = require('@/hooks/use-purchases').useCreatePurchase;
    useCreatePurchase.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    renderWithProviders(<PurchaseRecordingForm />);

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Select supplier')).toBeInTheDocument();
    });

    // Fill out the form
    // 1. Select supplier
    const supplierInput = screen.getByPlaceholderText('Select supplier');
    await user.click(supplierInput);

    await waitFor(() => {
      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Acme Corporation'));

    // 2. Fill in purchase date (should be defaulted)
    // 3. Add a note
    const notesField = screen.getByPlaceholderText('Additional notes about this purchase...');
    await user.type(notesField, 'Test purchase');

    // 4. Fill in SKU details (first item should be present by default)
    // Note: This would require more complex mocking of the SKU selector
    
    // Submit the form
    const submitButton = screen.getByText('Record Purchase');
    await user.click(submitButton);

    // Should call the mutation with supplier data
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          supplier_id: '1',
          notes: 'Test purchase',
        })
      );
    });
  });
});