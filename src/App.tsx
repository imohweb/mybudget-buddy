import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { House, Receipt, Wallet, TrendUp, Gear, User, Shield } from '@phosphor-icons/react';
import { Toaster } from 'sonner';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { BudgetProvider } from '@/contexts/BudgetContext';
import { AuthScreen } from '@/components/AuthScreen';
import { Dashboard } from '@/components/Dashboard';
import { AddExpense } from '@/components/AddExpense';
import { ExpenseList } from '@/components/ExpenseList';
import { BudgetManager } from '@/components/BudgetManager';
import { SpendingTrends } from '@/components/SpendingTrends';
import { Settings } from '@/components/Settings';
import { UserProfile } from '@/components/UserProfile';
import { AdminDashboard } from '@/components/AdminDashboard';

function AppContent() {
  const { isAuthenticated, user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <BudgetProvider userId={user?.id}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <div className="space-y-4">
                  <div className="text-center lg:text-left">
                    <h1 className="text-2xl font-bold text-gray-900">Budget Buddy</h1>
                    <p className="text-sm text-gray-600">Your personal finance tracker</p>
                    {user && (
                      <p className="text-xs text-gray-500 mt-1">
                        Welcome, {user.firstName}!
                      </p>
                    )}
                  </div>
                  
                  <div className="lg:hidden">
                    <AddExpense />
                  </div>
                </div>
              </div>

              <div className="hidden lg:block mt-6">
                <AddExpense />
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className={`grid w-full mb-6 ${user?.role === 'admin' ? 'grid-cols-6' : 'grid-cols-5'}`}>
                  <TabsTrigger value="dashboard" className="flex items-center gap-2">
                    <House className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </TabsTrigger>
                  <TabsTrigger value="expenses" className="flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    <span className="hidden sm:inline">Expenses</span>
                  </TabsTrigger>
                  <TabsTrigger value="budgets" className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    <span className="hidden sm:inline">Budgets</span>
                  </TabsTrigger>
                  <TabsTrigger value="trends" className="flex items-center gap-2">
                    <TrendUp className="h-4 w-4" />
                    <span className="hidden sm:inline">Trends</span>
                  </TabsTrigger>
                  <TabsTrigger value="profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Profile</span>
                  </TabsTrigger>
                  {user?.role === 'admin' && (
                    <TabsTrigger value="admin" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span className="hidden sm:inline">Admin</span>
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="dashboard" className="space-y-6">
                  <Dashboard />
                </TabsContent>

                <TabsContent value="expenses" className="space-y-6">
                  <ExpenseList />
                </TabsContent>

                <TabsContent value="budgets" className="space-y-6">
                  <BudgetManager />
                </TabsContent>

                <TabsContent value="trends" className="space-y-6">
                  <SpendingTrends />
                </TabsContent>

                <TabsContent value="profile" className="space-y-6">
                  <UserProfile />
                </TabsContent>

                {user?.role === 'admin' && (
                  <TabsContent value="admin" className="space-y-6">
                    <AdminDashboard />
                  </TabsContent>
                )}
              </Tabs>
            </main>
          </div>
        </div>
        
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
          }}
        />
      </div>
    </BudgetProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
