import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Gear, Warning, CheckCircle, Plus } from '@phosphor-icons/react';
import { DEFAULT_CATEGORIES, formatCurrency, getCategoryInfo } from '@/lib/types';
import { useBudget } from '@/contexts/BudgetContext';

export function BudgetManager() {
  const { addBudget, getBudgetData } = useBudget();
  
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const budgetData = getBudgetData();

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory || !amount) {
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (parsedAmount <= 0) {
      return;
    }

    addBudget({
      categoryId: selectedCategory,
      amount: parsedAmount,
      period: period,
    });

    setSelectedCategory('');
    setAmount('');
    setPeriod('monthly');
    setOpen(false);
  };

  const getBudgetStatus = (percentage: number) => {
    if (percentage >= 100) return 'over';
    if (percentage >= 80) return 'warning';
    return 'good';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over': return 'text-destructive';
      case 'warning': return 'text-warning';
      default: return 'text-success';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'over': return <Warning className="h-4 w-4 text-destructive" />;
      case 'warning': return <Warning className="h-4 w-4 text-warning" />;
      default: return <CheckCircle className="h-4 w-4 text-success" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Budget Management</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Set Category Budget</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddBudget} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budget-category">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
                  <SelectTrigger id="budget-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="budget-amount">Budget Amount</Label>
                <Input
                  id="budget-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget-period">Period</Label>
                <Select value={period} onValueChange={(value: 'monthly' | 'yearly') => setPeriod(value)}>
                  <SelectTrigger id="budget-period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Set Budget
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {budgetData.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium text-muted-foreground">No budgets set</h3>
              <p className="text-sm text-muted-foreground">
                Set spending limits for your categories to track your progress
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {budgetData.map((budget) => {
            const percentage = Math.min(budget.percentage, 100);
            const status = getBudgetStatus(budget.percentage);
            const categoryInfo = getCategoryInfo(budget.categoryId);
            
            return (
              <Card key={budget.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{categoryInfo.name}</CardTitle>
                    {getStatusIcon(status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Spent</span>
                      <span className={`font-tabular ${getStatusColor(status)}`}>
                        {formatCurrency(budget.spent)} of {formatCurrency(budget.amount)}
                      </span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Badge variant={status === 'good' ? 'default' : 'destructive'} className="text-xs">
                      {percentage.toFixed(0)}% used
                    </Badge>
                    <span className="text-sm text-muted-foreground font-tabular">
                      {formatCurrency(Math.max(0, budget.remaining))} left
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}