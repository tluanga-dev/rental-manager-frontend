import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import { toast } from 'sonner';
import { purchasesApi } from '@/services/api/purchases';
import type {
  Purchase,
  PurchaseReturn,
  PurchaseFormData,
  PurchaseReturnFormData,
  PurchaseFilters,
  PurchaseReturnFilters,
  PurchaseAnalytics,
  PurchaseReturnValidation
} from '@/types/purchases';

// Purchase Management Hook
export function usePurchases(filters?: PurchaseFilters) {
  const [localFilters, setLocalFilters] = useState<PurchaseFilters>(filters || {});

  const {
    data: purchasesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['purchases', localFilters],
    queryFn: () => purchasesApi.getPurchases(localFilters),
    keepPreviousData: true,
  });

  const updateFilters = useCallback((newFilters: Partial<PurchaseFilters>) => {
    setLocalFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setLocalFilters({});
  }, []);

  return {
    purchases: purchasesData?.items || [],
    total: purchasesData?.total || 0,
    skip: purchasesData?.skip || 0,
    limit: purchasesData?.limit || 20,
    isLoading,
    error,
    filters: localFilters,
    updateFilters,
    resetFilters,
    refetch
  };
}

// Single Purchase Hook
export function usePurchase(id: string) {
  return useQuery({
    queryKey: ['purchase', id],
    queryFn: () => purchasesApi.getPurchaseById(id),
    enabled: !!id,
  });
}

// Purchase Creation Hook
export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PurchaseFormData) => purchasesApi.recordPurchase(data),
    onSuccess: (newPurchase) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-analytics'] });
      // toast.success('Purchase recorded successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to record purchase';
      // toast.error(message);
    }
  });
}

// Purchase Returns Management Hook
export function usePurchaseReturns(filters?: PurchaseReturnFilters) {
  const [localFilters, setLocalFilters] = useState<PurchaseReturnFilters>(filters || {});

  const {
    data: returnsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['purchase-returns', localFilters],
    queryFn: () => purchasesApi.getPurchaseReturns(localFilters),
    keepPreviousData: true,
  });

  const updateFilters = useCallback((newFilters: Partial<PurchaseReturnFilters>) => {
    setLocalFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setLocalFilters({});
  }, []);

  return {
    returns: returnsData?.items || [],
    total: returnsData?.total || 0,
    skip: returnsData?.skip || 0,
    limit: returnsData?.limit || 20,
    isLoading,
    error,
    filters: localFilters,
    updateFilters,
    resetFilters,
    refetch
  };
}

// Single Purchase Return Hook
export function usePurchaseReturn(id: string) {
  return useQuery({
    queryKey: ['purchase-return', id],
    queryFn: () => purchasesApi.getPurchaseReturnById(id),
    enabled: !!id,
  });
}

// Purchase Return Creation Hook
export function useCreatePurchaseReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PurchaseReturnFormData) => purchasesApi.recordPurchaseReturn(data),
    onSuccess: (newReturn) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-returns'] });
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-analytics'] });
      // toast.success('Purchase return recorded successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to record purchase return';
      // toast.error(message);
    }
  });
}

// Purchase Return Validation Hook
export function usePurchaseReturnValidation() {
  return useMutation({
    mutationFn: ({ originalPurchaseId, items }: { 
      originalPurchaseId: string; 
      items: PurchaseReturnFormData['items'] 
    }) => purchasesApi.validatePurchaseReturn(originalPurchaseId, items),
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to validate return';
      // toast.error(message);
    }
  });
}

// Purchase Analytics Hook
export function usePurchaseAnalytics(params?: {
  start_date?: string;
  end_date?: string;
  supplier_id?: string;
}) {
  return useQuery({
    queryKey: ['purchase-analytics', params],
    queryFn: () => purchasesApi.getPurchaseAnalytics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Purchase Search Hook
export function usePurchaseSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Purchase[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchPurchases = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const searchResults = await purchasesApi.searchPurchases(query);
      setResults(searchResults);
    } catch (error) {
      console.error('Purchase search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchPurchases(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, searchPurchases]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    isSearching,
    searchPurchases
  };
}

// Purchases by Supplier Hook
export function usePurchasesBySupplier(supplierId: string, params?: {
  skip?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
}) {
  return useQuery({
    queryKey: ['purchases-by-supplier', supplierId, params],
    queryFn: () => purchasesApi.getPurchasesBySupplier(supplierId, params),
    enabled: !!supplierId,
  });
}

// Purchase Returns by Purchase Hook
export function usePurchaseReturnsByPurchase(purchaseId: string) {
  return useQuery({
    queryKey: ['purchase-returns-by-purchase', purchaseId],
    queryFn: () => purchasesApi.getPurchaseReturnsByPurchase(purchaseId),
    enabled: !!purchaseId,
  });
}