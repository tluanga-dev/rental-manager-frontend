import type { CustomerResponse } from '@/services/api/customers';
import type { 
  Customer, 
  CustomerOption,
  CustomerDisplayUtils,
  CustomerSummary 
} from '@/types/customer';
import { 
  CUSTOMER_TIER_COLORS, 
  CUSTOMER_TIER_LABELS, 
  CUSTOMER_TYPE_ICONS,
  CUSTOMER_STATUS_COLORS 
} from '@/components/customers/CustomerDropdown/CustomerDropdown.types';

/**
 * Transform CustomerResponse from API to Customer for dropdown usage
 */
export function transformCustomerResponse(customerResponse: CustomerResponse): Customer {
  return {
    id: customerResponse.id,
    name: getCustomerDisplayName(customerResponse),
    code: customerResponse.customer_code,
    type: customerResponse.customer_type,
    tier: customerResponse.customer_tier,
    status: customerResponse.is_active ? 'active' : 'inactive',
    blacklist_status: customerResponse.blacklist_status,
    credit_limit: customerResponse.credit_limit,
    lifetime_value: customerResponse.lifetime_value,
    last_transaction_date: customerResponse.last_transaction_date,
  };
}

/**
 * Transform Customer to CustomerSummary for form usage
 */
export function transformCustomerToSummary(customer: Customer): CustomerSummary {
  return {
    id: customer.id,
    customer_code: customer.code,
    display_name: customer.name,
    customer_type: customer.type,
    customer_tier: customer.tier,
    blacklist_status: customer.blacklist_status,
    is_active: customer.status === 'active',
    credit_limit: customer.credit_limit || 0,
  };
}

/**
 * Get customer display name with intelligent formatting
 */
export function getCustomerDisplayName(customer: CustomerResponse | Customer): string {
  if ('business_name' in customer) {
    // CustomerResponse
    if (customer.customer_type === 'BUSINESS' && customer.business_name) {
      return customer.business_name;
    }
    if (customer.customer_type === 'INDIVIDUAL') {
      const firstName = customer.first_name || '';
      const lastName = customer.last_name || '';
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
    }
    return customer.customer_code;
  } else {
    // Customer (already transformed)
    return customer.name;
  }
}

/**
 * Get secondary information for customer display
 */
export function getCustomerSecondaryInfo(customer: Customer): string {
  const parts: string[] = [];
  
  // Add customer type icon
  parts.push(CUSTOMER_TYPE_ICONS[customer.type]);
  
  // Add tier
  parts.push(CUSTOMER_TIER_LABELS[customer.tier]);
  
  // Add customer code
  parts.push(customer.code);
  
  // Add status indicators
  if (customer.blacklist_status === 'BLACKLISTED') {
    parts.push('⚠️ Blacklisted');
  }
  
  if (customer.status === 'inactive') {
    parts.push('Inactive');
  }
  
  return parts.join(' • ');
}

/**
 * Get tier color for badges
 */
export function getTierColor(tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'): string {
  return CUSTOMER_TIER_COLORS[tier];
}

/**
 * Get customer type icon
 */
export function getCustomerIcon(type: 'INDIVIDUAL' | 'BUSINESS'): string {
  return CUSTOMER_TYPE_ICONS[type];
}

/**
 * Get warning message for customer if any
 */
export function getCustomerWarningMessage(customer: Customer): string | null {
  const warnings: string[] = [];
  
  if (customer.blacklist_status === 'BLACKLISTED') {
    warnings.push('Customer is blacklisted');
  }
  
  if (customer.status === 'inactive') {
    warnings.push('Customer account is inactive');
  }
  
  // Check credit limit if available
  if (customer.credit_limit !== undefined && customer.credit_limit <= 0) {
    warnings.push('No credit limit available');
  }
  
  return warnings.length > 0 ? warnings.join('. ') : null;
}

/**
 * Format credit information
 */
