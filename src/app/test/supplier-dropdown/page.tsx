'use client';

import React, { useState } from 'react';
import { SupplierDropdown } from '@/components/suppliers/SupplierDropdown';
import { Supplier } from '@/types/supplier';

export default function SupplierDropdownTestPage() {
  const [selectedSupplier1, setSelectedSupplier1] = useState<string>('');
  const [selectedSupplier2, setSelectedSupplier2] = useState<string>('');
  const [selectedSupplier3, setSelectedSupplier3] = useState<string>('');
  const [selectedSupplier4, setSelectedSupplier4] = useState<string>('');
  const [formData, setFormData] = useState({
    supplier: '',
    notes: '',
  });

  const handleSupplierChange = (id: string, supplier: Supplier) => {
    console.log('Selected supplier:', { id, supplier });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Supplier Dropdown Component Test
        </h1>
        
        <div className="space-y-8">
          {/* Basic Usage */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Usage</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Supplier
                </label>
                <SupplierDropdown
                  value={selectedSupplier1}
                  onChange={(id, supplier) => {
                    setSelectedSupplier1(id);
                    handleSupplierChange(id, supplier);
                  }}
                  placeholder="Search for a supplier..."
                />
              </div>
              
              <div className="text-sm text-gray-600">
                Selected: {selectedSupplier1 || 'None'}
              </div>
            </div>
          </div>

          {/* Different Sizes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Different Sizes</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Small
                </label>
                <SupplierDropdown
                  size="small"
                  placeholder="Small dropdown"
                  value={selectedSupplier2}
                  onChange={(id) => setSelectedSupplier2(id)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medium (Default)
                </label>
                <SupplierDropdown
                  size="medium"
                  placeholder="Medium dropdown"
                  value={selectedSupplier3}
                  onChange={(id) => setSelectedSupplier3(id)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Large
                </label>
                <SupplierDropdown
                  size="large"
                  placeholder="Large dropdown"
                  value={selectedSupplier4}
                  onChange={(id) => setSelectedSupplier4(id)}
                />
              </div>
            </div>
          </div>

          {/* Error States */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Error States</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  With Error
                </label>
                <SupplierDropdown
                  error
                  helperText="Please select a supplier"
                  placeholder="Error state"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disabled
                </label>
                <SupplierDropdown
                  disabled
                  placeholder="Disabled state"
                />
              </div>
            </div>
          </div>

          {/* Configuration Options */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Configuration Options</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Non-searchable
                </label>
                <SupplierDropdown
                  searchable={false}
                  placeholder="Click to select"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Not clearable
                </label>
                <SupplierDropdown
                  clearable={false}
                  placeholder="No clear button"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Include inactive suppliers
                </label>
                <SupplierDropdown
                  includeInactive
                  showStatus
                  placeholder="Includes inactive"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hide supplier codes
                </label>
                <SupplierDropdown
                  showCode={false}
                  placeholder="Names only"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Virtual scrolling (for large datasets)
                </label>
                <SupplierDropdown
                  virtualScroll={true}
                  maxResults={1000}
                  placeholder="With virtual scrolling"
                />
              </div>
            </div>
          </div>

          {/* Form Integration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Form Integration</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier *
                </label>
                <SupplierDropdown
                  name="supplier"
                  required
                  fullWidth
                  value={formData.supplier}
                  onChange={(id) => setFormData(prev => ({ ...prev, supplier: id }))}
                  placeholder="Select a supplier..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Additional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  alert(`Form data: ${JSON.stringify(formData, null, 2)}`);
                }}
              >
                Submit
              </button>
            </form>
          </div>

          {/* Multiple Instances (Cache Test) */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Multiple Instances (Cache Sharing Test)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instance 1
                </label>
                <SupplierDropdown
                  placeholder="First instance"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instance 2
                </label>
                <SupplierDropdown
                  placeholder="Second instance"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instance 3
                </label>
                <SupplierDropdown
                  placeholder="Third instance"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instance 4
                </label>
                <SupplierDropdown
                  placeholder="Fourth instance"
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              These instances share the same cache. After the first load, subsequent instances should display data immediately.
            </p>
          </div>

          {/* Performance Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Performance Information</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Open browser DevTools to see React Query cache in action</p>
              <p>• Search is debounced by 300ms for optimal performance</p>
              <p>• Data is cached for 2 minutes, stale for 10 minutes</p>
              <p>• Multiple instances share the same cache</p>
              <p>• Keyboard navigation is supported (Arrow keys, Enter, Escape)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}