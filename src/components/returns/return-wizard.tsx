'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  Package, 
  Search, 
  Eye, 
  Calculator, 
  FileText, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { ReturnWizardData, ReturnType, OutstandingRental, ReturnSummary } from '@/types/returns';

interface ReturnWizardProps {
  onComplete: (data: ReturnWizardData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

type WizardStep = 'search' | 'selection' | 'inspection' | 'calculation' | 'review' | 'complete';

const steps: Array<{ id: WizardStep; title: string; icon: any; description: string }> = [
  { 
    id: 'search', 
    title: 'Find Rental', 
    icon: Search, 
    description: 'Locate the rental transaction' 
  },
  { 
    id: 'selection', 
    title: 'Select Items', 
    icon: Package, 
    description: 'Choose items to return' 
  },
  { 
    id: 'inspection', 
    title: 'Inspection', 
    icon: Eye, 
    description: 'Assess item condition' 
  },
  { 
    id: 'calculation', 
    title: 'Calculate Fees', 
    icon: Calculator, 
    description: 'Compute charges and refunds' 
  },
  { 
    id: 'review', 
    title: 'Review', 
    icon: FileText, 
    description: 'Confirm return details' 
  },
  { 
    id: 'complete', 
    title: 'Complete', 
    icon: CheckCircle, 
    description: 'Process return' 
  },
];

export function ReturnWizard({
  onComplete,
  onCancel,
  isLoading,
}: ReturnWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('search');
  const [wizardData, setWizardData] = useState<ReturnWizardData>({
    rental_transaction_id: '',
    return_type: 'PARTIAL',
    selected_items: [],
    inspection_data: {},
    fee_calculations: [],
    customer_acknowledgment: false,
  });

  const [selectedRental, setSelectedRental] = useState<any>(null); // Mock rental data
  const [outstandingItems, setOutstandingItems] = useState<OutstandingRental[]>([]);

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 'search':
        return !!selectedRental;
      case 'selection':
        return wizardData.selected_items.length > 0;
      case 'inspection':
        return Object.keys(wizardData.inspection_data).length === wizardData.selected_items.length;
      case 'calculation':
        return wizardData.fee_calculations.length === wizardData.selected_items.length;
      case 'review':
        return wizardData.customer_acknowledgment;
      case 'complete':
        return false;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;
    
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const handleStepClick = (stepId: WizardStep) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    // Only allow going back or to current step
    if (stepIndex <= currentStepIndex) {
      setCurrentStep(stepId);
    }
  };

  const updateWizardData = (updates: Partial<ReturnWizardData>) => {
    setWizardData(prev => ({ ...prev, ...updates }));
  };

  const calculateReturnSummary = (): ReturnSummary => {
    const totalItemsReturned = wizardData.selected_items.reduce((sum, item) => sum + item.quantity_to_return, 0);
    const totalItemsOutstanding = outstandingItems.reduce((sum, item) => sum + item.quantity_outstanding, 0) - totalItemsReturned;
    
    const totalLateFees = wizardData.fee_calculations.reduce((sum, calc) => sum + calc.late_fee_amount, 0);
    const totalDamageCosts = wizardData.fee_calculations.reduce((sum, calc) => sum + calc.damage_cost, 0);
    const totalCleaningCosts = wizardData.fee_calculations.reduce((sum, calc) => sum + calc.cleaning_cost, 0);
    const totalDepositRefund = wizardData.fee_calculations.reduce((sum, calc) => sum + calc.deposit_refund, 0);
    
    const totalDepositHeld = outstandingItems.reduce((sum, item) => 
      sum + (item.deposit_per_unit * item.quantity_outstanding), 0
    );
    
    const netAmountDue = totalLateFees + totalDamageCosts + totalCleaningCosts - totalDepositRefund;

    return {
      total_items_returned: totalItemsReturned,
      total_items_outstanding: totalItemsOutstanding,
      total_late_fees: totalLateFees,
      total_damage_costs: totalDamageCosts,
      total_cleaning_costs: totalCleaningCosts,
      total_deposit_held: totalDepositHeld,
      total_deposit_refund: totalDepositRefund,
      net_amount_due: netAmountDue,
    };
  };

  const handleComplete = () => {
    onComplete(wizardData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getReturnTypeDisplay = (type: ReturnType) => {
    const displays = {
      PARTIAL: { title: 'Partial Return', color: 'bg-blue-100 text-blue-800' },
      FULL: { title: 'Full Return', color: 'bg-green-100 text-green-800' },
      EARLY: { title: 'Early Return', color: 'bg-purple-100 text-purple-800' },
      DAMAGED: { title: 'Damaged Return', color: 'bg-red-100 text-red-800' },
      LOST: { title: 'Lost Item', color: 'bg-gray-100 text-gray-800' },
    };
    return displays[type];
  };

  const returnDisplay = getReturnTypeDisplay(wizardData.return_type);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge className={returnDisplay.color}>
                  {returnDisplay.title}
                </Badge>
                <div>
                  <h1 className="text-2xl font-bold">Return Processing Wizard</h1>
                  <p className="text-muted-foreground">
                    Process rental returns with inspection and fee calculation
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Progress Steps */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  Step {currentStepIndex + 1} of {steps.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              
              {/* Step indicators */}
              <div className="flex justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = step.id === currentStep;
                  const isCompleted = index < currentStepIndex;
                  const isAccessible = index <= currentStepIndex;
                  
                  return (
                    <div
                      key={step.id}
                      className={`flex flex-col items-center space-y-2 cursor-pointer ${
                        isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                      }`}
                      onClick={() => isAccessible && handleStepClick(step.id)}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isActive
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : isCompleted
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'bg-white border-gray-300 text-gray-400'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <div className={`text-sm font-medium ${
                          isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          {step.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {step.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Step Content */}
          <div className="lg:col-span-2">
            <Card className="min-h-[600px]">
              <CardHeader>
                <CardTitle>
                  {steps.find(s => s.id === currentStep)?.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentStep === 'search' && (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Search for the rental transaction to process returns.
                    </p>
                    
                    {/* Rental Search Component would go here */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium mb-2">Find Rental Transaction</h3>
                      <p className="text-muted-foreground mb-4">
                        Search by transaction number, customer name, or phone
                      </p>
                      <Button variant="outline" onClick={() => {
                        // Mock selection
                        setSelectedRental({ id: '123', customer: 'John Doe', items: 3 });
                        setOutstandingItems([
                          {
                            transaction_id: '123',
                            transaction_line_id: '1',
                            sku_id: 'SKU001',
                            sku_code: 'CAM-001',
                            item_name: 'Professional Camera',
                            quantity_rented: 2,
                            quantity_returned: 0,
                            quantity_outstanding: 2,
                            rental_start_date: '2024-01-01',
                            rental_end_date: '2024-01-05',
                            days_overdue: 3,
                            daily_rate: 500,
                            deposit_per_unit: 2000,
                            customer_id: '1',
                            customer_name: 'John Doe',
                            location_id: '1',
                            estimated_late_fee: 2250, // 3 days * 500 * 1.5
                          }
                        ]);
                      }}>
                        Search Rentals
                      </Button>
                    </div>

                    {selectedRental && (
                      <Card className="bg-green-50 border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Transaction #{selectedRental.id}</h4>
                              <p className="text-sm text-muted-foreground">
                                Customer: {selectedRental.customer}
                              </p>
                            </div>
                            <Badge variant="outline">
                              {selectedRental.items} items rented
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {currentStep === 'selection' && (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Select which items are being returned and their quantities.
                    </p>
                    
                    {/* Item Selection Component would go here */}
                    <div className="space-y-4">
                      {outstandingItems.map((item) => (
                        <Card key={item.sku_id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium">{item.item_name}</div>
                              <div className="text-sm text-muted-foreground">
                                SKU: {item.sku_code}
                              </div>
                              <div className="text-sm">
                                Outstanding: {item.quantity_outstanding} units
                              </div>
                              {item.days_overdue > 0 && (
                                <div className="flex items-center space-x-2 mt-1">
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                  <span className="text-red-600 text-sm">
                                    {item.days_overdue} days overdue
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="text-right space-y-2">
                              <div className="text-sm">
                                Daily Rate: {formatCurrency(item.daily_rate)}
                              </div>
                              {item.days_overdue > 0 && (
                                <div className="text-sm text-red-600">
                                  Est. Late Fee: {formatCurrency(item.estimated_late_fee)}
                                </div>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Mock selection
                                  updateWizardData({
                                    selected_items: [{
                                      transaction_line_id: item.transaction_line_id,
                                      sku_id: item.sku_id,
                                      quantity_to_return: item.quantity_outstanding,
                                      return_date: new Date().toISOString(),
                                      condition_after: 'B',
                                      defects: [],
                                    }]
                                  });
                                }}
                              >
                                Select for Return
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 'inspection' && (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Inspect each returned item and document its condition.
                    </p>
                    
                    {/* Inspection Component would go here */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium mb-2">Item Inspection</h3>
                      <p className="text-muted-foreground mb-4">
                        Document condition and any defects
                      </p>
                      <Button variant="outline" onClick={() => {
                        // Mock inspection data
                        updateWizardData({
                          inspection_data: {
                            '1': {
                              id: '1',
                              return_line_id: '1',
                              inspector_id: 'staff1',
                              inspection_date: new Date().toISOString(),
                              pre_rental_photos: [],
                              post_rental_photos: [],
                              comparison_notes: 'Minor wear on corners',
                              overall_condition: 'B',
                              functional_check_passed: true,
                              cosmetic_check_passed: true,
                              accessories_complete: true,
                              packaging_condition: 'GOOD',
                              recommended_action: 'MINOR_CLEANING',
                              customer_acknowledgment: true,
                              dispute_raised: false,
                            }
                          }
                        });
                      }}>
                        Start Inspection
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 'calculation' && (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Calculate late fees, damage costs, and deposit refunds.
                    </p>
                    
                    {/* Fee Calculation Component would go here */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium mb-2">Fee Calculation</h3>
                      <p className="text-muted-foreground mb-4">
                        Compute all charges and refunds
                      </p>
                      <Button variant="outline" onClick={() => {
                        // Mock calculation
                        updateWizardData({
                          fee_calculations: [{
                            line_id: '1',
                            sku_id: 'SKU001',
                            quantity_returned: 2,
                            days_overdue: 3,
                            daily_rate: 500,
                            late_fee_rate: 750, // 150% of daily rate
                            late_fee_amount: 2250, // 3 days * 750 * 1 unit
                            damage_cost: 0,
                            cleaning_cost: 200,
                            deposit_per_unit: 2000,
                            deposit_refund: 3800, // 4000 - 200 cleaning
                            net_refund: 1550, // 3800 - 2250 late fee
                          }]
                        });
                      }}>
                        Calculate Fees
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 'review' && (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Review all return details and get customer acknowledgment.
                    </p>
                    
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Return Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {(() => {
                            const summary = calculateReturnSummary();
                            return (
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span>Items Returned:</span>
                                  <span>{summary.total_items_returned}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Items Still Outstanding:</span>
                                  <span>{summary.total_items_outstanding}</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                  <span>Late Fees:</span>
                                  <span>{formatCurrency(summary.total_late_fees)}</span>
                                </div>
                                <div className="flex justify-between text-orange-600">
                                  <span>Cleaning Costs:</span>
                                  <span>{formatCurrency(summary.total_cleaning_costs)}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                  <span>Deposit Refund:</span>
                                  <span>{formatCurrency(summary.total_deposit_refund)}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between font-bold">
                                  <span>Net Amount:</span>
                                  <span className={summary.net_amount_due > 0 ? 'text-red-600' : 'text-green-600'}>
                                    {summary.net_amount_due > 0 ? 'Due: ' : 'Refund: '}
                                    {formatCurrency(Math.abs(summary.net_amount_due))}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </CardContent>
                      </Card>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="customer_ack"
                          checked={wizardData.customer_acknowledgment}
                          onChange={(e) => updateWizardData({ customer_acknowledgment: e.target.checked })}
                          className="rounded"
                        />
                        <label htmlFor="customer_ack" className="text-sm">
                          Customer acknowledges and agrees to the return details
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 'complete' && (
                  <div className="text-center space-y-4">
                    <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
                    <h3 className="text-xl font-semibold">Return Processed Successfully!</h3>
                    <p className="text-muted-foreground">
                      The return has been completed and all fees have been calculated.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            {/* Selected Items */}
            {wizardData.selected_items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Selected Items ({wizardData.selected_items.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {wizardData.selected_items.map((item, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="font-medium">SKU: {item.sku_id}</div>
                      <div className="text-muted-foreground">
                        Qty: {item.quantity_to_return}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Return Summary */}
            {wizardData.fee_calculations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const summary = calculateReturnSummary();
                    return (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Late Fees:</span>
                          <span className="text-red-600">{formatCurrency(summary.total_late_fees)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cleaning:</span>
                          <span className="text-orange-600">{formatCurrency(summary.total_cleaning_costs)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Damage:</span>
                          <span className="text-red-600">{formatCurrency(summary.total_damage_costs)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Deposit Refund:</span>
                          <span className="text-green-600">{formatCurrency(summary.total_deposit_refund)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span>Net Amount:</span>
                          <span className={summary.net_amount_due > 0 ? 'text-red-600' : 'text-green-600'}>
                            {formatCurrency(Math.abs(summary.net_amount_due))}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Navigation */}
        {currentStep !== 'complete' && (
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStepIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {currentStep === 'review' ? (
                  <Button
                    onClick={handleComplete}
                    disabled={!canProceed() || isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Complete Return'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}