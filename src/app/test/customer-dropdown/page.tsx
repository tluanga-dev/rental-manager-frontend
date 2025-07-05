'use client';

import React, { useState } from 'react';
import { CustomerDropdown } from '@/components/customers/CustomerDropdown/CustomerDropdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Customer } from '@/types/customer';

export default function CustomerDropdownTestPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedCustomerData, setSelectedCustomerData] = useState<Customer | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCustomerChange = (customerId: string, customerData: Customer) => {
    setSelectedCustomer(customerId);
    setSelectedCustomerData(customerData);
  };

  const handleClear = () => {
    setSelectedCustomer('');
    setSelectedCustomerData(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Customer Dropdown Test</h1>
        <p className="text-gray-600">
          Test the CustomerDropdown component with different configurations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Customer Dropdown */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Customer Dropdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CustomerDropdown
              value={selectedCustomer}
              onChange={handleCustomerChange}
              placeholder="Select a customer..."
              fullWidth
              searchable
              clearable
              showCode
              showTier
            />
            
            {selectedCustomerData && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Selected Customer:</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>ID:</strong> {selectedCustomerData.id}</p>
                  <p><strong>Name:</strong> {selectedCustomerData.name}</p>
                  <p><strong>Code:</strong> {selectedCustomerData.code}</p>
                  <p><strong>Type:</strong> {selectedCustomerData.type}</p>
                  <p><strong>Tier:</strong> 
                    <Badge variant="secondary" className="ml-2">
                      {selectedCustomerData.tier}
                    </Badge>
                  </p>
                  <p><strong>Status:</strong> 
                    <Badge variant={selectedCustomerData.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                      {selectedCustomerData.status}
                    </Badge>
                  </p>
                  <p><strong>Blacklist Status:</strong> 
                    <Badge variant={selectedCustomerData.blacklist_status === 'CLEAR' ? 'default' : 'destructive'} className="ml-2">
                      {selectedCustomerData.blacklist_status}
                    </Badge>
                  </p>
                  {selectedCustomerData.credit_limit && (
                    <p><strong>Credit Limit:</strong> ₹{selectedCustomerData.credit_limit.toLocaleString()}</p>
                  )}
                  {selectedCustomerData.last_transaction_date && (
                    <p><strong>Last Transaction:</strong> {new Date(selectedCustomerData.last_transaction_date).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            )}
            
            <Button onClick={handleClear} variant="outline" className="w-full">
              Clear Selection
            </Button>
          </CardContent>
        </Card>

        {/* Advanced Customer Dropdown */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced Customer Dropdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Button
                onClick={() => setShowAdvanced(!showAdvanced)}
                variant={showAdvanced ? "default" : "outline"}
                size="sm"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced Features
              </Button>
            </div>

            {showAdvanced && (
              <CustomerDropdown
                value={selectedCustomer}
                onChange={handleCustomerChange}
                placeholder="Advanced customer search..."
                fullWidth
                searchable
                clearable
                virtualScroll
                showCode
                showTier
                showCreditInfo
                showLastTransaction
                allowAddNew
                includeInactive
                excludeBlacklisted={false}
                customerType="all"
                maxResults={50}
                showRecentCustomers
                recentCustomersLimit={3}
                size="large"
              />
            )}
            
            {!showAdvanced && (
              <div className="p-8 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                Click "Show Advanced Features" to see the advanced dropdown
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filter Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Testing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Business Customers Only</label>
                <CustomerDropdown
                  value=""
                  onChange={() => {}}
                  placeholder="Business customers only..."
                  customerType="BUSINESS"
                  fullWidth
                  searchable
                  showCode
                  showTier
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Individual Customers Only</label>
                <CustomerDropdown
                  value=""
                  onChange={() => {}}
                  placeholder="Individual customers only..."
                  customerType="INDIVIDUAL"
                  fullWidth
                  searchable
                  showCode
                  showTier
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Exclude Blacklisted</label>
                <CustomerDropdown
                  value=""
                  onChange={() => {}}
                  placeholder="No blacklisted customers..."
                  excludeBlacklisted
                  fullWidth
                  searchable
                  showCode
                  showTier
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Gold+ Customers Only</label>
                <CustomerDropdown
                  value=""
                  onChange={() => {}}
                  placeholder="Gold tier and above..."
                  minTier="GOLD"
                  fullWidth
                  searchable
                  showCode
                  showTier
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Testing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Virtual Scrolling (Large Lists)</label>
                <CustomerDropdown
                  value=""
                  onChange={() => {}}
                  placeholder="Virtual scrolling test..."
                  virtualScroll
                  maxResults={100}
                  fullWidth
                  searchable
                  showCode
                  showTier
                  showCreditInfo
                  showLastTransaction
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Compact View</label>
                <CustomerDropdown
                  value=""
                  onChange={() => {}}
                  placeholder="Compact view..."
                  size="small"
                  fullWidth
                  searchable
                  showCode={false}
                  showTier
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Disabled State</label>
                <CustomerDropdown
                  value=""
                  onChange={() => {}}
                  placeholder="Disabled dropdown..."
                  disabled
                  fullWidth
                  showCode
                  showTier
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Error State</label>
                <CustomerDropdown
                  value=""
                  onChange={() => {}}
                  placeholder="Error state..."
                  error
                  helperText="This is an error message"
                  fullWidth
                  showCode
                  showTier
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}