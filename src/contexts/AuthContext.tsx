import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { User, AuthState, LoginCredentials, RegisterData, AuthService } from '../lib/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  const authService = AuthService.getInstance();

  useEffect(() => {
    // Check if user is already logged in
    const user = authService.getCurrentUser();
    setAuthState({
      isAuthenticated: !!user,
      user,
      loading: false
    });
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await authService.login(credentials);
      
      if (result.success && result.user) {
        setAuthState({
          isAuthenticated: true,
          user: result.user,
          loading: false
        });
        toast.success(`Welcome back, ${result.user.firstName}!`);
        return true;
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
        toast.error(result.error || 'Login failed');
        return false;
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      toast.error('Login failed. Please try again.');
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await authService.register(data);
      
      if (result.success && result.user) {
        setAuthState({
          isAuthenticated: true,
          user: result.user,
          loading: false
        });
        toast.success(`Welcome to Budget Buddy, ${result.user.firstName}!`);
        return true;
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
        toast.error(result.error || 'Registration failed');
        return false;
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      toast.error('Registration failed. Please try again.');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false
    });
    toast.success('Logged out successfully');
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!authState.user) return false;

    try {
      const result = await authService.updateUser(authState.user.id, updates);
      
      if (result.success) {
        const updatedUser = { ...authState.user, ...updates };
        setAuthState(prev => ({
          ...prev,
          user: updatedUser
        }));
        toast.success('Profile updated successfully');
        return true;
      } else {
        toast.error(result.error || 'Failed to update profile');
        return false;
      }
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
