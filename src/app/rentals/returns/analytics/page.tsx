'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { returnsApi } from '@/services/api/returns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Clock, 
  AlertCircle,
  BarChart3,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


export default function ReturnAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30');

  // Fetch analytics data
  const { data: analytics, isLoading, error, refetch } = useQuery({
    queryKey: ['return-analytics', dateRange],
    queryFn: () => returnsApi.getAnalytics(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const calculatePercentageChange = (current: number, previous: number) => {
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getChangeIcon = (current: number, previous: number, reverse = false) => {
    const change = current - previous;
    const isPositive = reverse ? change < 0 : change > 0;
    return isPositive ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getChangeColor = (current: number, previous: number, reverse = false) => {
    const change = current - previous;
    const isPositive = reverse ? change < 0 : change > 0;
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Return Analytics</h1>
            <p className="text-muted-foreground">
              Analyze return patterns, fees, and performance metrics
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Analytics</h3>
              <p className="text-gray-600 mb-4">Failed to load return analytics data.</p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Cards */}
      {analytics && (
        <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Returns</p>
                <p className="text-2xl font-bold">{analytics.total_returns.toLocaleString()}</p>
                <div className="flex items-center space-x-1 mt-1">
                  {getChangeIcon(analytics.monthly_trends.returns_this_month, analytics.monthly_trends.returns_last_month)}
                  <span className={`text-sm ${getChangeColor(analytics.monthly_trends.returns_this_month, analytics.monthly_trends.returns_last_month)}`}>
                    {calculatePercentageChange(analytics.monthly_trends.returns_this_month, analytics.monthly_trends.returns_last_month)}%
                  </span>
                  <span className="text-sm text-gray-500">vs last month</span>
                </div>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fees Collected</p>
                <p className="text-2xl font-bold">${analytics.total_fees_collected.toLocaleString()}</p>
                <div className="flex items-center space-x-1 mt-1">
                  {getChangeIcon(analytics.monthly_trends.fees_this_month, analytics.monthly_trends.fees_last_month)}
                  <span className={`text-sm ${getChangeColor(analytics.monthly_trends.fees_this_month, analytics.monthly_trends.fees_last_month)}`}>
                    {calculatePercentageChange(analytics.monthly_trends.fees_this_month, analytics.monthly_trends.fees_last_month)}%
                  </span>
                  <span className="text-sm text-gray-500">vs last month</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Processing Time</p>
                <p className="text-2xl font-bold">{analytics.average_processing_time} days</p>
                <div className="flex items-center space-x-1 mt-1">
                  {getChangeIcon(analytics.monthly_trends.avg_time_this_month, analytics.monthly_trends.avg_time_last_month, true)}
                  <span className={`text-sm ${getChangeColor(analytics.monthly_trends.avg_time_this_month, analytics.monthly_trends.avg_time_last_month, true)}`}>
                    {calculatePercentageChange(analytics.monthly_trends.avg_time_this_month, analytics.monthly_trends.avg_time_last_month)}%
                  </span>
                  <span className="text-sm text-gray-500">vs last month</span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Damage Rate</p>
                <p className="text-2xl font-bold">{analytics.damage_rate}%</p>
                <Badge variant="outline" className="mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Monitor closely
                </Badge>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On-Time Return Rate</p>
                <p className="text-2xl font-bold">{analytics.on_time_return_rate}%</p>
                <Badge variant="outline" className="mt-1 text-green-600 border-green-600">
                  Excellent
                </Badge>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Customer Satisfaction</p>
                <p className="text-2xl font-bold">{analytics.customer_satisfaction}/5.0</p>
                <div className="flex items-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div
                      key={star}
                      className={`h-3 w-3 ${star <= analytics.customer_satisfaction ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ⭐
                    </div>
                  ))}
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Damage Types Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Top Damage Types</CardTitle>
          <CardDescription>
            Most common types of damage and their associated costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Damage Type</TableHead>
                  <TableHead>Occurrences</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Avg Cost</TableHead>
                  <TableHead>Total Impact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.top_damage_types.map((damage) => (
                  <TableRow key={damage.type}>
                    <TableCell className="font-medium">{damage.type}</TableCell>
                    <TableCell>{damage.count}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${damage.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm">{damage.percentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell>${damage.avg_cost.toFixed(2)}</TableCell>
                    <TableCell className="font-medium">
                      ${(damage.count * damage.avg_cost).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Top Customers by Returns */}
      <Card>
        <CardHeader>
          <CardTitle>Customers with Most Returns</CardTitle>
          <CardDescription>
            Customer performance and fee analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total Returns</TableHead>
                  <TableHead>Total Fees</TableHead>
                  <TableHead>Avg per Return</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Risk Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.top_customers_by_returns.map((customer) => (
                  <TableRow key={customer.customer_name}>
                    <TableCell className="font-medium">{customer.customer_name}</TableCell>
                    <TableCell>{customer.returns_count}</TableCell>
                    <TableCell>${customer.total_fees.toFixed(2)}</TableCell>
                    <TableCell>${(customer.total_fees / customer.returns_count).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <span>{customer.avg_rating}/5.0</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <div
                              key={star}
                              className={`h-3 w-3 ${star <= customer.avg_rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                              ⭐
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          customer.avg_rating >= 4.0 ? 'text-green-600 border-green-600' :
                          customer.avg_rating >= 3.0 ? 'text-yellow-600 border-yellow-600' :
                          'text-red-600 border-red-600'
                        }
                      >
                        {customer.avg_rating >= 4.0 ? 'Low' : customer.avg_rating >= 3.0 ? 'Medium' : 'High'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
}