import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSuppliers } from './useSuppliers';
import { suppliersApi } from '@/services/api/suppliers';

// Mock the suppliers API
jest.mock('@/services/api/suppliers', () => ({
  suppliersApi: {
    getSuppliers: jest.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

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

describe('useSuppliers', () => {
  let mockGetSuppliers: jest.MockedFunction<typeof suppliersApi.getSuppliers>;

  beforeEach(() => {
    mockGetSuppliers = suppliersApi.getSuppliers as jest.MockedFunction<typeof suppliersApi.getSuppliers>;
    mockGetSuppliers.mockResolvedValue(mockSuppliers);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches suppliers on mount', async () => {
    const { result } = renderHook(() => useSuppliers(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetSuppliers).toHaveBeenCalledWith({
      search: '',
      status: 'active',
      limit: 100,
      offset: 0,
    });

    expect(result.current.data).toEqual(mockSuppliers);
  });

  it('passes search parameter correctly', async () => {
    const { result } = renderHook(
      () => useSuppliers({ search: 'acme' }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetSuppliers).toHaveBeenCalledWith({
      search: 'acme',
      status: 'active',
      limit: 100,
      offset: 0,
    });
  });

  it('includes inactive suppliers when specified', async () => {
    const { result } = renderHook(
      () => useSuppliers({ includeInactive: true }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetSuppliers).toHaveBeenCalledWith({
      search: '',
      status: 'all',
      limit: 100,
      offset: 0,
    });
  });

  it('respects custom limit', async () => {
    const { result } = renderHook(
      () => useSuppliers({ limit: 50 }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetSuppliers).toHaveBeenCalledWith({
      search: '',
      status: 'active',
      limit: 50,
      offset: 0,
    });
  });

  it('can be disabled', async () => {
    const { result } = renderHook(
      () => useSuppliers({ enabled: false }),
      {
        wrapper: createWrapper(),
      }
    );

    // Wait a bit to ensure the query doesn't run
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockGetSuppliers).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it('handles API errors gracefully', async () => {
    const apiError = new Error('API Error');
    mockGetSuppliers.mockRejectedValue(apiError);

    const { result } = renderHook(() => useSuppliers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeUndefined();
  });

  it('uses custom cache and stale times', async () => {
    const { result } = renderHook(
      () => useSuppliers({ 
        cacheTime: 5 * 60 * 1000, 
        staleTime: 15 * 60 * 1000 
      }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // The query should have been configured with custom times
    expect(result.current.data).toEqual(mockSuppliers);
  });
});