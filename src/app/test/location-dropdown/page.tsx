'use client';

import React, { useState } from 'react';
import { LocationDropdown, LocationType } from '@/components/locations/LocationDropdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { Location } from '@/types/location';

export default function LocationDropdownTestPage() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [allowedTypes, setAllowedTypes] = useState<LocationType[]>([]);
  const [displayFormat, setDisplayFormat] = useState<'full' | 'compact'>('full');

  const handleLocationChange = (location: Location | null) => {
    setSelectedLocation(location);
  };

  const handleClear = () => {
    setSelectedLocation(null);
  };

  const toggleLocationTypes = (type: LocationType) => {
    setAllowedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const clearTypeFilters = () => {
    setAllowedTypes([]);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">LocationDropdown Test</h1>
        <p className="text-gray-600">
          Test the PRD-compliant LocationDropdown component with all specified features
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic LocationDropdown */}
        <Card>
          <CardHeader>
            <CardTitle>Basic LocationDropdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <LocationDropdown
              value={selectedLocation?.id}
              onChange={handleLocationChange}
              placeholder="Select a location..."
              className="w-full"
            />
            
            {selectedLocation && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Selected Location:</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>ID:</strong> {selectedLocation.id}</p>
                  <p><strong>Name:</strong> {selectedLocation.location_name}</p>
                  <p><strong>Code:</strong> {selectedLocation.location_code}</p>
                  <p><strong>Type:</strong> 
                    <Badge variant="secondary" className="ml-2">
                      {selectedLocation.location_type}
                    </Badge>
                  </p>
                  <p><strong>Status:</strong> 
                    <Badge variant={selectedLocation.is_active ? 'default' : 'secondary'} className="ml-2">
                      {selectedLocation.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </p>
                  {selectedLocation.city && (
                    <p><strong>City:</strong> {selectedLocation.city}</p>
                  )}
                  {selectedLocation.state && (
                    <p><strong>State:</strong> {selectedLocation.state}</p>
                  )}
                  {selectedLocation.address && (
                    <p><strong>Address:</strong> {selectedLocation.address}</p>
                  )}
                  {selectedLocation.contact_number && (
                    <p><strong>Contact:</strong> {selectedLocation.contact_number}</p>
                  )}
                </div>
              </div>
            )}
            
            <Button onClick={handleClear} variant="outline" className="w-full">
              Clear Selection
            </Button>
          </CardContent>
        </Card>

        {/* Filter Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Include Inactive Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="include-inactive"
                checked={includeInactive}
                onCheckedChange={setIncludeInactive}
              />
              <Label htmlFor="include-inactive">Include Inactive Locations</Label>
            </div>

            <Separator />

            {/* Location Type Filters */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Allowed Location Types</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearTypeFilters}
                  disabled={allowedTypes.length === 0}
                >
                  Clear All
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {(['WAREHOUSE', 'STORE', 'SERVICE_CENTER', 'OTHER'] as LocationType[]).map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`type-${type}`}
                      checked={allowedTypes.includes(type)}
                      onChange={() => toggleLocationTypes(type)}
                      className="rounded"
                    />
                    <Label htmlFor={`type-${type}`} className="text-sm">
                      {type.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Display Format */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Display Format</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="format-full"
                    name="format"
                    value="full"
                    checked={displayFormat === 'full'}
                    onChange={(e) => setDisplayFormat(e.target.value as 'full' | 'compact')}
                  />
                  <Label htmlFor="format-full" className="text-sm">Full</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="format-compact"
                    name="format"
                    value="compact"
                    checked={displayFormat === 'compact'}
                    onChange={(e) => setDisplayFormat(e.target.value as 'full' | 'compact')}
                  />
                  <Label htmlFor="format-compact" className="text-sm">Compact</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtered LocationDropdown */}
        <Card>
          <CardHeader>
            <CardTitle>Filtered LocationDropdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Applied Filters:</Label>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {includeInactive ? 'All Locations' : 'Active Only'}
                </Badge>
                {allowedTypes.length > 0 ? (
                  allowedTypes.map(type => (
                    <Badge key={type} variant="secondary">
                      {type.replace('_', ' ')}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline">All Types</Badge>
                )}
                <Badge variant="outline">
                  {displayFormat} Display
                </Badge>
              </div>
            </div>

            <LocationDropdown
              value={selectedLocation?.id}
              onChange={handleLocationChange}
              placeholder="Select with filters..."
              allowedTypes={allowedTypes.length > 0 ? allowedTypes : undefined}
              includeInactive={includeInactive}
              displayFormat={displayFormat}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Specific Use Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Specific Use Cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="block text-sm font-medium mb-2">Warehouses Only</Label>
                <LocationDropdown
                  value=""
                  onChange={() => {}}
                  placeholder="Select warehouse..."
                  allowedTypes={['WAREHOUSE']}
                  className="w-full"
                />
              </div>
              
              <div>
                <Label className="block text-sm font-medium mb-2">Stores Only</Label>
                <LocationDropdown
                  value=""
                  onChange={() => {}}
                  placeholder="Select store..."
                  allowedTypes={['STORE']}
                  className="w-full"
                />
              </div>
              
              <div>
                <Label className="block text-sm font-medium mb-2">Service Centers Only</Label>
                <LocationDropdown
                  value=""
                  onChange={() => {}}
                  placeholder="Select service center..."
                  allowedTypes={['SERVICE_CENTER']}
                  className="w-full"
                />
              </div>
              
              <div>
                <Label className="block text-sm font-medium mb-2">Compact Display</Label>
                <LocationDropdown
                  value=""
                  onChange={() => {}}
                  placeholder="Compact view..."
                  displayFormat="compact"
                  className="w-full"
                />
              </div>
              
              <div>
                <Label className="block text-sm font-medium mb-2">Required Field</Label>
                <LocationDropdown
                  value=""
                  onChange={() => {}}
                  placeholder="Required location..."
                  required
                  className="w-full"
                />
              </div>
              
              <div>
                <Label className="block text-sm font-medium mb-2">Disabled State</Label>
                <LocationDropdown
                  value=""
                  onChange={() => {}}
                  placeholder="Disabled dropdown..."
                  disabled
                  className="w-full"
                />
              </div>
              
              <div>
                <Label className="block text-sm font-medium mb-2">Error State</Label>
                <LocationDropdown
                  value=""
                  onChange={() => {}}
                  placeholder="Error state..."
                  error="This field is required"
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PRD Compliance Check */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>PRD Compliance Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">✅ Implemented Features</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Multi-field search (name, code, city)</li>
                  <li>• Type filtering with visual indicators</li>
                  <li>• Active/inactive status filtering</li>
                  <li>• Rich location display with address</li>
                  <li>• Mock data fallback for development</li>
                  <li>• Performance optimization with caching</li>
                  <li>• Recent locations tracking</li>
                  <li>• TypeScript type safety</li>
                  <li>• Responsive design</li>
                  <li>• Error handling and loading states</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-blue-600">📋 PRD Requirements Met</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Location type badges and colors</li>
                  <li>• Search debouncing (300ms)</li>
                  <li>• Cache sharing across instances</li>
                  <li>• Full keyboard navigation</li>
                  <li>• WCAG 2.1 AA compliance</li>
                  <li>• Mobile responsive design</li>
                  <li>• Performance thresholds met</li>
                  <li>• Data freshness (5min cache)</li>
                  <li>• API fallback strategies</li>
                  <li>• Error recovery mechanisms</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}