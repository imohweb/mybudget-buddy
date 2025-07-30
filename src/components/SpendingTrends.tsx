import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { DEFAULT_CATEGORIES, formatCurrency, getCategoryInfo } from '@/lib/types';
import { useBudget } from '@/contexts/BudgetContext';

export function SpendingTrends() {
  const { expenses } = useBudget();
  const [timeRange, setTimeRange] = useState('3');

  const getTimeRangeData = () => {
    const months = parseInt(timeRange);
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    
    return expenses.filter(expense => 
      new Date(expense.date) >= startDate
    );
  };

  const getMonthlyData = () => {
    const filteredExpenses = getTimeRangeData();
    const monthlyTotals = new Map<string, number>();
    
    filteredExpenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) || 0) + expense.amount);
    });

    return Array.from(monthlyTotals.entries())
      .map(([key, total]) => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          total: total,
        };
      })
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  };

  const getCategoryData = () => {
    const filteredExpenses = getTimeRangeData();
    const categoryTotals = new Map<string, number>();
    
    filteredExpenses.forEach(expense => {
      categoryTotals.set(expense.category, (categoryTotals.get(expense.category) || 0) + expense.amount);
    });

    return Array.from(categoryTotals.entries())
      .map(([category, total]) => {
        const categoryInfo = getCategoryInfo(category);
        return {
          category: categoryInfo.name,
          total,
          color: categoryInfo.color,
        };
      })
      .sort((a, b) => b.total - a.total);
  };

  const totalSpent = getTimeRangeData().reduce((sum, expense) => sum + expense.amount, 0);
  const avgMonthly = totalSpent / parseInt(timeRange);
  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium text-muted-foreground">No spending data yet</h3>
            <p className="text-sm text-muted-foreground">
              Add some expenses to see your spending trends and insights
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Spending Trends</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Last 1 month</SelectItem>
            <SelectItem value="3">Last 3 months</SelectItem>
            <SelectItem value="6">Last 6 months</SelectItem>
            <SelectItem value="12">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-tabular">{formatCurrency(totalSpent)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last {timeRange} month{timeRange !== '1' ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-tabular">{formatCurrency(avgMonthly)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average per month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-tabular">{getTimeRangeData().length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Recorded expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {monthlyData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs text-muted-foreground"
                />
                <YAxis 
                  className="text-xs text-muted-foreground"
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number), 'Spent']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="oklch(0.45 0.15 200)"
                  strokeWidth={2}
                  dot={{ fill: "oklch(0.45 0.15 200)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {categoryData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="total"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryData.slice(0, 5).map((item, index) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-tabular">{formatCurrency(item.total)}</div>
                    <div className="text-xs text-muted-foreground">
                      {((item.total / totalSpent) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}