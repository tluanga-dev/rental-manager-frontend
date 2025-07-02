'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import {
  DollarSign,
  Package,
  Users,
  AlertCircle,
} from 'lucide-react';

function DashboardContent() {
  const { user } = useAuthStore();

  const stats = [
    {
      title: 'Total Revenue',
      value: '$45,231.89',
      change: '+20.1% from last month',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Active Rentals',
      value: '127',
      change: '+15% from last month',
      icon: Package,
      color: 'text-blue-600',
    },
    {
      title: 'Customers',
      value: '2,350',
      change: '+5.2% from last month',
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Overdue Returns',
      value: '12',
      change: '-2 from yesterday',
      icon: AlertCircle,
      color: 'text-red-600',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {user?.firstName}! Here&apos;s what&apos;s happening today.
        </p>
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

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: '1',
                  type: 'Rental',
                  customer: 'John Doe',
                  amount: '$299.99',
                  status: 'Active',
                  date: '2 hours ago',
                },
                {
                  id: '2',
                  type: 'Sale',
                  customer: 'Jane Smith',
                  amount: '$1,299.99',
                  status: 'Completed',
                  date: '4 hours ago',
                },
                {
                  id: '3',
                  type: 'Return',
                  customer: 'Bob Johnson',
                  amount: '$199.99',
                  status: 'Processing',
                  date: '6 hours ago',
                },
              ].map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{transaction.customer}</p>
                    <p className="text-sm text-gray-600">
                      {transaction.type} • {transaction.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{transaction.amount}</p>
                    <p className="text-sm text-gray-600">{transaction.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Inventory Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  item: 'DSLR Camera',
                  status: 'Low Stock',
                  count: '3 remaining',
                  urgency: 'high',
                },
                {
                  item: 'Tripod Stand',
                  status: 'Out of Stock',
                  count: '0 remaining',
                  urgency: 'critical',
                },
                {
                  item: 'LED Light Kit',
                  status: 'Low Stock',
                  count: '5 remaining',
                  urgency: 'medium',
                },
              ].map((alert, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{alert.item}</p>
                    <p className="text-sm text-gray-600">{alert.count}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        alert.urgency === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : alert.urgency === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {alert.status}
                    </span>
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

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredPermissions={['SALE_VIEW', 'RENTAL_VIEW']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}