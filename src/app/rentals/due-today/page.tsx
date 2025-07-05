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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Search, 
  Eye, 
  Clock, 
  AlertTriangle, 
  Calendar,
  DollarSign,
  Package,
  Phone,
  FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RentalDueToday, RentalDueTodaySummary } from '@/types/rentals-due-today';

// Mock data matching the backend structure
const mockRentalsDueToday: RentalDueToday[] = [
  {
    transaction_id: '123e4567-e89b-12d3-a456-426614174001',
    transaction_number: 'RNT-2024-0001',
    customer_id: '123e4567-e89b-12d3-a456-426614174002',
    customer_name: 'John Smith',
    customer_phone: '+1-555-0123',
    rental_start_date: '2024-01-15',
    rental_end_date: '2024-01-20',
    rental_days: 5,
    is_overdue: true,
    days_overdue: 2,
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
      },
      {
        sku_code: 'CHR-010',
        item_name: 'Chiavari Chair - Gold',
        quantity: 12,
        unit_price: 8.00,
      }
    ],
    location_id: '123e4567-e89b-12d3-a456-426614174003',
    notes: 'Wedding reception setup',
    created_at: '2024-01-14T10:00:00Z',
    updated_at: '2024-01-15T08:30:00Z',
  },
  {
    transaction_id: '123e4567-e89b-12d3-a456-426614174004',
    transaction_number: 'RNT-2024-0002',
    customer_id: '123e4567-e89b-12d3-a456-426614174005',
    customer_name: 'Sarah Johnson',
    customer_phone: '+1-555-0124',
    rental_start_date: '2024-01-18',
    rental_end_date: '2024-01-20',
    rental_days: 2,
    is_overdue: false,
    days_overdue: 0,
    days_remaining: 0,
    total_amount: 180.00,
    deposit_amount: 54.00,
    balance_due: 126.00,
    items: [
      {
        sku_code: 'TNT-005',
        item_name: 'Party Tent 20x20',
        quantity: 1,
        unit_price: 90.00,
      }
    ],
    location_id: '123e4567-e89b-12d3-a456-426614174003',
    notes: 'Birthday party - pickup arranged',
    created_at: '2024-01-17T14:30:00Z',
    updated_at: '2024-01-18T09:15:00Z',
  },
  {
    transaction_id: '123e4567-e89b-12d3-a456-426614174006',
    transaction_number: 'RNT-2024-0003',
    customer_id: '123e4567-e89b-12d3-a456-426614174007',
    customer_name: 'Mike Davis',
    customer_phone: '+1-555-0125',
    rental_start_date: '2024-01-16',
    rental_end_date: '2024-01-20',
    rental_days: 4,
    is_overdue: false,
    days_overdue: 0,
    days_remaining: 0,
    total_amount: 320.00,
    deposit_amount: 96.00,
    balance_due: 224.00,
    items: [
      {
        sku_code: 'STG-001',
        item_name: 'Portable Stage 8x12',
        quantity: 1,
        unit_price: 80.00,
      },
      {
        sku_code: 'LGT-003',
        item_name: 'LED Spotlight Set',
        quantity: 4,
        unit_price: 25.00,
      }
    ],
    location_id: '123e4567-e89b-12d3-a456-426614174003',
    created_at: '2024-01-15T16:45:00Z',
    updated_at: '2024-01-16T11:20:00Z',
  }
];

const mockSummary: RentalDueTodaySummary = {
  total_due_today: 2,
  total_overdue: 1,
  total_due_soon: 0,
  total_revenue_at_risk: 250.00,
  total_deposits_held: 225.00,
};

function RentalsDueTodayContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRental, setSelectedRental] = useState<RentalDueToday | null>(null);

  const filteredRentals = mockRentalsDueToday.filter(rental => {
    const matchesSearch = 
      rental.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.transaction_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'overdue' && rental.is_overdue) ||
      (statusFilter === 'due-today' && !rental.is_overdue && rental.days_remaining === 0);
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (rental: RentalDueToday) => {
    if (rental.is_overdue) {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
        <AlertTriangle className="w-3 h-3 mr-1" />
        {rental.days_overdue} days overdue
      </Badge>;
    } else if (rental.days_remaining === 0) {
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        <Clock className="w-3 h-3 mr-1" />
        Due today
      </Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
      Due in {rental.days_remaining} days
    </Badge>;
  };

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
      year: 'numeric',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Rentals Due Today
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track and manage rental returns scheduled for today
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Due Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{mockSummary.total_due_today}</div>
            <p className="text-xs text-muted-foreground">Returns expected</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{mockSummary.total_overdue}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Due Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{mockSummary.total_due_soon}</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Revenue at Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(mockSummary.total_revenue_at_risk)}
            </div>
            <p className="text-xs text-muted-foreground">Overdue amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Deposits Held
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(mockSummary.total_deposits_held)}
            </div>
            <p className="text-xs text-muted-foreground">Total secured</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by customer name or transaction number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rentals</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="due-today">Due Today</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rentals Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Rentals Due ({filteredRentals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRentals.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Return Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRentals.map((rental) => (
                    <TableRow key={rental.transaction_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{rental.transaction_number}</div>
                          <div className="text-sm text-gray-500">
                            {rental.rental_days} days rental
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{rental.customer_name}</div>
                          {rental.customer_phone && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {rental.customer_phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(rental)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(rental.rental_end_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {rental.items.length} item{rental.items.length !== 1 ? 's' : ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatCurrency(rental.total_amount)}</div>
                          <div className="text-sm text-gray-500">
                            Balance: {formatCurrency(rental.balance_due)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedRental(rental)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Rental Details</DialogTitle>
                                <DialogDescription>
                                  {selectedRental?.transaction_number} - {selectedRental?.customer_name}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedRental && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Customer Information</h4>
                                      <p><strong>Name:</strong> {selectedRental.customer_name}</p>
                                      {selectedRental.customer_phone && (
                                        <p><strong>Phone:</strong> {selectedRental.customer_phone}</p>
                                      )}
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-2">Rental Information</h4>
                                      <p><strong>Start:</strong> {formatDate(selectedRental.rental_start_date)}</p>
                                      <p><strong>End:</strong> {formatDate(selectedRental.rental_end_date)}</p>
                                      <p><strong>Duration:</strong> {selectedRental.rental_days} days</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium mb-2">Items</h4>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>SKU</TableHead>
                                          <TableHead>Item</TableHead>
                                          <TableHead>Qty</TableHead>
                                          <TableHead>Price</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {selectedRental.items.map((item, index) => (
                                          <TableRow key={index}>
                                            <TableCell>{item.sku_code}</TableCell>
                                            <TableCell>{item.item_name}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>

                                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                    <div>
                                      <p className="text-sm text-gray-500">Total Amount</p>
                                      <p className="text-lg font-medium">{formatCurrency(selectedRental.total_amount)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Deposit</p>
                                      <p className="text-lg font-medium">{formatCurrency(selectedRental.deposit_amount)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Balance Due</p>
                                      <p className="text-lg font-medium">{formatCurrency(selectedRental.balance_due)}</p>
                                    </div>
                                  </div>

                                  {selectedRental.notes && (
                                    <div>
                                      <h4 className="font-medium mb-2">Notes</h4>
                                      <p className="text-sm text-gray-700 dark:text-gray-300">{selectedRental.notes}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => router.push(`/rentals/returns/wizard?rental=${rental.transaction_id}`)}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Process Return
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'No rentals found matching your filters' 
                : 'No rentals due today'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function RentalsDueTodayPage() {
  return (
    <ProtectedRoute requiredPermissions={['RENTAL_VIEW']}>
      <RentalsDueTodayContent />
    </ProtectedRoute>
  );
}
