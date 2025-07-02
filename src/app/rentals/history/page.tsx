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
import { Search, Filter, Download, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

function RentalHistoryContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Mock data - replace with actual API call
  const rentalHistory = [
    {
      id: 'RNT005',
      customer: 'Michael Chen',
      items: 'Canon EOS R5 Camera Kit',
      startDate: '2024-01-01',
      endDate: '2024-01-07',
      returnDate: '2024-01-07',
      duration: '7 days',
      totalAmount: '$350.00',
      status: 'Completed',
      lateFees: '$0.00',
    },
    {
      id: 'RNT006',
      customer: 'Sarah Johnson',
      items: 'Studio Lighting Set',
      startDate: '2023-12-25',
      endDate: '2023-12-30',
      returnDate: '2024-01-02',
      duration: '8 days',
      totalAmount: '$200.00',
      status: 'Completed',
      lateFees: '$60.00',
    },
    {
      id: 'RNT007',
      customer: 'David Lee',
      items: 'DJI Mavic Pro 3',
      startDate: '2023-12-20',
      endDate: '2023-12-27',
      returnDate: '2023-12-26',
      duration: '6 days',
      totalAmount: '$180.00',
      status: 'Completed',
      lateFees: '$0.00',
    },
    {
      id: 'RNT008',
      customer: 'Emma Wilson',
      items: 'Sony A7S III + Lenses',
      startDate: '2023-12-15',
      endDate: '2023-12-22',
      returnDate: null,
      duration: '7 days',
      totalAmount: '$500.00',
      status: 'Cancelled',
      lateFees: '$0.00',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'Cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      case 'Late Return':
        return <Badge className="bg-orange-100 text-orange-800">Late Return</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Rental History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View all past rental transactions and their details
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">1,156</div>
            <p className="text-xs text-muted-foreground">93.7% success rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Late Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">45</div>
            <p className="text-xs text-muted-foreground">3.6% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$125,450</div>
            <p className="text-xs text-muted-foreground">+$4,200 late fees</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by ID, customer..."
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
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="late">Late Return</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date">Date Range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger id="date">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
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

      {/* Rental History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rental Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rental ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Rental Period</TableHead>
                <TableHead>Return Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Late Fees</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rentalHistory.map((rental) => (
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
                  <TableCell>{rental.returnDate || '-'}</TableCell>
                  <TableCell>{rental.duration}</TableCell>
                  <TableCell className="font-bold">{rental.totalAmount}</TableCell>
                  <TableCell className={rental.lateFees !== '$0.00' ? 'text-orange-600 font-medium' : ''}>
                    {rental.lateFees}
                  </TableCell>
                  <TableCell>{getStatusBadge(rental.status)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/rentals/${rental.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing 1 to 4 of 1,234 results
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

export default function RentalHistoryPage() {
  return (
    <ProtectedRoute requiredPermissions={['RENTAL_VIEW']}>
      <RentalHistoryContent />
    </ProtectedRoute>
  );
}