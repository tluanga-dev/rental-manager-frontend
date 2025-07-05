import { apiClient } from '@/lib/api-client';
import { RentalDueTodayListResponse, RentalDueTodaySummary } from '@/types/rentals-due-today';

export interface GetRentalsDueTodayParams {
  location_id?: string;
  include_overdue?: boolean;
  days_ahead?: number;
  skip?: number;
  limit?: number;
}

export interface GetRentalsDueTodaySummaryParams {
  location_id?: string;
}

export const rentalsDueTodayApi = {
  // Get list of rentals due today with pagination and filters
  getRentalsDueToday: async (params: GetRentalsDueTodayParams = {}): Promise<RentalDueTodayListResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params.location_id) searchParams.append('location_id', params.location_id);
    if (params.include_overdue !== undefined) searchParams.append('include_overdue', params.include_overdue.toString());
    if (params.days_ahead !== undefined) searchParams.append('days_ahead', params.days_ahead.toString());
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const url = `/rentals-due-today${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data.data;
  },

  // Get summary statistics for rentals due today
  getRentalsDueTodaySummary: async (params: GetRentalsDueTodaySummaryParams = {}): Promise<RentalDueTodaySummary> => {
    const searchParams = new URLSearchParams();
    
    if (params.location_id) searchParams.append('location_id', params.location_id);

    const queryString = searchParams.toString();
    const url = `/rentals-due-today/summary${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data.data;
  },
};
