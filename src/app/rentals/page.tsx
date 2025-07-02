'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Package, Clock, AlertCircle } from 'lucide-react';

function RentalsContent() {
  const router = useRouter();

  const stats = [
    {
      title: 'Active Rentals',
      value: '127',
      change: '+15% from last month',
      icon: Package,
      color: 'text-blue-600',
    },
    {
      title: 'Overdue Returns',
      value: '12',
      change: '-2 from yesterday',
      icon: AlertCircle,
      color: 'text-red-600',
    },
    {
      title: 'Due Today',
      value: '8',
      change: '3 pickups, 5 returns',
      icon: Clock,
      color: 'text-orange-600',
    },
    {
      title: 'Monthly Revenue',
      value: '$18,450',
      change: '+25% from last month',
      icon: FileText,
      color: 'text-green-600',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Rental Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage rental transactions and track active rentals
          </p>
        </div>
        <Button onClick={() => router.push('/rentals/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Rental
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
          onClick={() => router.push('/rentals/new')}
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Create New Rental
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Start a new rental transaction
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/rentals/active')}
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Active Rentals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View and manage current rentals
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/returns')}
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Process Returns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Handle rental returns and inspections
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today\'s Schedule */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pickups Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: 'RNT001',
                  customer: 'John Doe',
                  items: 'Camera Kit',
                  time: '10:00 AM',
                  status: 'Scheduled',
                },
                {
                  id: 'RNT002',
                  customer: 'Jane Smith',
                  items: 'Lighting Equipment',
                  time: '2:00 PM',
                  status: 'Scheduled',
                },
                {
                  id: 'RNT003',
                  customer: 'Bob Johnson',
                  items: 'Audio Gear',
                  time: '4:00 PM',
                  status: 'Scheduled',
                },
              ].map((pickup) => (
                <div
                  key={pickup.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <div>
                    <p className="font-medium">{pickup.customer}</p>
                    <p className="text-sm text-gray-600">
                      {pickup.items} • {pickup.time}
                    </p>
                  </div>
                  <Badge variant="outline">{pickup.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Returns Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: 'RNT004',
                  customer: 'Alice Brown',
                  items: 'Drone Package',
                  time: '11:00 AM',
                  status: 'Due',
                },
                {
                  id: 'RNT005',
                  customer: 'Charlie Wilson',
                  items: 'Camera Lens Set',
                  time: '3:00 PM',
                  status: 'Due',
                },
                {
                  id: 'RNT006',
                  customer: 'Eve Davis',
                  items: 'Studio Lights',
                  time: '5:00 PM',
                  status: 'Overdue',
                  overdueHours: 2,
                },
              ].map((returnItem) => (
                <div
                  key={returnItem.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <div>
                    <p className="font-medium">{returnItem.customer}</p>
                    <p className="text-sm text-gray-600">
                      {returnItem.items} • {returnItem.time}
                    </p>
                  </div>
                  <Badge 
                    variant={returnItem.status === 'Overdue' ? 'destructive' : 'outline'}
                  >
                    {returnItem.status}
                    {returnItem.overdueHours && ` (${returnItem.overdueHours}h)`}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RentalsPage() {
  return (
    <ProtectedRoute requiredPermissions={['RENTAL_VIEW']}>
      <RentalsContent />
    </ProtectedRoute>
  );
}