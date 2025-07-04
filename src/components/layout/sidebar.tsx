'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Package,
  ShoppingCart,
  RefreshCw,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  Boxes,
  ClipboardCheck,
  BarChart3,
  Bell,
  LogOut,
  Menu,
  Grid3X3,
  Tag,
  RotateCcw,
  Eye,
  Calculator,
  TrendingUp,
} from 'lucide-react';
import { MenuItem } from '@/types/auth';

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/dashboard',
    permissions: ['SALE_VIEW', 'RENTAL_VIEW'],
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: 'Users',
    path: '/customers',
    permissions: ['CUSTOMER_VIEW'],
    children: [
      {
        id: 'all-customers',
        label: 'All Customers',
        icon: 'Users',
        path: '/customers',
        permissions: ['CUSTOMER_VIEW'],
      },
      {
        id: 'new-customer',
        label: 'Add Customer',
        icon: 'UserPlus',
        path: '/customers/new',
        permissions: ['CUSTOMER_CREATE'],
      },
      {
        id: 'customer-analytics',
        label: 'Analytics',
        icon: 'BarChart3',
        path: '/customers/analytics',
        permissions: ['CUSTOMER_VIEW'],
      },
    ],
  },
  {
    id: 'products',
    label: 'Products',
    icon: 'Package',
    path: '/products',
    permissions: ['INVENTORY_VIEW'],
    children: [
      {
        id: 'categories',
        label: 'Categories',
        icon: 'Grid3X3',
        path: '/products/categories',
        permissions: ['INVENTORY_VIEW'],
      },
      {
        id: 'brands',
        label: 'Brands',
        icon: 'Tag',
        path: '/products/brands',
        permissions: ['INVENTORY_VIEW'],
      },
      {
        id: 'product-items',
        label: 'Products',
        icon: 'Package',
        path: '/products/items',
        permissions: ['INVENTORY_VIEW'],
      },
      {
        id: 'skus',
        label: 'SKUs',
        icon: 'Boxes',
        path: '/products/skus',
        permissions: ['INVENTORY_VIEW'],
      },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: 'Boxes',
    path: '/inventory',
    permissions: ['INVENTORY_VIEW'],
    children: [
      {
        id: 'stock-levels',
        label: 'Stock Levels',
        icon: 'BarChart3',
        path: '/inventory/stock',
        permissions: ['INVENTORY_VIEW'],
      },
      {
        id: 'locations',
        label: 'Locations',
        icon: 'Building2',
        path: '/inventory/locations',
        permissions: ['INVENTORY_VIEW'],
      },
    ],
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: 'ShoppingCart',
    path: '/sales',
    permissions: ['SALE_VIEW', 'SALE_CREATE'],
    children: [
      {
        id: 'new-sale',
        label: 'New Sale',
        icon: 'ShoppingCart',
        path: '/sales/new',
        permissions: ['SALE_CREATE'],
      },
      {
        id: 'sales-history',
        label: 'Sales History',
        icon: 'FileText',
        path: '/sales/history',
        permissions: ['SALE_VIEW'],
      },
    ],
  },
  {
    id: 'rentals',
    label: 'Rentals',
    icon: 'RefreshCw',
    path: '/rentals',
    permissions: ['RENTAL_VIEW', 'RENTAL_CREATE'],
    children: [
      {
        id: 'new-rental',
        label: 'New Rental',
        icon: 'RefreshCw',
        path: '/rentals/new',
        permissions: ['RENTAL_CREATE'],
      },
      {
        id: 'active-rentals',
        label: 'Active Rentals',
        icon: 'FileText',
        path: '/rentals/active',
        permissions: ['RENTAL_VIEW'],
      },
      {
        id: 'rental-history',
        label: 'Rental History',
        icon: 'FileText',
        path: '/rentals/history',
        permissions: ['RENTAL_VIEW'],
      },
      {
        id: 'returns',
        label: 'Returns',
        icon: 'RotateCcw',
        path: '/rentals/returns',
        permissions: ['RETURN_VIEW'],
        children: [
          {
            id: 'process-returns',
            label: 'Process Returns',
            icon: 'RotateCcw',
            path: '/rentals/returns/wizard',
            permissions: ['RETURN_PROCESS'],
          },
          {
            id: 'return-queue',
            label: 'Return Queue',
            icon: 'Eye',
            path: '/rentals/returns/process',
            permissions: ['RETURN_VIEW'],
          },
          {
            id: 'return-analytics',
            label: 'Return Analytics',
            icon: 'TrendingUp',
            path: '/rentals/returns/analytics',
            permissions: ['RETURN_VIEW'],
          },
        ],
      },
    ],
  },
  {
    id: 'purchases',
    label: 'Purchases',
    icon: 'Package',
    path: '/purchases',
    permissions: ['INVENTORY_VIEW'],
    children: [
      {
        id: 'suppliers',
        label: 'Suppliers',
        icon: 'Users',
        path: '/purchases/suppliers',
        permissions: ['INVENTORY_VIEW'],
      },
      {
        id: 'supplier-analytics',
        label: 'Supplier Analytics',
        icon: 'BarChart3',
        path: '/purchases/suppliers/analytics',
        permissions: ['INVENTORY_VIEW'],
      },
      {
        id: 'receive-inventory',
        label: 'Receive Inventory',
        icon: 'Package',
        path: '/purchases/receive',
        permissions: ['INVENTORY_VIEW'],
      },
    ],
  },
  {
    id: 'inspections',
    label: 'Inspections',
    icon: 'ClipboardCheck',
    path: '/inspections',
    permissions: ['INSPECTION_VIEW'],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'BarChart3',
    path: '/reports',
    permissions: ['REPORT_VIEW'],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    path: '/settings',
    permissions: ['SYSTEM_CONFIG'],
  },
];

