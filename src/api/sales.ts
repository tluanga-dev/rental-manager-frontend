import axios from '@/lib/axios';
import { TransactionHeader, CreateSaleRequest, TransactionHistoryParams, PaymentRequest, TransactionDailySummary, TransactionRevenueSummary } from '@/types/api';

const API_BASE = '/api/v1/transactions';

export const salesApi = {
  createSale: async (data: CreateSaleRequest): Promise<TransactionHeader> => {
    const response = await axios.post(`${API_BASE}/sales`, data);
    return response.data;
  },

  getTransaction: async (transactionId: string): Promise<TransactionHeader> => {
    const response = await axios.get(`${API_BASE}/${transactionId}`);
    return response.data;
  },

  getTransactionByNumber: async (transactionNumber: string): Promise<TransactionHeader> => {
    const response = await axios.get(`${API_BASE}/number/${transactionNumber}`);
    return response.data;
  },

  listTransactions: async (params?: TransactionHistoryParams): Promise<{ items: TransactionHeader[]; total: number; page: number; size: number }> => {
    const response = await axios.get(API_BASE, { params });
    return response.data;
  },

  processPayment: async (transactionId: string, data: PaymentRequest): Promise<TransactionHeader> => {
    const response = await axios.post(`${API_BASE}/${transactionId}/payment`, data);
    return response.data;
  },

  processRefund: async (transactionId: string, data: PaymentRequest): Promise<TransactionHeader> => {
    const response = await axios.post(`${API_BASE}/${transactionId}/refund`, data);
    return response.data;
  },

  cancelTransaction: async (transactionId: string, reason: string): Promise<TransactionHeader> => {
    const response = await axios.post(`${API_BASE}/${transactionId}/cancel`, { reason });
    return response.data;
  },

  updateTransaction: async (transactionId: string, data: Partial<TransactionHeader>): Promise<TransactionHeader> => {
    const response = await axios.patch(`${API_BASE}/${transactionId}`, data);
    return response.data;
  },

  deleteTransaction: async (transactionId: string): Promise<void> => {
    await axios.delete(`${API_BASE}/${transactionId}`);
  },

  getCustomerHistory: async (customerId: string, params?: TransactionHistoryParams): Promise<{ items: TransactionHeader[]; total: number; page: number; size: number }> => {
    const response = await axios.get(`${API_BASE}/customer/${customerId}/history`, { params });
    return response.data;
  },

  getCustomerSummary: async (customerId: string): Promise<any> => {
    const response = await axios.get(`${API_BASE}/customer/${customerId}/summary`);
    return response.data;
  },

  getDailySummary: async (date: string): Promise<TransactionDailySummary> => {
    const response = await axios.get(`${API_BASE}/reports/daily`, { params: { date } });
    return response.data;
  },

  getRevenueSummary: async (startDate: string, endDate: string, groupBy: 'day' | 'week' | 'month' = 'day'): Promise<TransactionRevenueSummary[]> => {
    const response = await axios.get(`${API_BASE}/reports/revenue`, {
      params: { start_date: startDate, end_date: endDate, group_by: groupBy }
    });
    return response.data;
  },
};