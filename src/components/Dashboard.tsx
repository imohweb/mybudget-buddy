import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Warning, Wallet } from '@phosphor-icons/react';
import { formatCurrency, getCategoryInfo } from '@/lib/types';
import { useBudget } from '@/contexts/BudgetContext';

export function Dashboard() {
  const { expenses, budgets, getBudgetData } = useBudget();

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  const totalSpent = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const budgetData = getBudgetData();
  const totalBudget = budgetData
    .filter(b => b.period === 'monthly')
    .reduce((sum, budget) => sum + budget.amount, 0);
  const budgetRemaining = totalBudget - totalSpent;
  
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const budgetWarnings = budgetData.filter(budget => budget.percentage >= 80);

  const getLastMonthComparison = () => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const lastMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= lastMonth && expenseDate <= lastMonthEnd;
    });
    
    const lastMonthTotal = lastMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const difference = totalSpent - lastMonthTotal;
    const percentageChange = lastMonthTotal > 0 ? (difference / lastMonthTotal) * 100 : 0;
    
    return { difference, percentageChange };
  };

  const { difference, percentageChange } = getLastMonthComparison();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Finance Tracker</h1>
        <p className="text-muted-foreground">
          Track your expenses, manage budgets, and analyze spending patterns
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-tabular">{formatCurrency(totalSpent)}</div>
            {difference !== 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {difference > 0 ? (
                  <ArrowUp className="h-3 w-3 text-destructive" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-success" />
                )}
                <span className={difference > 0 ? 'text-destructive' : 'text-success'}>
                  {Math.abs(percentageChange).toFixed(1)}% vs last month
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Remaining</CardTitle>
            <ArrowUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-tabular">
              {totalBudget > 0 ? formatCurrency(budgetRemaining) : '-'}
            </div>
            {totalBudget > 0 && (
              <p className="text-xs text-muted-foreground">
                {((budgetRemaining / totalBudget) * 100).toFixed(1)}% of budget left
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Badge variant="secondary">{expenses.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-tabular">
              {formatCurrency(expenses.reduce((sum, exp) => sum + exp.amount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              All time spending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Alerts</CardTitle>
            <Warning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetWarnings.length}</div>
            <p className="text-xs text-muted-foreground">
              Categories over 80%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {recentExpenses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No expenses recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{expense.description || getCategoryInfo(expense.category).name}</p>
                      <p className="text-sm text-muted-foreground">
                        {getCategoryInfo(expense.category).name} • {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-semibold font-tabular">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Status</CardTitle>
          </CardHeader>
          <CardContent>
            {budgetData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No budgets set yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {budgetData.slice(0, 4).map((budget) => {
                  const percentage = budget.percentage;
                  const categoryInfo = getCategoryInfo(budget.categoryId);
                  
                  return (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{categoryInfo.name}</span>
                        <span className="font-tabular">
                          {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            percentage >= 100 
                              ? 'bg-destructive' 
                              : percentage >= 80 
                                ? 'bg-warning' 
                                : 'bg-success'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}