export function formatCreditInfo(customer: Customer): string {
  if (!customer.credit_limit) {
    return 'No credit limit';
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(customer.credit_limit);
}

/**
 * Format last transaction date
 */
export function formatLastTransaction(date: string | null): string {
  if (!date) {
    return 'No transactions';
  }
  
  const transactionDate = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - transactionDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays <= 7) {
    return `${diffDays} days ago`;
  } else if (diffDays <= 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (diffDays <= 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
}

/**
 * Create CustomerOption for dropdown display
 */
export function createCustomerOption(
  customer: Customer, 
  selectedId?: string, 
  highlightedIndex?: number,
  index?: number
): CustomerOption {
  const hasWarning = getCustomerWarningMessage(customer) !== null;
  
  return {
    customer,
    isSelected: selectedId === customer.id,
    isHighlighted: highlightedIndex === index,
    displayName: customer.name,
    secondaryInfo: getCustomerSecondaryInfo(customer),
    hasWarning,
    warningMessage: getCustomerWarningMessage(customer) || undefined,
    tierColor: getTierColor(customer.tier),
    icon: getCustomerIcon(customer.type),
  };
}

/**
 * Filter customers based on search term
 */
export function filterCustomers(customers: Customer[], searchTerm: string): Customer[] {
  if (!searchTerm) {
    return customers;
  }
  
  const lowerSearch = searchTerm.toLowerCase();
  
  return customers.filter(customer => 
    customer.name.toLowerCase().includes(lowerSearch) ||
    customer.code.toLowerCase().includes(lowerSearch) ||
    customer.type.toLowerCase().includes(lowerSearch) ||
    customer.tier.toLowerCase().includes(lowerSearch)
  );
}

/**
 * Sort customers by relevance (tier, recent activity, alphabetical)
 */
export function sortCustomersByRelevance(customers: Customer[]): Customer[] {
  const tierPriority = { PLATINUM: 4, GOLD: 3, SILVER: 2, BRONZE: 1 };
  
  return [...customers].sort((a, b) => {
    // First priority: Active status
    if (a.status !== b.status) {
      return a.status === 'active' ? -1 : 1;
    }
    
    // Second priority: Non-blacklisted
    if (a.blacklist_status !== b.blacklist_status) {
      return a.blacklist_status === 'CLEAR' ? -1 : 1;
    }
    
    // Third priority: Customer tier
    const tierDiff = tierPriority[b.tier] - tierPriority[a.tier];
    if (tierDiff !== 0) {
      return tierDiff;
    }
    
    // Fourth priority: Recent activity
    if (a.last_transaction_date && b.last_transaction_date) {
      const dateA = new Date(a.last_transaction_date);
      const dateB = new Date(b.last_transaction_date);
      const dateDiff = dateB.getTime() - dateA.getTime();
      if (dateDiff !== 0) {
        return dateDiff;
      }
    } else if (a.last_transaction_date || b.last_transaction_date) {
      return a.last_transaction_date ? -1 : 1;
    }
    
    // Final priority: Alphabetical by name
    return a.name.localeCompare(b.name);
  });
}

/**
 * Get recent customers (mock implementation)
 */
export function getRecentCustomers(limit: number = 5): Customer[] {
  // This would typically come from localStorage or a dedicated API
  const recentIds = JSON.parse(localStorage.getItem('recentCustomers') || '[]') as string[];
  
  // For now, return empty array - will be populated as users interact with the dropdown
  return [];
}

/**
 * Add customer to recent list
 */
export function addToRecentCustomers(customerId: string): void {
  const recentIds = JSON.parse(localStorage.getItem('recentCustomers') || '[]') as string[];
  
  // Remove if already exists
  const filteredIds = recentIds.filter(id => id !== customerId);
  
  // Add to beginning
  const updatedIds = [customerId, ...filteredIds].slice(0, 5); // Keep only 5 recent
  
  localStorage.setItem('recentCustomers', JSON.stringify(updatedIds));
}

/**
 * Customer display utilities object
 */
export const customerDisplayUtils: CustomerDisplayUtils = {
  getDisplayName: (customer) => customer.name,
  getSecondaryInfo: getCustomerSecondaryInfo,
  getTierColor,
  getCustomerIcon,
  getWarningMessage: getCustomerWarningMessage,
  formatCreditInfo,
  formatLastTransaction,
};

/**
 * Generate mock customers for development
 */
export function generateMockCustomers(count: number = 10): Customer[] {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Emily', 'James', 'Maria'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const businessNames = ['Tech Solutions Inc', 'Global Trading Co', 'Prime Electronics', 'Elite Services', 'Metro Supplies', 'Apex Industries', 'Future Systems', 'Crown Enterprise', 'Star Corporation', 'Phoenix Group'];
  const tiers: Array<'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'> = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
  const types: Array<'INDIVIDUAL' | 'BUSINESS'> = ['INDIVIDUAL', 'BUSINESS'];
  
  return Array.from({ length: count }, (_, index) => {
    const type = types[index % 2];
    const tier = tiers[index % 4];
    const isBlacklisted = index % 10 === 0; // 10% blacklisted
    const isInactive = index % 8 === 0; // 12.5% inactive
    
    let name: string;
    if (type === 'BUSINESS') {
      name = businessNames[index % businessNames.length];
    } else {
      const firstName = firstNames[index % firstNames.length];
      const lastName = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
      name = `${firstName} ${lastName}`;
    }
    
    return {
      id: `customer-${index + 1}`,
      name,
      code: `CUST${String(index + 1).padStart(3, '0')}`,
      type,
      tier,
      status: isInactive ? 'inactive' : 'active',
      blacklist_status: isBlacklisted ? 'BLACKLISTED' : 'CLEAR',
      credit_limit: [5000, 10000, 25000, 50000][index % 4],
      lifetime_value: Math.floor(Math.random() * 100000),
      last_transaction_date: index % 3 === 0 ? null : new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
}