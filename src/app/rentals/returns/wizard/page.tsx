'use client';

import { Suspense } from 'react';
import { ReturnWizard } from '@/components/returns/return-wizard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw } from 'lucide-react';

export default function ReturnWizardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <RotateCcw className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Process Return</h1>
          <p className="text-muted-foreground">
            Process equipment returns with inspection and fee calculation
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Return Processing Wizard</CardTitle>
          <CardDescription>
            Follow the step-by-step process to handle equipment returns efficiently
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Suspense fallback={
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
          }>
            <ReturnWizard 
              onComplete={(returnData) => {
                console.log('Return completed:', returnData);
                // Handle successful return completion
              }}
              onCancel={() => {
                console.log('Return cancelled');
                // Handle cancellation
              }}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}