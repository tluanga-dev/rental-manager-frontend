'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { rentalsDueTodayApi } from '@/services/api/rentals-due-today';
import { RentalDueToday, RentalDueTodaySummary } from '@/types/rentals-due-today';
import {
  DollarSign,
  Package,
  Users,
  AlertCircle,
  LucideIcon,
  Clock,
  AlertTriangle,
  Calendar,
  Phone,
  Eye,
  FileText,
} from 'lucide-react';

// Mock data for rentals due today
const mockRentalsDueToday: RentalDueToday[] = [
  {
    transaction_id: '123e4567-e89b-12d3-a456-426614174001',
    transaction_number: 'RNT-2025-0001',
    customer_id: '123e4567-e89b-12d3-a456-426614174002',
    customer_name: 'John Smith',
    customer_phone: '+1-555-0123',
    rental_start_date: '2025-07-01',
    rental_end_date: '2025-07-05',
    rental_days: 4,
    is_overdue: false,
    days_overdue: 0,
    days_remaining: 0,
    total_amount: 250.00,
    deposit_amount: 75.00,
    balance_due: 175.00,
    items: [
      {
        sku_code: 'TBL-001',
        item_name: 'Round Table (6-person)',
        quantity: 2,
        unit_price: 45.00,
      }
    ],
    location_id: '123e4567-e89b-12d3-a456-426614174003',
    notes: 'Wedding reception setup',
    created_at: '2025-06-30T10:00:00Z',
    updated_at: '2025-07-01T08:30:00Z',
  },
  {
    transaction_id: '123e4567-e89b-12d3-a456-426614174004',
    transaction_number: 'RNT-2025-0002',
    customer_id: '123e4567-e89b-12d3-a456-426614174005',
    customer_name: 'Sarah Johnson',
    customer_phone: '+1-555-0124',
    rental_start_date: '2025-07-03',
    rental_end_date: '2025-07-03',
    rental_days: 1,
    is_overdue: true,
    days_overdue: 2,
    days_remaining: 0,
    total_amount: 120.00,
    deposit_amount: 36.00,
    balance_due: 84.00,
    items: [
      {
        sku_code: 'TNT-005',
        item_name: 'Party Tent 10x10',
        quantity: 1,
        unit_price: 60.00,
      }
    ],
    location_id: '123e4567-e89b-12d3-a456-426614174003',
    notes: 'Birthday party',
    created_at: '2025-07-02T14:30:00Z',
    updated_at: '2025-07-03T09:15:00Z',
  },
  {
    transaction_id: '123e4567-e89b-12d3-a456-426614174006',
    transaction_number: 'RNT-2025-0003',
    customer_id: '123e4567-e89b-12d3-a456-426614174007',
    customer_name: 'Mike Davis',
    customer_phone: '+1-555-0125',
    rental_start_date: '2025-07-04',
    rental_end_date: '2025-07-05',
    rental_days: 1,
    is_overdue: false,
    days_overdue: 0,
    days_remaining: 0,
    total_amount: 180.00,
    deposit_amount: 54.00,
    balance_due: 126.00,
    items: [
      {
        sku_code: 'CHR-010',
        item_name: 'Chiavari Chair - Gold',
        quantity: 12,
        unit_price: 8.00,
      }
    ],
    location_id: '123e4567-e89b-12d3-a456-426614174003',
    created_at: '2025-07-03T16:45:00Z',
    updated_at: '2025-07-04T11:20:00Z',
  }
];

const mockSummary: RentalDueTodaySummary = {
  total_due_today: 2,
  total_overdue: 1,
  total_due_soon: 0,
  total_revenue_at_risk: 120.00,
  total_deposits_held: 165.00,
};

function DashboardContent() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [rentalsDueToday, setRentalsDueToday] = useState<RentalDueToday[]>(mockRentalsDueToday);
  const [rentalsSummary, setRentalsSummary] = useState<RentalDueTodaySummary>(mockSummary);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRentalsDueToday = async () => {
      setIsLoading(true);
      try {
        // Try to fetch from API, fall back to mock data on error
        const response = await rentalsDueTodayApi.getRentalsDueToday({ limit: 10 });
        setRentalsDueToday(response.rentals);
        setRentalsSummary(response.summary);
      } catch (error) {
        console.log('Using mock data - API not available:', error);
        // Use mock data as fallback
        setRentalsDueToday(mockRentalsDueToday);
        setRentalsSummary(mockSummary);
      }
      setIsLoading(false);
    };

    fetchRentalsDueToday();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (rental: RentalDueToday) => {
    if (rental.is_overdue) {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
        <AlertTriangle className="w-3 h-3 mr-1" />
        {rental.days_overdue} days overdue
      </Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        <Clock className="w-3 h-3 mr-1" />
        Due today
      </Badge>;
    }
  };

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
      title: 'Rentals Due Today',
      value: (rentalsSummary.total_due_today + rentalsSummary.total_overdue).toString(),
      change: `${rentalsSummary.total_overdue} overdue, ${rentalsSummary.total_due_today} due today`,
      icon: AlertCircle,
      color: 'text-yellow-600',
      link: '/rentals/due-today',
    },
  ] as Array<{
    title: string;
    value: string;
    change: string;
    icon: LucideIcon;
    color: string;
    link?: string;
  }>;

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
          const isClickable = stat.link;
          
          return (
            <Card 
              key={stat.title} 
              className={isClickable ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
              onClick={isClickable ? () => router.push(stat.link) : undefined}
            >
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

      {/* Rentals Due Today Section */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {/* Summary Cards */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Due Today Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Due Today</span>
              <span className="text-lg font-semibold text-yellow-600">{mockSummary.total_due_today}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Overdue</span>
              <span className="text-lg font-semibold text-red-600">{mockSummary.total_overdue}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Revenue at Risk</span>
              <span className="text-lg font-semibold text-red-600">{formatCurrency(mockSummary.total_revenue_at_risk)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Deposits Held</span>
              <span className="text-lg font-semibold text-green-600">{formatCurrency(mockSummary.total_deposits_held)}</span>
            </div>
            <Button 
              className="w-full mt-4" 
              onClick={() => router.push('/rentals/due-today')}
            >
              View All Due Rentals
            </Button>
          </CardContent>
        </Card>

        {/* Rentals Due Today Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Rentals Due Today</CardTitle>
          </CardHeader>
          <CardContent>
            {mockRentalsDueToday.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Transaction</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          Loading rentals due today...
                        </TableCell>
                      </TableRow>
                    ) : rentalsDueToday.length > 0 ? (
                      rentalsDueToday.slice(0, 5).map((rental) => (
                        <TableRow key={rental.transaction_id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{rental.customer_name}</div>
                              {rental.customer_phone && (
                                <div className="text-xs text-gray-500 flex items-center">
                                  <Phone className="w-3 h-3 mr-1" />
                                  {rental.customer_phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{rental.transaction_number}</div>
                              <div className="text-xs text-gray-500">
                                Due: {formatDate(rental.rental_end_date)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(rental)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{formatCurrency(rental.total_amount)}</div>
                              <div className="text-xs text-gray-500">
                                Balance: {formatCurrency(rental.balance_due)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm">
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button size="sm">
                                <FileText className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No rentals due today
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No rentals due today
              </div>
            )}
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