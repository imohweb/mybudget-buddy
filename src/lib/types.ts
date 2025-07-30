export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO string
  createdAt: string; // ISO string
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'monthly' | 'yearly';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // phosphor icon name
  color: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: 'ForkKnife', color: '#FF6B6B' },
  { id: 'transport', name: 'Transportation', icon: 'Car', color: '#4ECDC4' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#45B7D1' },
  { id: 'entertainment', name: 'Entertainment', icon: 'GameController', color: '#96CEB4' },
  { id: 'bills', name: 'Bills & Utilities', icon: 'House', color: '#FFEAA7' },
  { id: 'healthcare', name: 'Healthcare', icon: 'Heart', color: '#DDA0DD' },
  { id: 'education', name: 'Education', icon: 'GraduationCap', color: '#74B9FF' },
  { id: 'travel', name: 'Travel', icon: 'Airplane', color: '#98D8C8' },
  { id: 'other', name: 'Other', icon: 'Dots', color: '#A8A8A8' },
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

export const getMonthYear = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const getCurrentMonthExpenses = (expenses: Expense[]): Expense[] => {
  const currentMonth = getMonthYear(new Date());
  return expenses.filter(expense => {
    const expenseMonth = getMonthYear(new Date(expense.date));
    return expenseMonth === currentMonth;
  });
};

// Budget calculation utilities
export const calculateBudgetData = (budgets: Budget[], expenses: Expense[]) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  return budgets.map(budget => {
    const categoryExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const isThisMonth = expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      const isThisYear = expenseDate.getFullYear() === currentYear;
      
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
};

// Category utilities
export const getCategoryInfo = (categoryId: string) => {
  return DEFAULT_CATEGORIES.find(cat => cat.id === categoryId) || DEFAULT_CATEGORIES[8]; // fallback to 'other'
};

export const getCategoryColor = (categoryId: string) => {
  const category = getCategoryInfo(categoryId);
  return category.color;
};