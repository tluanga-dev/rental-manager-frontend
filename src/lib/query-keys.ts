import { SupplierQueryParams } from '@/components/suppliers/SupplierDropdown/SupplierDropdown.types';
import { CustomerQueryParams } from '@/types/customer';

export const supplierKeys = {
  all: ['suppliers'] as const,
  lists: () => [...supplierKeys.all, 'list'] as const,
  list: (params?: SupplierQueryParams) => 
    [...supplierKeys.lists(), params] as const,
  search: (term: string) => 
    [...supplierKeys.all, 'search', term] as const,
  detail: (id: string) => 
    [...supplierKeys.all, 'detail', id] as const,
};

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (params?: CustomerQueryParams) => 
    [...customerKeys.lists(), params] as const,
  search: (term: string) => 
    [...customerKeys.all, 'search', term] as const,
  detail: (id: string) => 
    [...customerKeys.all, 'detail', id] as const,
};

export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (params?: any) => [...transactionKeys.lists(), params] as const,
  detail: (id: string) => [...transactionKeys.all, 'detail', id] as const,
};

export const purchaseKeys = {
  all: ['purchases'] as const,
  lists: () => [...purchaseKeys.all, 'list'] as const,
  list: (params?: any) => [...purchaseKeys.lists(), params] as const,
  detail: (id: string) => [...purchaseKeys.all, 'detail', id] as const,
  batch: () => [...purchaseKeys.all, 'batch'] as const,
};

export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (params?: any) => [...inventoryKeys.lists(), params] as const,
  detail: (id: string) => [...inventoryKeys.all, 'detail', id] as const,
  sku: (sku: string) => [...inventoryKeys.all, 'sku', sku] as const,
};