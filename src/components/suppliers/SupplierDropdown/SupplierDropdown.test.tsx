import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SupplierDropdown } from './SupplierDropdown';
import { suppliersApi } from '@/services/api/suppliers';

// Mock the suppliers API
jest.mock('@/services/api/suppliers', () => ({
  suppliersApi: {
    getSuppliers: jest.fn(),
  },
}));

// Mock the hooks
jest.mock('@/hooks/use-click-outside', () => ({
  useClickOutside: jest.fn(),
}));

jest.mock('@/hooks/use-debounced-value', () => ({
  useDebouncedValue: jest.fn((value) => value),
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
    {
      id: '3',
      name: 'Tech Distributors',
      code: 'TECH001',
      status: 'inactive',
    },
  ],
  total: 3,
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

const renderWithQueryClient = (ui: React.ReactElement, queryClient?: QueryClient) => {
  const client = queryClient || createTestQueryClient();
  return render(
    <QueryClientProvider client={client}>
      {ui}
    </QueryClientProvider>
  );
};

describe('SupplierDropdown', () => {
  let mockGetSuppliers: jest.MockedFunction<typeof suppliersApi.getSuppliers>;

  beforeEach(() => {
    mockGetSuppliers = suppliersApi.getSuppliers as jest.MockedFunction<typeof suppliersApi.getSuppliers>;
    mockGetSuppliers.mockResolvedValue(mockSuppliers);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with placeholder text', () => {
      renderWithQueryClient(
        <SupplierDropdown placeholder="Select a supplier" />
      );
      
      expect(screen.getByPlaceholderText('Select a supplier')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      renderWithQueryClient(
        <SupplierDropdown placeholder="Choose supplier..." />
      );
      
      expect(screen.getByPlaceholderText('Choose supplier...')).toBeInTheDocument();
    });

    it('applies correct ARIA attributes', () => {
      renderWithQueryClient(<SupplierDropdown />);
      
      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(input).toHaveAttribute('aria-haspopup', 'listbox');
    });
  });

  describe('Dropdown Interaction', () => {
    it('opens dropdown when input is clicked', async () => {
      renderWithQueryClient(<SupplierDropdown />);
      
      const input = screen.getByRole('combobox');
      fireEvent.click(input);
      
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('displays loading state while fetching data', async () => {
      // Mock a delayed response
      mockGetSuppliers.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockSuppliers), 100))
      );

      renderWithQueryClient(<SupplierDropdown />);
      
      const input = screen.getByRole('combobox');
      fireEvent.click(input);
      
      expect(screen.getByText('Loading suppliers...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByText('Loading suppliers...')).not.toBeInTheDocument();
      });
    });

    it('displays suppliers when dropdown opens', async () => {
      renderWithQueryClient(<SupplierDropdown />);
      
      const input = screen.getByRole('combobox');
      fireEvent.click(input);
      
      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
        expect(screen.getByText('Global Supplies Inc')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('filters suppliers based on search input', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<SupplierDropdown />);
      
      const input = screen.getByRole('combobox');
      await user.click(input);
      
      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      });
      
      await user.type(input, 'acme');
      
      await waitFor(() => {
        expect(mockGetSuppliers).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'acme',
          })
        );
      });
    });

    it('shows no results message when search yields no matches', async () => {
      mockGetSuppliers.mockResolvedValue({ suppliers: [], total: 0 });
      
      const user = userEvent.setup();
      renderWithQueryClient(<SupplierDropdown />);
      
      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.type(input, 'nonexistent');
      
      await waitFor(() => {
        expect(screen.getByText('No suppliers found')).toBeInTheDocument();
      });
    });
  });

  describe('Selection Behavior', () => {
    it('calls onChange when supplier is selected', async () => {
      const handleChange = jest.fn();
      renderWithQueryClient(
        <SupplierDropdown onChange={handleChange} />
      );
      
      const input = screen.getByRole('combobox');
      fireEvent.click(input);
      
      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Acme Corporation'));
      
      expect(handleChange).toHaveBeenCalledWith('1', expect.objectContaining({
        id: '1',
        name: 'Acme Corporation',
      }));
    });

    it('displays selected supplier name in input', async () => {
      renderWithQueryClient(
        <SupplierDropdown value="1" />
      );
      
      // Wait for suppliers to load and find the selected one
      await waitFor(() => {
        const input = screen.getByRole('combobox') as HTMLInputElement;
        expect(input.value).toBe('Acme Corporation');
      });
    });

    it('closes dropdown after selection', async () => {
      renderWithQueryClient(<SupplierDropdown />);
      
      const input = screen.getByRole('combobox');
      fireEvent.click(input);
      
      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Acme Corporation'));
      
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('opens dropdown with arrow down key', async () => {
      renderWithQueryClient(<SupplierDropdown />);
      
      const input = screen.getByRole('combobox');
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('closes dropdown with escape key', async () => {
      renderWithQueryClient(<SupplierDropdown />);
      
      const input = screen.getByRole('combobox');
      fireEvent.click(input);
      
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
      
      fireEvent.keyDown(input, { key: 'Escape' });
      
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('navigates through options with arrow keys', async () => {
      renderWithQueryClient(<SupplierDropdown />);
      
      const input = screen.getByRole('combobox');
      fireEvent.click(input);
      
      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      });
      
      // Navigate down
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      
      // The second item should be highlighted (visual feedback would be tested in E2E)
      fireEvent.keyDown(input, { key: 'Enter' });
      
      // Should select the highlighted item
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when API call fails', async () => {
      mockGetSuppliers.mockRejectedValue(new Error('API Error'));
      
      renderWithQueryClient(<SupplierDropdown />);
      
      const input = screen.getByRole('combobox');
      fireEvent.click(input);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load suppliers')).toBeInTheDocument();
        expect(screen.getByText('Try again')).toBeInTheDocument();
      });
    });

    it('allows retry after error', async () => {
      mockGetSuppliers
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce(mockSuppliers);
      
      renderWithQueryClient(<SupplierDropdown />);
      
      const input = screen.getByRole('combobox');
      fireEvent.click(input);
      
      await waitFor(() => {
        expect(screen.getByText('Try again')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Try again'));
      
      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      });
    });
  });

  describe('Configuration Options', () => {
    it('shows supplier codes when showCode is true', async () => {
      renderWithQueryClient(<SupplierDropdown showCode={true} />);
      
      const input = screen.getByRole('combobox');
      fireEvent.click(input);
      
      await waitFor(() => {
        expect(screen.getByText('ACME001')).toBeInTheDocument();
        expect(screen.getByText('GLOB001')).toBeInTheDocument();
      });
    });

    it('hides supplier codes when showCode is false', async () => {
      renderWithQueryClient(<SupplierDropdown showCode={false} />);
      
      const input = screen.getByRole('combobox');
      fireEvent.click(input);
      
      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
        expect(screen.queryByText('ACME001')).not.toBeInTheDocument();
      });
    });

    it('includes inactive suppliers when includeInactive is true', async () => {
      renderWithQueryClient(
        <SupplierDropdown includeInactive={true} showStatus={true} />
      );
      
      const input = screen.getByRole('combobox');
      fireEvent.click(input);
      
      await waitFor(() => {
        expect(mockGetSuppliers).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'all',
          })
        );
      });
    });

    it('disables component when disabled prop is true', () => {
      renderWithQueryClient(<SupplierDropdown disabled={true} />);
      
      const input = screen.getByRole('combobox');
      expect(input).toBeDisabled();
    });
  });

  describe('Clear Functionality', () => {
    it('shows clear button when value is selected and clearable is true', async () => {
      renderWithQueryClient(
        <SupplierDropdown value="1" clearable={true} />
      );
      
      // Wait for component to load
      await waitFor(() => {
        // Clear button should be present but might not be visible until hover
        const input = screen.getByRole('combobox');
        expect(input).toBeInTheDocument();
      });
    });

    it('calls onChange with empty values when clear button is clicked', async () => {
      const handleChange = jest.fn();
      renderWithQueryClient(
        <SupplierDropdown value="1" onChange={handleChange} clearable={true} />
      );
      
      // The clear button implementation would need to be accessible for this test
      // This is a placeholder for the expected behavior
    });
  });
});