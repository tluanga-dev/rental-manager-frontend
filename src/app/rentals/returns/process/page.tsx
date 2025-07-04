'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { returnsApi, RentalReturnHeader } from '@/services/api/returns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Eye, 
  Search, 
  Calendar, 
  Clock, 
  DollarSign, 
  Package,
  MoreHorizontal,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

const statusColors = {
  'PENDING_INSPECTION': 'bg-yellow-100 text-yellow-800',
  'INSPECTION_COMPLETE': 'bg-green-100 text-green-800',
  'FEES_CALCULATED': 'bg-purple-100 text-purple-800',
  'COMPLETED': 'bg-gray-100 text-gray-800',
  'CANCELLED': 'bg-red-100 text-red-800'
};

const priorityColors = {
  'HIGH': 'bg-red-100 text-red-800',
  'MEDIUM': 'bg-yellow-100 text-yellow-800',
  'LOW': 'bg-green-100 text-green-800'
};

const getPriority = (returnItem: RentalReturnHeader): 'HIGH' | 'MEDIUM' | 'LOW' => {
  // Calculate priority based on business rules
  const returnDate = new Date(returnItem.return_date);
  const now = new Date();
  const daysOverdue = Math.max(0, Math.floor((returnDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  
  if (daysOverdue > 3 || returnItem.total_damage_fees > 500) return 'HIGH';
  if (daysOverdue > 0 || returnItem.total_damage_fees > 100) return 'MEDIUM';
  return 'LOW';
};

const formatDisplayStatus = (status: string): string => {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function ReturnQueuePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Fetch returns data
  const { data: returnsData, isLoading, error, refetch } = useQuery({
    queryKey: ['returns-queue', statusFilter, searchTerm],
    queryFn: () => returnsApi.list({
      status: statusFilter === 'all' ? undefined : (statusFilter as 'PENDING_INSPECTION' | 'INSPECTION_COMPLETE' | 'FEES_CALCULATED' | 'COMPLETED' | 'CANCELLED'),
      search: searchTerm || undefined,
      limit: 50
    }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const returns = returnsData?.items || [];

  const filteredReturns = returns.filter(returnItem => {
    const priority = getPriority(returnItem);
    const matchesPriority = priorityFilter === 'all' || priority === priorityFilter;
    return matchesPriority;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Eye className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Return Queue</h1>
          <p className="text-muted-foreground">
            Monitor and manage pending returns and processing status
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Returns</h3>
              <p className="text-gray-600 mb-4">Failed to load return queue data.</p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {!isLoading && !error && (
        <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Returns</p>
              <p className="text-2xl font-bold">{returns.filter(r => r.status === 'PENDING_INSPECTION').length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">
                {returns.filter(r => getPriority(r) === 'HIGH').length}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Eye className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Inspection</p>
              <p className="text-2xl font-bold">{returns.filter(r => r.status === 'INSPECTION_COMPLETE').length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Fees</p>
              <p className="text-2xl font-bold">
                ${returns.reduce((sum, r) => sum + r.total_late_fees + r.total_damage_fees + r.total_cleaning_fees, 0).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Return Queue</CardTitle>
          <CardDescription>
            Track and process equipment returns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by customer, rental ID, or return ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING_INSPECTION">Pending Inspection</SelectItem>
                  <SelectItem value="INSPECTION_COMPLETE">Inspection Complete</SelectItem>
                  <SelectItem value="FEES_CALCULATED">Fees Calculated</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="sm:w-32">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Returns Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Return ID</TableHead>
                  <TableHead>Rental ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Return Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Est. Fees</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReturns.map((returnItem) => {
                  const priority = getPriority(returnItem);
                  const totalFees = returnItem.total_late_fees + returnItem.total_damage_fees + returnItem.total_cleaning_fees;
                  
                  return (
                  <TableRow key={returnItem.id}>
                    <TableCell className="font-medium">{returnItem.return_number}</TableCell>
                    <TableCell>{returnItem.rental_transaction_id}</TableCell>
                    <TableCell>{returnItem.customer?.name || 'Unknown'}</TableCell>
                    <TableCell>{returnItem.items?.length || 0}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[returnItem.status as keyof typeof statusColors]}>
                        {formatDisplayStatus(returnItem.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityColors[priority as keyof typeof priorityColors]}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date(returnItem.return_date).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{new Date(returnItem.created_at).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span>${totalFees.toFixed(2)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/rentals/returns/${returnItem.id}`}>
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/rentals/returns/wizard?returnId=${returnItem.id}`}>
                              Continue Processing
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Mark Priority</DropdownMenuItem>
                          <DropdownMenuItem>Add Note</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredReturns.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No returns found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No returns match your current filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
}