'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Plus, FileText, TrendingUp, DollarSign } from 'lucide-react';

function SalesContent() {
  const router = useRouter();

  const stats = [
    {
      title: 'Today\'s Sales',
      value: '$2,450.00',
      change: '+12% from yesterday',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Monthly Sales',
      value: '$45,231.89',
      change: '+20.1% from last month',
      icon: TrendingUp,
      color: 'text-blue-600',
    },
    {
      title: 'Total Transactions',
      value: '156',
      change: '+8% from last month',
      icon: FileText,
      color: 'text-purple-600',
    },
    {
      title: 'Average Sale',
      value: '$290.07',
      change: '+5% from last month',
      icon: DollarSign,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Sales Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage sales transactions and view sales analytics
          </p>
        </div>
        <Button onClick={() => router.push('/sales/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Sale
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/sales/new')}
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Create New Sale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Process a new sales transaction
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/sales/history')}
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Sales History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View and manage past sales
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/reports?type=sales')}
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Sales Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generate detailed sales reports
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: 'TRX001',
                customer: 'John Doe',
                items: '3 items',
                amount: '$299.99',
                time: '2 hours ago',
                status: 'Completed',
              },
              {
                id: 'TRX002',
                customer: 'Jane Smith',
                items: '1 item',
                amount: '$1,299.99',
                time: '4 hours ago',
                status: 'Completed',
              },
              {
                id: 'TRX003',
                customer: 'Bob Johnson',
                items: '5 items',
                amount: '$599.99',
                time: '6 hours ago',
                status: 'Completed',
              },
            ].map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => router.push(`/sales/${sale.id}`)}
              >
                <div>
                  <p className="font-medium">{sale.customer}</p>
                  <p className="text-sm text-gray-600">
                    {sale.id} • {sale.items} • {sale.time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{sale.amount}</p>
                  <p className="text-sm text-green-600">{sale.status}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/sales/history')}
            >
              View All Sales
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SalesPage() {
  return (
    <ProtectedRoute requiredPermissions={['SALE_VIEW']}>
      <SalesContent />
    </ProtectedRoute>
  );
}