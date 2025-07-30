import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash } from '@phosphor-icons/react';
import { DEFAULT_CATEGORIES, getCategoryInfo, formatCurrency } from '@/lib/types';
import { useBudget } from '@/contexts/BudgetContext';

export function ExpenseList() {
  const { expenses, deleteExpense } = useBudget();

  const getCategoryColor = (categoryId: string) => {
    const category = getCategoryInfo(categoryId);
    return category.color;
  };

  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium text-muted-foreground">No expenses yet</h3>
            <p className="text-sm text-muted-foreground">
              Start tracking your spending by adding your first expense
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Expenses</h2>
        <Badge variant="secondary" className="font-tabular">
          {expenses.length} total
        </Badge>
      </div>
      
      <div className="space-y-3">
        {sortedExpenses.map((expense) => (
          <Card key={expense.id} className="transition-colors hover:bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getCategoryColor(expense.category) }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{expense.description || getCategoryInfo(expense.category).name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{getCategoryInfo(expense.category).name}</span>
                            <span>•</span>
                            <time>{new Date(expense.date).toLocaleDateString()}</time>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="font-semibold font-tabular text-lg">
                            {formatCurrency(expense.amount)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteExpense(expense.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}