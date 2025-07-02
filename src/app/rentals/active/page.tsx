'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Eye, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

function ActiveRentalsContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data - replace with actual API call
  const activeRentals = [
    {
      id: 'RNT001',
      customer: 'John Doe',
      items: 'Canon EOS R5 Camera Kit',
      startDate: '2024-01-10',
      endDate: '2024-01-17',
      daysRemaining: 2,
      totalAmount: '$350.00',
      status: 'Active',
      paymentStatus: 'Paid',
    },
    {
      id: 'RNT002',
      customer: 'Jane Smith',
      items: 'Professional Lighting Kit',
      startDate: '2024-01-12',
      endDate: '2024-01-15',
      daysRemaining: 0,
      totalAmount: '$150.00',
      status: 'Due Today',
      paymentStatus: 'Paid',
    },
    {
      id: 'RNT003',
      customer: 'Bob Johnson',
      items: 'DJI Mavic Pro 3 Drone',
      startDate: '2024-01-08',
      endDate: '2024-01-14',
      daysRemaining: -1,
      totalAmount: '$200.00',
      status: 'Overdue',
      paymentStatus: 'Paid',
    },
    {
      id: 'RNT004',
      customer: 'Alice Brown',
      items: 'Sony A7S III + Lenses',
      startDate: '2024-01-14',
      endDate: '2024-01-21',
      daysRemaining: 6,
      totalAmount: '$500.00',
      status: 'Active',
      paymentStatus: 'Partial',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'Due Today':
        return <Badge className="bg-yellow-100 text-yellow-800">Due Today</Badge>;
      case 'Overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <Badge variant="outline" className="text-green-600">Paid</Badge>;
      case 'Partial':
        return <Badge variant="outline" className="text-orange-600">Partial</Badge>;
      case 'Unpaid':
        return <Badge variant="outline" className="text-red-600">Unpaid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDaysRemainingDisplay = (days: number) => {
    if (days < 0) {
      return <span className="text-red-600 font-medium">{Math.abs(days)} days overdue</span>;
    } else if (days === 0) {
      return <span className="text-yellow-600 font-medium">Due today</span>;
    } else {
      return <span className="text-gray-600">{days} days remaining</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Active Rentals
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and manage all currently active rental transactions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">+15% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">8</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">12</div>
            <p className="text-xs text-muted-foreground">Immediate action needed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue at Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,450</div>
            <p className="text-xs text-muted-foreground">From overdue rentals</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by ID, customer, items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="due-today">Due Today</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button variant="secondary" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Rentals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Rental Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rental ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Rental Period</TableHead>
                <TableHead>Time Remaining</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeRentals.map((rental) => (
                <TableRow key={rental.id}>
                  <TableCell className="font-medium">{rental.id}</TableCell>
                  <TableCell>{rental.customer}</TableCell>
                  <TableCell className="max-w-xs truncate">{rental.items}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{rental.startDate}</div>
                      <div className="text-gray-500">to {rental.endDate}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getDaysRemainingDisplay(rental.daysRemaining)}</TableCell>
                  <TableCell className="font-bold">{rental.totalAmount}</TableCell>
                  <TableCell>{getStatusBadge(rental.status)}</TableCell>
                  <TableCell>{getPaymentBadge(rental.paymentStatus)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/rentals/${rental.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {rental.status === 'Overdue' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-orange-600"
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing 1 to 4 of 127 results
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ActiveRentalsPage() {
  return (
    <ProtectedRoute requiredPermissions={['RENTAL_VIEW']}>
      <ActiveRentalsContent />
    </ProtectedRoute>
  );
}