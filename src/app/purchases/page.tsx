'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCart, 
  Package, 
  TrendingDown, 
  DollarSign, 
  Plus,
  Users,
  FileText,
  PackageCheck
} from 'lucide-react';

function PurchasesContent() {
  const router = useRouter();

  const stats = [
    {
      title: 'Pending Orders',
      value: '8',
      change: '3 urgent',
      icon: ShoppingCart,
      color: 'text-orange-600',
    },
    {
      title: 'Monthly Spend',
      value: '$12,450',
      change: '-15% from last month',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Low Stock Items',
      value: '23',
      change: 'Requires reorder',
      icon: TrendingDown,
      color: 'text-red-600',
    },
    {
      title: 'Active Suppliers',
      value: '45',
      change: '+2 this month',
      icon: Users,
      color: 'text-blue-600',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Purchase Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage inventory purchases and supplier relationships
          </p>
        </div>
        <Button onClick={() => router.push('/purchases/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Purchase Order
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/purchases/new')}
        >
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Plus className="mr-2 h-5 w-5" />
              Create Purchase Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create a new purchase order
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/purchases/receive')}
        >
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <PackageCheck className="mr-2 h-5 w-5" />
              Receive Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Process incoming shipments
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/purchases/orders')}
        >
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <FileText className="mr-2 h-5 w-5" />
              Purchase Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View all purchase orders
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/purchases/suppliers')}
        >
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Users className="mr-2 h-5 w-5" />
              Manage Suppliers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Supplier information & contacts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Purchase Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: 'PO-2024-001',
                  supplier: 'Camera Equipment Co.',
                  items: '5 items',
                  total: '$3,450.00',
                  status: 'Pending',
                  date: '2 hours ago',
                },
                {
                  id: 'PO-2024-002',
                  supplier: 'Lighting Solutions Ltd.',
                  items: '12 items',
                  total: '$1,890.00',
                  status: 'Approved',
                  date: '5 hours ago',
                },
                {
                  id: 'PO-2024-003',
                  supplier: 'Audio Gear Wholesale',
                  items: '3 items',
                  total: '$750.00',
                  status: 'Received',
                  date: 'Yesterday',
                },
              ].map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => router.push(`/purchases/orders/${order.id}`)}
                >
                  <div>
                    <p className="font-medium">{order.supplier}</p>
                    <p className="text-sm text-gray-600">
                      {order.id} • {order.items} • {order.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{order.total}</p>
                    <p className="text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.status}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  item: 'Canon EOS R5 Body',
                  sku: 'CAM-001',
                  current: 2,
                  reorderPoint: 5,
                  supplier: 'Camera Equipment Co.',
                },
                {
                  item: 'Godox AD200 Pro',
                  sku: 'LGT-015',
                  current: 0,
                  reorderPoint: 3,
                  supplier: 'Lighting Solutions Ltd.',
                },
                {
                  item: 'DJI Mic Wireless',
                  sku: 'AUD-008',
                  current: 1,
                  reorderPoint: 4,
                  supplier: 'Audio Gear Wholesale',
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{item.item}</p>
                    <p className="text-sm text-gray-600">
                      {item.sku} • {item.supplier}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${item.current === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                      {item.current} / {item.reorderPoint}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/purchases/new?item=${item.sku}`);
                      }}
                    >
                      Reorder
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PurchasesPage() {
  return (
    <ProtectedRoute requiredPermissions={['INVENTORY_MANAGE', 'PURCHASE_VIEW']}>
      <PurchasesContent />
    </ProtectedRoute>
  );
}