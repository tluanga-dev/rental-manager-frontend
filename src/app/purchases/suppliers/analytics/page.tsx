'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Users, 
  DollarSign,
  TrendingUp,
  Star,
  Building2,
  Award,
  Calendar,
  PieChart
} from 'lucide-react';
import { suppliersApi, SupplierAnalytics } from '@/services/api/suppliers';

function SupplierAnalyticsContent() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<SupplierAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const data = await suppliersApi.getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to load supplier analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <PieChart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics data available</h3>
          <p className="mt-1 text-sm text-gray-500">Analytics data could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Supplier Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Performance insights and supplier metrics
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_suppliers}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.active_suppliers} active ({formatPercentage(analytics.active_suppliers, analytics.total_suppliers)})
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.total_spend)}</div>
            <p className="text-xs text-muted-foreground">
              All time spend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Quality Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.average_quality_rating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Out of 5.0 stars
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.supplier_tier_distribution.preferred}</div>
            <p className="text-xs text-muted-foreground">
              Preferred suppliers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Supplier Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Supplier Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.supplier_type_distribution).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{count}</span>
                    <span className="text-xs text-gray-500">
                      ({formatPercentage(count, analytics.total_suppliers)})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Supplier Tier Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Supplier Tiers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm">Preferred</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{analytics.supplier_tier_distribution.preferred}</span>
                  <span className="text-xs text-gray-500">
                    ({formatPercentage(analytics.supplier_tier_distribution.preferred, analytics.total_suppliers)})
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm">Standard</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{analytics.supplier_tier_distribution.standard}</span>
                  <span className="text-xs text-gray-500">
                    ({formatPercentage(analytics.supplier_tier_distribution.standard, analytics.total_suppliers)})
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm">Restricted</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{analytics.supplier_tier_distribution.restricted}</span>
                  <span className="text-xs text-gray-500">
                    ({formatPercentage(analytics.supplier_tier_distribution.restricted, analytics.total_suppliers)})
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly New Suppliers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Growth Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.monthly_new_suppliers.length > 0 ? (
              <div className="space-y-3">
                {analytics.monthly_new_suppliers.slice(-6).map((month) => (
                  <div key={month.month} className="flex items-center justify-between">
                    <span className="text-sm">{month.month}</span>
                    <span className="text-sm font-medium">{month.count} new</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Calendar className="mx-auto h-8 w-8 mb-2" />
                <p className="text-sm">No growth data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Suppliers by Spend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Top Suppliers by Spend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.top_suppliers_by_spend.length > 0 ? (
            <div className="space-y-4">
              {analytics.top_suppliers_by_spend.slice(0, 10).map((item, index) => (
                <div
                  key={item.supplier.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => router.push(`/purchases/suppliers/${item.supplier.id}`)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {item.supplier.company_name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.supplier.supplier_code} • {item.supplier.supplier_type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(item.total_spend)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.supplier.total_orders} orders
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No spending data</h3>
              <p className="mt-1 text-sm text-gray-500">No supplier spending data available yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SupplierAnalyticsPage() {
  return (
    <ProtectedRoute requiredPermissions={['INVENTORY_VIEW']}>
      <SupplierAnalyticsContent />
    </ProtectedRoute>
  );
}