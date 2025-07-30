import { User } from './auth';
import { Expense, Budget } from './types';

export interface AppData {
  users: User[];
  userBudgets: Record<string, Budget[]>;
  userExpenses: Record<string, Expense[]>;
  userNotifications: Record<string, string[]>;
  exportDate: string;
  version: string;
}

export class DataManager {
  private static instance: DataManager;

  private constructor() {}

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  // Export all app data
  exportAllData(): AppData {
    const data: AppData = {
      users: [],
      userBudgets: {},
      userExpenses: {},
      userNotifications: {},
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    // Get users
    const savedUsers = localStorage.getItem('budget-buddy-users');
    if (savedUsers) {
      data.users = JSON.parse(savedUsers);
    }

    // Get all user data
    data.users.forEach(user => {
      // Get budgets
      const budgets = localStorage.getItem(`budgets-${user.id}`);
      if (budgets) {
        data.userBudgets[user.id] = JSON.parse(budgets);
      }

      // Get expenses
      const expenses = localStorage.getItem(`expenses-${user.id}`);
      if (expenses) {
        data.userExpenses[user.id] = JSON.parse(expenses);
      }

      // Get notifications
      const notifications = localStorage.getItem(`notified-budgets-${user.id}`);
      if (notifications) {
        data.userNotifications[user.id] = JSON.parse(notifications);
      }
    });

    return data;
  }

  // Import all app data
  importAllData(data: AppData): { success: boolean; error?: string } {
    try {
      // Validate data structure
      if (!data.users || !Array.isArray(data.users)) {
        return { success: false, error: 'Invalid data format: users array missing' };
      }

      // Import users
      localStorage.setItem('budget-buddy-users', JSON.stringify(data.users));

      // Import user data
      Object.keys(data.userBudgets || {}).forEach(userId => {
        localStorage.setItem(`budgets-${userId}`, JSON.stringify(data.userBudgets[userId]));
      });

      Object.keys(data.userExpenses || {}).forEach(userId => {
        localStorage.setItem(`expenses-${userId}`, JSON.stringify(data.userExpenses[userId]));
      });

      Object.keys(data.userNotifications || {}).forEach(userId => {
        localStorage.setItem(`notified-budgets-${userId}`, JSON.stringify(data.userNotifications[userId]));
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: `Import failed: ${error}` };
    }
  }

  // Download data as JSON file
  downloadData(): void {
    const data = this.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `budget-buddy-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Upload and import data from file
  async uploadData(file: File): Promise<{ success: boolean; error?: string }> {
    try {
      const text = await file.text();
      const data: AppData = JSON.parse(text);
      return this.importAllData(data);
    } catch (error) {
      return { success: false, error: `File upload failed: ${error}` };
    }
  }

  // Clear all app data
  clearAllData(): void {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith('budget-buddy-') || 
      key.startsWith('expenses-') || 
      key.startsWith('budgets-') || 
      key.startsWith('notified-budgets-')
    );
    
    keys.forEach(key => localStorage.removeItem(key));
  }

  // Get storage usage info
  getStorageInfo(): { used: number; available: number; total: number } {
    let used = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }

    // Most browsers allow 5-10MB for localStorage
    const total = 5 * 1024 * 1024; // 5MB estimate
    const available = total - used;

    return {
      used: Math.round(used / 1024), // in KB
      available: Math.round(available / 1024), // in KB
      total: Math.round(total / 1024) // in KB
    };
  }
}