const iconMap = {
  LayoutDashboard,
  Users,
  UserPlus,
  Package,
  ShoppingCart,
  RefreshCw,
  FileText,
  Settings,
  Building2,
  Boxes,
  ClipboardCheck,
  BarChart3,
  Bell,
  Grid3X3,
  Tag,
  RotateCcw,
  Eye,
  Calculator,
  TrendingUp,
};

export function Sidebar() {
  const pathname = usePathname();
  const { hasPermission, user, logout } = useAuthStore();
  const { sidebarCollapsed, setSidebarCollapsed, unreadCount } = useAppStore();
  const [expandedItems, setExpandedItems] = useState<string[]>(['customers', 'inventory', 'sales', 'rentals', 'purchases', 'returns']);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const hasItemPermission = (item: MenuItem) => {
    // Admin users have access to everything
    const roleName = user?.role?.name?.toLowerCase();
    if (roleName === 'admin' || roleName === 'administrator') {
      return true;
    }
    return item.permissions.length === 0 || hasPermission(item.permissions as any);
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    if (!hasItemPermission(item)) return null;

    const Icon = iconMap[item.icon as keyof typeof iconMap];
    // Check if any children have permissions (for showing expand/collapse)
    const visibleChildren = item.children?.filter(child => hasItemPermission(child)) || [];
    const hasChildren = visibleChildren.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const itemIsActive = isActive(item.path);

    const menuItemContent = (
      <div
        className={cn(
          'flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          itemIsActive && 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
          depth > 0 && 'ml-6',
          sidebarCollapsed && depth === 0 && 'justify-center px-2'
        )}
      >
        {Icon && (
          <Icon 
            className={cn(
              'h-5 w-5 flex-shrink-0',
              !sidebarCollapsed && 'mr-3',
              itemIsActive && 'text-blue-600 dark:text-blue-400'
            )} 
          />
        )}
        {!sidebarCollapsed && (
          <>
            <span className="flex-1">{item.label}</span>
            {item.id === 'notifications' && unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
            {hasChildren && (
              <ChevronRight 
                className={cn(
                  'h-4 w-4 transition-transform',
                  isExpanded && 'rotate-90'
                )}
              />
            )}
          </>
        )}
      </div>
    );

    return (
      <div key={item.id}>
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.id)}
            className="w-full text-left"
          >
            {menuItemContent}
          </button>
        ) : (
          <Link href={item.path}>
            {menuItemContent}
          </Link>
        )}
        
        {hasChildren && isExpanded && !sidebarCollapsed && (
          <div className="ml-2 mt-1 space-y-1">
            {visibleChildren.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn(
      'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
      sidebarCollapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          {!sidebarCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Rental Manager
            </h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>

        {/* User section */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          {!sidebarCollapsed && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.role?.name || 'User'}
              </p>
            </div>
          )}
          
          <Button
            variant="ghost"
            onClick={logout}
            className={cn(
              'w-full justify-start',
              sidebarCollapsed && 'justify-center px-2'
            )}
          >
            <LogOut className={cn('h-4 w-4', !sidebarCollapsed && 'mr-2')} />
            {!sidebarCollapsed && 'Logout'}
          </Button>
        </div>
      </div>
    </div>
  );
}