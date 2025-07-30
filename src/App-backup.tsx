import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { House, Receipt, Wallet, TrendUp, Plus, Calendar, Euro, Tag, Trash2, WarningCircle } from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast, Toaster } from 'sonner';

// Expense categories
const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Food & Dining', color: 'bg-orange-100 text-orange-800' },
  { id: 'transport', name: 'Transportation', color: 'bg-blue-100 text-blue-800' },
  { id: 'shopping', name: 'Shopping', color: 'bg-purple-100 text-purple-800' },
  { id: 'entertainment', name: 'Entertainment', color: 'bg-pink-100 text-pink-800' },
  { id: 'bills', name: 'Bills & Utilities', color: 'bg-red-100 text-red-800' },
  { id: 'healthcare', name: 'Healthcare', color: 'bg-green-100 text-green-800' },
  { id: 'education', name: 'Education', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'travel', name: 'Travel', color: 'bg-cyan-100 text-cyan-800' },
  { id: 'other', name: 'Other', color: 'bg-gray-100 text-gray-800' }
];

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'monthly' | 'yearly';
  createdAt: string;
}

function App() {
  // Guard check to ensure React is properly loaded
  if (!React || !React.useState) {
    console.error('React is not properly loaded');
    return <div>Loading...</div>;
  }

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [expenses, setExpenses] = useKV<Expense[]>('expenses', []);
  const [budgets, setBudgets] = useKV<Budget[]>('budgets', []);
  const [notifiedBudgets, setNotifiedBudgets] = useKV<string[]>('notified-budgets', []);
  
  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [budgetFormData, setBudgetFormData] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly' as 'monthly' | 'yearly'
  });

  const handleAddExpense = () => {
    if (!formData.amount || !formData.category || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      amount,
      category: formData.category,
      description: formData.description,
      date: formData.date,
      createdAt: new Date().toISOString()
    };

    setExpenses((currentExpenses) => [newExpense, ...currentExpenses]);
    
    // Reset form
    setFormData({
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    
    setIsAddExpenseOpen(false);
    toast.success('Expense added successfully');
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses((currentExpenses) => currentExpenses.filter(exp => exp.id !== expenseId));
    toast.success('Expense deleted');
  };

  const handleAddBudget = () => {
    if (!budgetFormData.categoryId || !budgetFormData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(budgetFormData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Check if budget already exists for this category
    const existingBudget = budgets.find(b => b.categoryId === budgetFormData.categoryId);
    if (existingBudget) {
      // Update existing budget
      setBudgets(currentBudgets => 
        currentBudgets.map(b => 
          b.categoryId === budgetFormData.categoryId 
            ? { ...b, amount, period: budgetFormData.period }
            : b
        )
      );
      toast.success('Budget updated successfully');
    } else {
      // Create new budget
      const newBudget: Budget = {
        id: Date.now().toString(),
        categoryId: budgetFormData.categoryId,
        amount,
        period: budgetFormData.period,
        createdAt: new Date().toISOString()
      };

      setBudgets(currentBudgets => [...currentBudgets, newBudget]);
      toast.success('Budget created successfully');
    }
    
    // Reset form
    setBudgetFormData({
      categoryId: '',
      amount: '',
      period: 'monthly'
    });
    
    setIsAddBudgetOpen(false);
  };

  const handleDeleteBudget = (budgetId: string) => {
    setBudgets(currentBudgets => currentBudgets.filter(b => b.id !== budgetId));
    toast.success('Budget deleted');
  };

  const getCategoryInfo = (categoryId: string) => {
    return EXPENSE_CATEGORIES.find(cat => cat.id === categoryId) || EXPENSE_CATEGORIES[8]; // fallback to 'other'
  };

  // Calculate statistics
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  }).reduce((sum, expense) => sum + expense.amount, 0);

  // Budget calculations
  const budgetData = useMemo(() => {
    const data = budgets.map(budget => {
      const categoryExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const isThisMonth = expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        const isThisYear = expenseDate.getFullYear() === currentYear;
        
        // For monthly budgets, only count expenses from this month
        // For yearly budgets, count expenses from this year
        return expense.category === budget.categoryId && 
               (budget.period === 'monthly' ? isThisMonth : isThisYear);
      });
      
      const spent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const remaining = budget.amount - spent;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      
      return {
        ...budget,
        spent,
        remaining,
        percentage,
        isOverBudget: spent > budget.amount
      };
    });
    
    return data;
  }, [budgets, expenses, currentMonth, currentYear]);

  const totalBudgetRemaining = budgetData.length > 0 
    ? budgetData
        .filter(item => item.period === 'monthly') // Only show monthly budget remaining in dashboard
        .reduce((sum, item) => sum + Math.max(0, item.remaining), 0)
    : 0;
  const budgetAlerts = budgetData.filter(item => item.percentage >= 80).length;

  // Email alert functionality
  useEffect(() => {
    const checkBudgetAlerts = async () => {
      try {
        if (!window.spark) return; // Ensure spark is available
        
        const user = await spark.user();
        
        for (const budget of budgetData) {
          if (budget.percentage >= 80 && !notifiedBudgets.includes(budget.id)) {
            const categoryInfo = getCategoryInfo(budget.categoryId);
            const prompt = spark.llmPrompt`
              Generate a professional email alert for a budget warning.
              Category: ${categoryInfo.name}
              Budget: ${formatCurrency(budget.amount)} (${budget.period})
              Spent: ${formatCurrency(budget.spent)}
              Percentage used: ${budget.percentage.toFixed(1)}%
              Remaining: ${formatCurrency(budget.remaining)}
              
              Make it friendly but urgent, encouraging the user to review their spending.
              Keep it concise and actionable.
            `;
            
            const emailContent = await spark.llm(prompt);
            
            // In a real app, this would send an actual email
            // For now, we'll show a toast notification
            toast.warning(
              `Budget Alert: ${categoryInfo.name}`,
              {
                description: `You've used ${budget.percentage.toFixed(1)}% of your ${budget.period} budget. ${formatCurrency(budget.remaining)} remaining.`,
                duration: 10000,
              }
            );
            
            // Mark this budget as notified
            setNotifiedBudgets((current) => [...current, budget.id]);
            
            console.log('Email Alert Generated:', emailContent);
          }
          
          // Reset notification if budget goes back under 80%
          if (budget.percentage < 80 && notifiedBudgets.includes(budget.id)) {
            setNotifiedBudgets((current) => current.filter(id => id !== budget.id));
          }
        }
      } catch (error) {
        console.error('Error checking budget alerts:', error);
      }
    };

    checkBudgetAlerts();
  }, [budgetData, notifiedBudgets, setNotifiedBudgets]);

  // Trends data
  const trendsData = useMemo(() => {
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === date.getMonth() && 
               expenseDate.getFullYear() === date.getFullYear();
      });
      
      const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const categoryBreakdown = EXPENSE_CATEGORIES.map(cat => ({
        ...cat,
        amount: monthExpenses
          .filter(exp => exp.category === cat.id)
          .reduce((sum, exp) => sum + exp.amount, 0)
      })).filter(cat => cat.amount > 0);
      
      last6Months.push({
        month: date.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' }),
        total,
        categories: categoryBreakdown
      });
    }
    
    return last6Months;
  }, [expenses]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-white">
      <Toaster richColors position="top-right" />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-8">
              <div className="mb-6">
                <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Expense
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Expense</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount (€)</Label>
                        <div className="relative">
                          <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {EXPENSE_CATEGORIES.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center gap-2">
                                  <Tag className="h-4 w-4" />
                                  {category.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="What did you spend on?"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setIsAddExpenseOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          className="flex-1"
                          onClick={handleAddExpense}
                        >
                          Add Expense
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
                <TabsList className="grid w-full grid-cols-1 h-auto bg-gray-100 p-1">
                  <TabsTrigger 
                    value="dashboard" 
                    className="justify-start gap-3 py-3"
                  >
                    <House className="h-4 w-4" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger 
                    value="expenses" 
                    className="justify-start gap-3 py-3"
                  >
                    <Receipt className="h-4 w-4" />
                    Expenses
                  </TabsTrigger>
                  <TabsTrigger 
                    value="budgets" 
                    className="justify-start gap-3 py-3"
                  >
                    <Wallet className="h-4 w-4" />
                    Budgets
                  </TabsTrigger>
                  <TabsTrigger 
                    value="trends" 
                    className="justify-start gap-3 py-3"
                  >
                    <TrendUp className="h-4 w-4" />
                    Trends
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="dashboard" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Finance Tracker</h1>
                    <p className="text-gray-600">
                      Track your expenses, manage budgets, and analyze spending patterns
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <Wallet className="h-4 w-4 text-gray-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold font-tabular">{formatCurrency(thisMonthExpenses)}</div>
                        <p className="text-xs text-gray-500">
                          {expenses.filter(expense => {
                            const expenseDate = new Date(expense.date);
                            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
                          }).length} expenses this month
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Budget Remaining</CardTitle>
                        <TrendUp className="h-4 w-4 text-gray-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold font-tabular">
                          {budgetData.filter(b => b.period === 'monthly').length > 0 ? formatCurrency(totalBudgetRemaining) : '-'}
                        </div>
                        <p className="text-xs text-gray-500">
                          {budgetData.filter(b => b.period === 'monthly').length > 0 ? (
                            budgetData.filter(b => b.period === 'monthly').some(b => b.remaining < 0) 
                              ? `${budgetData.filter(b => b.period === 'monthly').length} monthly budgets (some over limit)` 
                              : `${budgetData.filter(b => b.period === 'monthly').length} monthly budgets set`
                          ) : 'No monthly budgets set'}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold font-tabular">{formatCurrency(totalExpenses)}</div>
                        <p className="text-xs text-gray-500">
                          {expenses.length} total expenses
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Budget Alerts</CardTitle>
                        <WarningCircle className="h-4 w-4 text-gray-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{budgetAlerts}</div>
                        <p className="text-xs text-gray-500">
                          Categories over 80%
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="expenses" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Expenses</h2>
                      <p className="text-gray-600">Track and manage your spending</p>
                    </div>
                    <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Expense
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Add New Expense</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="amount-modal">Amount (€)</Label>
                            <div className="relative">
                              <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                              <Input
                                id="amount-modal"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                className="pl-10"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="category-modal">Category</Label>
                            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                              <SelectContent>
                                {EXPENSE_CATEGORIES.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    <div className="flex items-center gap-2">
                                      <Tag className="h-4 w-4" />
                                      {category.name}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="description-modal">Description</Label>
                            <Textarea
                              id="description-modal"
                              placeholder="What did you spend on?"
                              value={formData.description}
                              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                              rows={3}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="date-modal">Date</Label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                              <Input
                                id="date-modal"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                className="pl-10"
                              />
                            </div>
                          </div>
                          
                          <div className="flex gap-2 pt-4">
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => setIsAddExpenseOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              className="flex-1"
                              onClick={handleAddExpense}
                            >
                              Add Expense
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {expenses.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="text-center space-y-2">
                          <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-500">No expenses yet</h3>
                          <p className="text-sm text-gray-400">
                            Start tracking your spending by adding your first expense
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {expenses.map((expense) => {
                        const categoryInfo = getCategoryInfo(expense.category);
                        return (
                          <Card key={expense.id}>
                            <CardContent className="flex items-center justify-between p-4">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="flex-shrink-0">
                                  <Badge variant="secondary" className={categoryInfo.color}>
                                    {categoryInfo.name}
                                  </Badge>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 truncate">
                                    {expense.description}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(expense.date).toLocaleDateString('de-DE')}
                                  </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-lg font-semibold font-tabular">
                                    {formatCurrency(expense.amount)}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteExpense(expense.id)}
                                  className="text-gray-400 hover:text-red-500 flex-shrink-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="budgets" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Budgets</h2>
                      <p className="text-gray-600">Set spending limits and track progress. Your expenses are automatically deducted from your budgets.</p>
                    </div>
                    <Dialog open={isAddBudgetOpen} onOpenChange={setIsAddBudgetOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Budget
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Add Budget</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="budget-category">Category</Label>
                            <Select value={budgetFormData.categoryId} onValueChange={(value) => setBudgetFormData(prev => ({ ...prev, categoryId: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                              <SelectContent>
                                {EXPENSE_CATEGORIES.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    <div className="flex items-center gap-2">
                                      <Tag className="h-4 w-4" />
                                      {category.name}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="budget-amount">Budget Amount (€)</Label>
                            <div className="relative">
                              <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                              <Input
                                id="budget-amount"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={budgetFormData.amount}
                                onChange={(e) => setBudgetFormData(prev => ({ ...prev, amount: e.target.value }))}
                                className="pl-10"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="budget-period">Period</Label>
                            <Select value={budgetFormData.period} onValueChange={(value: 'monthly' | 'yearly') => setBudgetFormData(prev => ({ ...prev, period: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex gap-2 pt-4">
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => setIsAddBudgetOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              className="flex-1"
                              onClick={handleAddBudget}
                            >
                              Add Budget
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {budgets.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="text-center space-y-2">
                          <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-500">No budgets yet</h3>
                          <p className="text-sm text-gray-400">
                            Set up your first budget to start managing your finances
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {/* Budget Overview */}
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-blue-900">Budget Overview</h3>
                              <p className="text-sm text-blue-700">
                                Total Budget: {formatCurrency(budgetData.reduce((sum, b) => sum + b.amount, 0))} | 
                                Total Spent: {formatCurrency(budgetData.reduce((sum, b) => sum + b.spent, 0))} | 
                                Remaining: {formatCurrency(totalBudgetRemaining)}
                              </p>
                            </div>
                            {budgetAlerts > 0 && (
                              <div className="flex items-center gap-1 text-amber-600">
                                <WarningCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">{budgetAlerts} alert{budgetAlerts !== 1 ? 's' : ''}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <div className="space-y-4">
                      {budgetData.map((budget) => {
                        const categoryInfo = getCategoryInfo(budget.categoryId);
                        return (
                          <Card key={budget.id}>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <Badge variant="secondary" className={categoryInfo.color}>
                                    {categoryInfo.name}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {budget.period}
                                  </Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteBudget(budget.id)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">
                                    {formatCurrency(budget.spent)} of {formatCurrency(budget.amount)}
                                  </span>
                                  <span className={`text-sm font-medium ${budget.isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
                                    {budget.percentage.toFixed(1)}%
                                  </span>
                                </div>
                                
                                <Progress 
                                  value={Math.min(budget.percentage, 100)} 
                                  className="h-2"
                                  aria-label={`${budget.percentage.toFixed(1)}% of budget used`}
                                />
                                
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>
                                    {budget.remaining >= 0 ? 'Remaining' : 'Over budget'}: {formatCurrency(Math.abs(budget.remaining))}
                                  </span>
                                  {budget.isOverBudget && (
                                    <span className="text-red-600 flex items-center gap-1">
                                      <WarningCircle className="h-3 w-3" />
                                      Over budget
                                    </span>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                    </>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="trends" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold">Spending Trends</h2>
                    <p className="text-gray-600">Analyze your spending patterns over time</p>
                  </div>

                  {expenses.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="text-center space-y-2">
                          <TrendUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-500">No trends to show</h3>
                          <p className="text-sm text-gray-400">
                            Add some expenses to see your spending trends
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      {/* Monthly Trends */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Monthly Spending Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {trendsData.map((month, index) => (
                              <div key={month.month} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{month.month}</span>
                                  <span className="font-semibold font-tabular">{formatCurrency(month.total)}</span>
                                </div>
                                {month.total > 0 && (
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                                      style={{ 
                                        width: `${Math.min((month.total / Math.max(...trendsData.map(m => m.total))) * 100, 100)}%` 
                                      }}
                                    />
                                  </div>
                                )}
                                {month.categories.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {month.categories.slice(0, 3).map((cat) => (
                                      <Badge key={cat.id} variant="secondary" className={`${cat.color} text-xs`}>
                                        {cat.name}: {formatCurrency(cat.amount)}
                                      </Badge>
                                    ))}
                                    {month.categories.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{month.categories.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Category Breakdown */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Category Breakdown (This Month)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {EXPENSE_CATEGORIES.map((category) => {
                              const categoryExpenses = expenses.filter(expense => {
                                const expenseDate = new Date(expense.date);
                                return expense.category === category.id && 
                                       expenseDate.getMonth() === currentMonth && 
                                       expenseDate.getFullYear() === currentYear;
                              });
                              const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
                              const percentage = thisMonthExpenses > 0 ? (total / thisMonthExpenses) * 100 : 0;

                              if (total === 0) return null;

                              return (
                                <div key={category.id} className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary" className={category.color}>
                                        {category.name}
                                      </Badge>
                                      <span className="text-sm text-gray-500">
                                        {categoryExpenses.length} expense{categoryExpenses.length !== 1 ? 's' : ''}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-semibold font-tabular">{formatCurrency(total)}</div>
                                      <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                                    </div>
                                  </div>
                                  <Progress value={percentage} className="h-2" />
                                </div>
                              );
                            }).filter(Boolean)}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;