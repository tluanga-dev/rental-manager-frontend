'use client';

import { use, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Calendar,
  DollarSign,
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  Camera,
  AlertCircle,
  CheckCircle,
  MoreHorizontal,
  Download,
  Printer
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
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Mock data for return details
const mockReturnData = {
  id: 'RET-001',
  rentalId: 'RENT-2024-001',
  status: 'inspection_complete',
  returnDate: '2024-01-15T10:30:00Z',
  dueDate: '2024-01-14T23:59:59Z',
  processedBy: 'Sarah Johnson',
  processedAt: '2024-01-15T14:45:00Z',
  customer: {
    id: 'CUST-001',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Smith Construction'
  },
  rental: {
    startDate: '2024-01-01',
    endDate: '2024-01-14',
    totalDays: 14,
    location: 'Main Warehouse'
  },
  items: [
    {
      id: 'ITEM-001',
      name: 'Excavator - CAT 320',
      sku: 'EXC-CAT-320-001',
      condition: 'Good',
      conditionGrade: 'B',
      hasDefects: true,
      defects: [
        {
          type: 'Surface Scratches',
          severity: 'Minor',
          description: 'Small scratches on the right side panel',
          cost: 125.00,
          photos: ['photo1.jpg', 'photo2.jpg']
        }
      ],
      photos: ['before1.jpg', 'after1.jpg']
    },
    {
      id: 'ITEM-002',
      name: 'Safety Harness - 3M',
      sku: 'SAF-3M-HAR-001',
      condition: 'Excellent',
      conditionGrade: 'A',
      hasDefects: false,
      defects: [],
      photos: ['harness1.jpg']
    }
  ],
  fees: {
    lateFees: 50.00,
    cleaningFees: 0.00,
    damageFees: 125.00,
    totalFees: 175.00,
    depositRefund: 825.00,
    netAmount: -650.00 // negative means refund to customer
  },
  timeline: [
    {
      event: 'Return Initiated',
      timestamp: '2024-01-15T10:30:00Z',
      user: 'Customer Portal',
      details: 'Customer initiated return request'
    },
    {
      event: 'Items Received',
      timestamp: '2024-01-15T11:00:00Z',
      user: 'Sarah Johnson',
      details: 'All items received and checked in'
    },
    {
      event: 'Inspection Started',
      timestamp: '2024-01-15T11:15:00Z',
      user: 'Sarah Johnson',
      details: 'Condition assessment and damage inspection'
    },
    {
      event: 'Inspection Complete',
      timestamp: '2024-01-15T14:45:00Z',
      user: 'Sarah Johnson',
      details: 'Minor damage identified, fees calculated'
    }
  ]
};

const statusColors = {
  'pending_inspection': 'bg-yellow-100 text-yellow-800',
  'partial_returned': 'bg-blue-100 text-blue-800',
  'inspection_complete': 'bg-green-100 text-green-800',
  'fees_calculated': 'bg-purple-100 text-purple-800',
  'completed': 'bg-gray-100 text-gray-800'
};

const conditionColors = {
  'A': 'bg-green-100 text-green-800',
  'B': 'bg-yellow-100 text-yellow-800',
  'C': 'bg-orange-100 text-orange-800',
  'D': 'bg-red-100 text-red-800'
};

export default function ReturnDetailsPage({ params }: PageProps) {
  use(params); // Consume the params
  const [activeTab, setActiveTab] = useState('overview');
  
  // In a real app, you would fetch the return data based on the ID
  const returnData = mockReturnData;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/rentals/returns/process">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Queue
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Return {returnData.id}</h1>
            <p className="text-muted-foreground">
              Rental {returnData.rentalId} • Customer: {returnData.customer.name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge className={statusColors[returnData.status as keyof typeof statusColors]}>
            {returnData.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Printer className="h-4 w-4 mr-2" />
                Print Return Summary
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Add Note
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/rentals/returns/wizard?returnId=${returnData.id}`}>
                  Continue Processing
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Return Date</p>
              <p className="text-lg font-semibold">{formatDate(returnData.returnDate)}</p>
              <p className="text-xs text-red-600">
                {new Date(returnData.returnDate) > new Date(returnData.dueDate) ? 'Overdue' : 'On Time'}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Package className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Items Returned</p>
              <p className="text-lg font-semibold">{returnData.items.length}</p>
              <p className="text-xs text-gray-500">All items received</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Fees</p>
              <p className="text-lg font-semibold">${returnData.fees.totalFees.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Damage + Late fees</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Net Amount</p>
              <p className={`text-lg font-semibold ${returnData.fees.netAmount < 0 ? 'text-green-600' : 'text-red-600'}`}>
                {returnData.fees.netAmount < 0 ? '-' : ''}${Math.abs(returnData.fees.netAmount).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                {returnData.fees.netAmount < 0 ? 'Refund due' : 'Payment due'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items & Inspection</TabsTrigger>
          <TabsTrigger value="fees">Fees & Charges</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Customer Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Name</p>
                  <p className="text-sm">{returnData.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Company</p>
                  <p className="text-sm">{returnData.customer.company}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{returnData.customer.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{returnData.customer.phone}</span>
                </div>
              </CardContent>
            </Card>

            {/* Rental Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Rental Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rental ID</p>
                  <p className="text-sm">{returnData.rentalId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Rental Period</p>
                  <p className="text-sm">
                    {returnData.rental.startDate} to {returnData.rental.endDate}
                  </p>
                  <p className="text-xs text-gray-500">
                    {returnData.rental.totalDays} days total
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{returnData.rental.location}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Returned Items & Condition Assessment</CardTitle>
              <CardDescription>
                Detailed inspection results for each returned item
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {returnData.items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={conditionColors[item.conditionGrade as keyof typeof conditionColors]}>
                          Grade {item.conditionGrade}
                        </Badge>
                        {item.hasDefects ? (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Defects Found
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            No Issues
                          </Badge>
                        )}
                      </div>
                    </div>

                    {item.hasDefects && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Identified Defects:</h4>
                        <div className="space-y-2">
                          {item.defects.map((defect, defectIndex) => (
                            <div key={defectIndex} className="bg-red-50 border border-red-200 rounded p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-red-800">{defect.type}</p>
                                  <p className="text-sm text-red-600">{defect.description}</p>
                                  <p className="text-xs text-red-500">Severity: {defect.severity}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-red-800">${defect.cost.toFixed(2)}</p>
                                  <p className="text-xs text-red-600">Repair cost</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Camera className="h-4 w-4" />
                        <span>{item.photos.length} photos captured</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fee Breakdown</CardTitle>
              <CardDescription>
                Detailed calculation of all fees and charges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Late Fees</TableCell>
                        <TableCell className="text-right">
                          ${returnData.fees.lateFees.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Cleaning Fees</TableCell>
                        <TableCell className="text-right">
                          ${returnData.fees.cleaningFees.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Damage Fees</TableCell>
                        <TableCell className="text-right">
                          ${returnData.fees.damageFees.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow className="border-t-2">
                        <TableCell className="font-semibold">Total Fees</TableCell>
                        <TableCell className="text-right font-semibold">
                          ${returnData.fees.totalFees.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-green-600">Deposit Refund</TableCell>
                        <TableCell className="text-right text-green-600">
                          -${returnData.fees.depositRefund.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow className="border-t-2">
                        <TableCell className="font-bold">Net Amount</TableCell>
                        <TableCell className={`text-right font-bold ${returnData.fees.netAmount < 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {returnData.fees.netAmount < 0 ? '-' : ''}${Math.abs(returnData.fees.netAmount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {returnData.fees.netAmount < 0 ? 'Refund Status' : 'Payment Status'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {returnData.fees.netAmount < 0 
                      ? `Refund of $${Math.abs(returnData.fees.netAmount).toFixed(2)} will be processed to customer's original payment method within 3-5 business days.`
                      : `Payment of $${returnData.fees.netAmount.toFixed(2)} is due from customer.`
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Return Processing Timeline</CardTitle>
              <CardDescription>
                Complete history of return processing activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {returnData.timeline.map((event) => (
                  <div key={`${event.timestamp}-${event.event}`} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{event.event}</p>
                        <p className="text-xs text-gray-500">{formatDate(event.timestamp)}</p>
                      </div>
                      <p className="text-sm text-gray-600">{event.details}</p>
                      <p className="text-xs text-gray-500">By: {event.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}