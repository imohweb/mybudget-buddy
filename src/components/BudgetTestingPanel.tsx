import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, TestTube } from '@phosphor-icons/react';
import { useBudget } from '@/contexts/BudgetContext';
import { formatCurrency } from '@/lib/types';
import { toast } from 'sonner';

export function BudgetTestingPanel() {
  const { addExpense, budgets, getBudgetData } = useBudget();
  const [testAmount, setTestAmount] = useState('');
  const [selectedBudgetId, setSelectedBudgetId] = useState('');

  const budgetData = getBudgetData();

  const handleAddTestExpense = () => {
    if (!testAmount || !selectedBudgetId) {
      toast.error('Please enter amount and select a budget');
      return;
    }

    const budget = budgetData.find(b => b.id === selectedBudgetId);
    if (!budget) return;

    addExpense({
      amount: parseFloat(testAmount),
      category: budget.categoryId,
      description: `Test expense to trigger ${Math.round(budget.percentage + (parseFloat(testAmount) / budget.amount) * 100)}% threshold`,
      date: new Date().toISOString(),
    });

    setTestAmount('');
    toast.success('Test expense added - check for budget alerts!');
  };

  const simulateBudgetExceeding = (targetPercentage: number) => {
    if (!selectedBudgetId) {
      toast.error('Please select a budget first');
      return;
    }

    const budget = budgetData.find(b => b.id === selectedBudgetId);
    if (!budget) return;

    const currentPercentage = budget.percentage;
    const neededPercentage = targetPercentage - currentPercentage;
    const neededAmount = (neededPercentage / 100) * budget.amount;

    if (neededAmount <= 0) {
      toast.info(`Budget is already at ${currentPercentage.toFixed(1)}%`);
      return;
    }

    addExpense({
      amount: neededAmount,
      category: budget.categoryId,
      description: `Test expense to reach ${targetPercentage}% threshold`,
      date: new Date().toISOString(),
    });

    toast.success(`Added ${formatCurrency(neededAmount)} to reach ${targetPercentage}% threshold`);
  };

  if (budgetData.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              Create some budgets first to test email notifications.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Budget Alert Testing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertDescription>
            Use this panel to test budget alerts. Emails will be triggered at 80%, 85%, and 100% thresholds.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Label>Current Budget Status</Label>
          {budgetData.map((budget) => (
            <div 
              key={budget.id} 
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedBudgetId === budget.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
              }`}
              onClick={() => setSelectedBudgetId(budget.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{budget.categoryId}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                  </p>
                </div>
                <Badge variant={budget.percentage >= 100 ? 'destructive' : budget.percentage >= 80 ? 'secondary' : 'default'}>
                  {budget.percentage.toFixed(1)}%
                </Badge>
              </div>
              <Progress value={Math.min(budget.percentage, 100)} className="h-2" />
            </div>
          ))}
        </div>

        {selectedBudgetId && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <Label>Test Actions</Label>
            
            <div className="grid gap-2 sm:grid-cols-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => simulateBudgetExceeding(80)}
                disabled={budgetData.find(b => b.id === selectedBudgetId)?.percentage >= 80}
              >
                Trigger 80% Alert
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => simulateBudgetExceeding(85)}
                disabled={budgetData.find(b => b.id === selectedBudgetId)?.percentage >= 85}
              >
                Trigger 85% Alert
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => simulateBudgetExceeding(100)}
                disabled={budgetData.find(b => b.id === selectedBudgetId)?.percentage >= 100}
              >
                Exceed Budget
              </Button>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Custom amount..."
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                />
              </div>
              <Button onClick={handleAddTestExpense}>
                Add Test Expense
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
