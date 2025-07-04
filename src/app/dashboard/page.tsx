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
      value: '$0.00',
      change: 'No data available',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Active Rentals',
      value: '0',
      change: 'No data available',
      icon: Package,
      color: 'text-blue-600',
    },
    {
      title: 'Customers',
      value: '0',
      change: 'No data available',
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Overdue Returns',
      value: '0',
      change: 'No data available',
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
              <div className="text-center py-8 text-gray-500">
                No recent transactions available
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Inventory Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                No inventory alerts available
              </div>
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