import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Expense, Budget, calculateBudgetData, getCategoryInfo, formatCurrency } from '../lib/types';
import EmailService from '../lib/emailService';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';

interface BudgetContextType {
  expenses: Expense[];
  budgets: Budget[];
  notifiedBudgets: string[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  deleteExpense: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  getBudgetData: () => ReturnType<typeof calculateBudgetData>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};

interface BudgetProviderProps {
  children: React.ReactNode;
}

export const BudgetProvider: React.FC<BudgetProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Use user-specific keys for data storage
  const userKey = user ? user.id : 'guest';
  const [expenses, setExpenses] = useLocalStorage<Expense[]>(`expenses-${userKey}`, []);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>(`budgets-${userKey}`, []);
  const [notifiedBudgets, setNotifiedBudgets] = useLocalStorage<string[]>(`notified-budgets-${userKey}`, []);
  const [emailService] = useState(() => EmailService.getInstance());

  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    setExpenses(currentExpenses => [newExpense, ...currentExpenses]);
    toast.success('Expense added successfully');
  };

  const deleteExpense = (id: string) => {
    setExpenses(currentExpenses => currentExpenses.filter(exp => exp.id !== id));
    toast.success('Expense deleted');
  };

  const addBudget = (budgetData: Omit<Budget, 'id' | 'createdAt'>) => {
    // Check if budget already exists for this category
    const existingBudget = budgets.find(b => b.categoryId === budgetData.categoryId);
    
    if (existingBudget) {
      // Update existing budget
      setBudgets(currentBudgets => 
        currentBudgets.map(b => 
          b.categoryId === budgetData.categoryId 
            ? { ...b, amount: budgetData.amount, period: budgetData.period }
            : b
        )
      );
      toast.success('Budget updated successfully');
    } else {
      // Create new budget
      const newBudget: Budget = {
        ...budgetData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };

      setBudgets(currentBudgets => [...currentBudgets, newBudget]);
      toast.success('Budget created successfully');
    }
  };

  const updateBudget = (updatedBudget: Budget) => {
    setBudgets(currentBudgets => 
      currentBudgets.map(b => b.id === updatedBudget.id ? updatedBudget : b)
    );
    toast.success('Budget updated successfully');
  };

  const deleteBudget = (id: string) => {
    setBudgets(currentBudgets => currentBudgets.filter(b => b.id !== id));
    toast.success('Budget deleted');
  };

  const getBudgetData = () => {
    return calculateBudgetData(budgets, expenses);
  };

  // Budget alert system
  useEffect(() => {
    const checkBudgetAlerts = async () => {
      try {
        // Use a placeholder email for budget alerts
        const userEmail = 'user@example.com';
        
        const budgetData = getBudgetData();
        
        for (const budget of budgetData) {
          const alertKey = `${budget.id}-${Math.floor(budget.percentage / 5) * 5}`; // Group by 5% increments
          
          // Check for 80% threshold
          if (budget.percentage >= 80 && budget.percentage < 85 && !notifiedBudgets.includes(`${budget.id}-80`)) {
            await emailService.sendBudgetAlert(userEmail, budget);
            
            toast.warning(
              `Budget Warning: ${getCategoryInfo(budget.categoryId).name}`,
              {
                description: `You've used ${budget.percentage.toFixed(1)}% of your ${budget.period} budget.`,
                duration: 10000,
              }
            );
            
            setNotifiedBudgets(current => [...current, `${budget.id}-80`]);
          }
          
          // Check for 85% threshold (more urgent)
          if (budget.percentage >= 85 && budget.percentage < 100 && !notifiedBudgets.includes(`${budget.id}-85`)) {
            await emailService.sendBudgetAlert(userEmail, budget);
            
            toast.error(
              `🚨 Critical Budget Alert: ${getCategoryInfo(budget.categoryId).name}`,
              {
                description: `You've used ${budget.percentage.toFixed(1)}% of your ${budget.period} budget! Only ${formatCurrency(budget.remaining)} left.`,
                duration: 15000,
              }
            );
            
            setNotifiedBudgets(current => [...current, `${budget.id}-85`]);
          }
          
          // Check for 100% threshold (budget exceeded)
          if (budget.percentage >= 100 && !notifiedBudgets.includes(`${budget.id}-100`)) {
            await emailService.sendBudgetAlert(userEmail, budget);
            
            toast.error(
              `❌ Budget Exceeded: ${getCategoryInfo(budget.categoryId).name}`,
              {
                description: `You have exceeded your ${budget.period} budget by ${formatCurrency(Math.abs(budget.remaining))}!`,
                duration: 20000,
              }
            );
            
            setNotifiedBudgets(current => [...current, `${budget.id}-100`]);
          }
          
          // Reset notifications if budget goes back under thresholds
          if (budget.percentage < 80) {
            setNotifiedBudgets(current => current.filter(id => 
              !id.startsWith(`${budget.id}-80`) && 
              !id.startsWith(`${budget.id}-85`) && 
              !id.startsWith(`${budget.id}-100`)
            ));
          } else if (budget.percentage < 85) {
            setNotifiedBudgets(current => current.filter(id => 
              !id.startsWith(`${budget.id}-85`) && 
              !id.startsWith(`${budget.id}-100`)
            ));
          } else if (budget.percentage < 100) {
            setNotifiedBudgets(current => current.filter(id => 
              !id.startsWith(`${budget.id}-100`)
            ));
          }
        }
      } catch (error) {
        console.error('Error checking budget alerts:', error);
      }
    };

    checkBudgetAlerts();
  }, [budgets, expenses, notifiedBudgets, setNotifiedBudgets, emailService, getBudgetData]);

  const value: BudgetContextType = {
    expenses,
    budgets,
    notifiedBudgets,
    addExpense,
    deleteExpense,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetData,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};
