"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle2, Clock, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useBatchPurchaseStore, useAutoSave } from '@/stores/batch-purchase-store';
import { WIZARD_STEPS } from '@/types/batch-purchase';

import { PurchaseDetailsStep } from './steps/purchase-details-step';
import { ItemManagementStep } from './steps/item-management-step';
import { PurchaseItemsStep } from './steps/purchase-items-step';
import { ReviewSubmitStep } from './steps/review-submit-step';

export function BatchPurchaseWizard() {
  const router = useRouter();
  
  // Store hooks
  const {
    current_step,
    is_validating,
    is_submitting,
    save_status,
    has_unsaved_changes,
    last_saved,
    setCurrentStep,
    nextStep,
    previousStep,
    canGoToStep,
    validateCurrentStep,
    submitPurchase,
    reset,
    getTotalAmount,
    getItemsCount,
  } = useBatchPurchaseStore();

  // Auto-save functionality
  useAutoSave();

  // Load draft on mount
  useEffect(() => {
    useBatchPurchaseStore.getState().loadDraft();
  }, []);

  const currentStepData = WIZARD_STEPS.find(step => step.id === current_step);
  const progress = ((current_step - 1) / (WIZARD_STEPS.length - 1)) * 100;

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      nextStep();
    }
  };

  const handlePrevious = () => {
    previousStep();
  };

  const handleStepClick = async (stepId: number) => {
    if (canGoToStep(stepId)) {
      // Validate current step before jumping
      if (stepId > current_step) {
        const isValid = await validateCurrentStep();
        if (!isValid) return;
      }
      setCurrentStep(stepId);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await submitPurchase();
      
      // Redirect to transaction details
      router.push(`/transactions/${response.transaction_id}`);
    } catch (error) {
      console.error('Failed to submit purchase:', error);
      // Error handling is done in the component
    }
  };

  const handleCancel = () => {
    if (has_unsaved_changes) {
      const confirmCancel = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel?'
      );
      if (!confirmCancel) return;
    }
    
    reset();
    router.push('/purchases');
  };

  const renderSaveStatus = () => {
    switch (save_status) {
      case 'saving':
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 animate-spin" />
            Saving...
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            Saved {last_saved && new Intl.DateTimeFormat('en-US', { 
              timeStyle: 'short' 
            }).format(last_saved)}
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            Save failed
          </div>
        );
      default:
        return has_unsaved_changes ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Save className="h-4 w-4" />
            Unsaved changes
          </div>
        ) : null;
    }
  };

  const renderStepContent = () => {
    switch (current_step) {
      case 1:
        return <PurchaseDetailsStep />;
      case 2:
        return <ItemManagementStep />;
      case 3:
        return <PurchaseItemsStep />;
      case 4:
        return <ReviewSubmitStep onSubmit={handleSubmit} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Purchase with Items</h1>
          <p className="text-muted-foreground mt-1">
            Create a purchase and add new items and SKUs in one workflow
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {renderSaveStatus()}
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm font-medium">
              <span>{currentStepData?.title}</span>
              <span>Step {current_step} of {WIZARD_STEPS.length}</span>
            </div>
            
            <Progress value={progress} className="h-2" />
            
            {/* Step Navigation */}
            <div className="flex justify-between">
              {WIZARD_STEPS.map((step) => {
                const isActive = step.id === current_step;
                const isComplete = step.id < current_step;
                const canAccess = canGoToStep(step.id);
                
                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(step.id)}
                    disabled={!canAccess}
                    className={`
                      flex flex-col items-center gap-1 p-2 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : isComplete 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : canAccess
                            ? 'hover:bg-muted'
                            : 'opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${isActive 
                        ? 'bg-primary-foreground text-primary' 
                        : isComplete 
                          ? 'bg-green-600 text-white'
                          : 'bg-muted text-muted-foreground'
                      }
                    `}>
                      {isComplete ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                    </div>
                    <span className="text-xs font-medium">{step.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Bar */}
      {getItemsCount() > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{getItemsCount()} items</Badge>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="text-sm">
                  <span className="text-muted-foreground">Total: </span>
                  <span className="font-semibold">
                    ${getTotalAmount().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{currentStepData?.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="py-4">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={current_step === 1 || is_validating || is_submitting}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {current_step < WIZARD_STEPS.length ? (
                <Button
                  onClick={handleNext}
                  disabled={is_validating || is_submitting}
                  className="min-w-24"
                >
                  {is_validating ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    'Next'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={is_validating || is_submitting}
                  className="min-w-24"
                >
                  {is_submitting ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Purchase'
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}