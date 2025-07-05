import { useQuery } from '@tanstack/react-query';
import { customerKeys } from '@/lib/query-keys';
import { customersApi } from '@/services/api/customers';
import { transformCustomerResponse, generateMockCustomers } from '@/utils/customer-utils';
import type { CustomerQueryParams } from '@/types/customer';

export interface UseCustomerOptions {
  search?: string;
  customerType?: 'INDIVIDUAL' | 'BUSINESS' | 'all';
  customerTier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  blacklistStatus?: 'CLEAR' | 'BLACKLISTED' | 'all';
  includeInactive?: boolean;
  limit?: number;
  enabled?: boolean;
  cacheTime?: number;
  staleTime?: number;
}

export function useCustomers(options: UseCustomerOptions = {}) {
  const {
    search = '',
    customerType = 'all',
    customerTier,
    blacklistStatus = 'all',
    includeInactive = false,
    limit = 100,
    enabled = true,
    cacheTime = 2 * 60 * 1000,      // 2 minutes
    staleTime = 10 * 60 * 1000,     // 10 minutes
  } = options;

  const queryParams: CustomerQueryParams = {
    search,
    customer_type: customerType === 'all' ? undefined : customerType,
    customer_tier: customerTier,
    blacklist_status: blacklistStatus === 'all' ? undefined : blacklistStatus,
    status: includeInactive ? 'all' : 'active',
    limit,
    sortBy: 'name',
    sortOrder: 'asc',
  };

  return useQuery({
    queryKey: customerKeys.list(queryParams),
    queryFn: async () => {
      try {
        // Use the customers API to get customer data
        const response = await customersApi.list({
          search,
          customer_type: customerType === 'all' ? undefined : customerType,
          customer_tier: customerTier,
          blacklist_status: blacklistStatus === 'all' ? undefined : blacklistStatus,
          is_active: includeInactive ? undefined : true,
          limit,
          skip: 0,
        });

        return {
          customers: response.items.map(transformCustomerResponse),
          total: response.total,
        };
      } catch (error) {
        // Fallback to mock data when API is not available
        console.warn('Customers API not available, using mock data:', error);
        
        const mockCustomers = generateMockCustomers(20);
        let filteredCustomers = mockCustomers;

        // Apply filters to mock data
        if (search) {
          const lowerSearch = search.toLowerCase();
          filteredCustomers = filteredCustomers.filter(customer =>
            customer.name.toLowerCase().includes(lowerSearch) ||
            customer.code.toLowerCase().includes(lowerSearch)
          );
        }

        if (customerType !== 'all') {
          filteredCustomers = filteredCustomers.filter(customer => customer.type === customerType);
        }

        if (customerTier) {
          filteredCustomers = filteredCustomers.filter(customer => customer.tier === customerTier);
        }

        if (blacklistStatus !== 'all') {
          filteredCustomers = filteredCustomers.filter(customer => customer.blacklist_status === blacklistStatus);
        }

        if (!includeInactive) {
          filteredCustomers = filteredCustomers.filter(customer => customer.status === 'active');
        }

        return {
          customers: filteredCustomers.slice(0, limit),
          total: filteredCustomers.length,
        };
      }
    },
    enabled,
    gcTime: cacheTime,
    staleTime,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}