'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Printer,
  Download,
  RefreshCw,
  X,
  CreditCard,
  FileText,
  Package,
  User,
  Calendar,
  MapPin,
} from 'lucide-react';
import { salesApi } from '@/api/sales';
import { TransactionHeader } from '@/types/api';

function SaleDetailContent() {
  const params = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<TransactionHeader | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTransaction();
  }, [params.id]);

  const loadTransaction = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await salesApi.getTransaction(params.id as string);
      setTransaction(data);
    } catch (err) {
      setError('Failed to load transaction details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      DRAFT: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      CONFIRMED: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
      IN_PROGRESS: { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
      COMPLETED: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    };

    const config = statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      PARTIAL: { color: 'bg-orange-100 text-orange-800', label: 'Partial' },
      PAID: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      REFUNDED: { color: 'bg-red-100 text-red-800', label: 'Refunded' },
    };

    const config = statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Transaction</h3>
            <p className="text-gray-600 mb-4">{error || 'Transaction not found'}</p>
            <Button onClick={() => router.push('/sales/history')}>
              Back to Sales History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/sales/history')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Sale #{transaction.transaction_number}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Transaction details and history
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getStatusBadge(transaction.status)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Payment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getPaymentStatusBadge(transaction.payment_status)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(transaction.total_amount)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{formatDate(transaction.transaction_date)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">
                    {transaction.customer?.first_name} {transaction.customer?.last_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span>{transaction.customer?.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span>{transaction.customer?.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer Type:</span>
                  <span className="capitalize">{transaction.customer?.customer_type || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Transaction Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{transaction.transaction_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span>{transaction.location?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created By:</span>
                  <span>{transaction.created_by || 'System'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Notes:</span>
                  <span className="text-right max-w-xs">{transaction.notes || 'No notes'}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(transaction.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span className="text-red-600">
                    -{formatCurrency(transaction.discount_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({(transaction.tax_rate * 100).toFixed(0)}%):</span>
                  <span>{formatCurrency(transaction.tax_amount)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(transaction.total_amount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transaction.lines?.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>{line.sku?.item_master?.name || 'N/A'}</TableCell>
                      <TableCell>{line.sku?.sku_code}</TableCell>
                      <TableCell>{line.quantity}</TableCell>
                      <TableCell>{formatCurrency(line.unit_price)}</TableCell>
                      <TableCell>{line.discount_percentage}%</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(line.line_total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                      <span className="font-medium">Initial Payment</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Amount: </span>
                      <span className="font-medium">{formatCurrency(transaction.amount_paid)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Method: </span>
                      <span>{transaction.payment_method || 'Cash'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date: </span>
                      <span>{formatDate(transaction.transaction_date)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Reference: </span>
                      <span>{transaction.payment_reference || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {transaction.payment_status !== 'PAID' && (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">Outstanding Balance: {formatCurrency(transaction.total_amount - transaction.amount_paid)}</p>
                    <Button>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Process Payment
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  {/* Timeline items */}
                  <div className="space-y-6">
                    <div className="relative flex items-start">
                      <div className="absolute left-4 w-2 h-2 bg-blue-500 rounded-full -translate-x-1/2"></div>
                      <div className="ml-10">
                        <p className="font-medium">Transaction Created</p>
                        <p className="text-sm text-gray-600">{formatDate(transaction.created_at)}</p>
                        <p className="text-sm">Sale transaction initiated</p>
                      </div>
                    </div>

                    {transaction.status === 'COMPLETED' && (
                      <div className="relative flex items-start">
                        <div className="absolute left-4 w-2 h-2 bg-green-500 rounded-full -translate-x-1/2"></div>
                        <div className="ml-10">
                          <p className="font-medium">Transaction Completed</p>
                          <p className="text-sm text-gray-600">{formatDate(transaction.updated_at)}</p>
                          <p className="text-sm">Payment received and items delivered</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SaleDetailPage() {
  return (
    <ProtectedRoute requiredPermissions={['SALE_VIEW']}>
      <SaleDetailContent />
    </ProtectedRoute>
  );
}