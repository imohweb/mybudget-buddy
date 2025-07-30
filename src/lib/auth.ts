export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: string;
  lastLogin: string;
  isActive: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

// Mock authentication service for demo purposes
// In a real app, this would connect to a backend API
export class AuthService {
  private static instance: AuthService;
  private users: User[] = [];
  private currentUser: User | null = null;

  private constructor() {
    this.loadUsers();
    this.initializeAdminUser();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private loadUsers(): void {
    const savedUsers = localStorage.getItem('budget-buddy-users');
    if (savedUsers) {
      this.users = JSON.parse(savedUsers);
    }
  }

  private saveUsers(): void {
    localStorage.setItem('budget-buddy-users', JSON.stringify(this.users));
  }

  private initializeAdminUser(): void {
    const adminExists = this.users.some(user => user.role === 'admin');
    if (!adminExists) {
      const adminUser: User = {
        id: 'admin-1',
        email: 'admin@budgetbuddy.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true
      };
      this.users.push(adminUser);
      this.saveUsers();
    }
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = this.users.find(u => u.email === credentials.email && u.isActive);
        
        if (!user) {
          resolve({ success: false, error: 'User not found or account is inactive' });
          return;
        }

        // In a real app, you'd verify the password hash
        // For demo purposes, we'll accept any password for existing users
        // Admin password: "admin123", regular users: "password123"
        const isValidPassword = (user.role === 'admin' && credentials.password === 'admin123') ||
                               (user.role === 'user' && credentials.password === 'password123');

        if (isValidPassword) {
          user.lastLogin = new Date().toISOString();
          this.currentUser = user;
          this.saveUsers();
          localStorage.setItem('budget-buddy-current-user', JSON.stringify(user));
          resolve({ success: true, user });
        } else {
          resolve({ success: false, error: 'Invalid password' });
        }
      }, 1000); // Simulate network delay
    });
  }

  async register(data: RegisterData): Promise<{ success: boolean; user?: User; error?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Validate data
        if (data.password !== data.confirmPassword) {
          resolve({ success: false, error: 'Passwords do not match' });
          return;
        }

        if (data.password.length < 6) {
          resolve({ success: false, error: 'Password must be at least 6 characters' });
          return;
        }

        // Check if user already exists
        const existingUser = this.users.find(u => u.email === data.email);
        if (existingUser) {
          resolve({ success: false, error: 'User with this email already exists' });
          return;
        }

        // Create new user
        const newUser: User = {
          id: `user-${Date.now()}`,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'user',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true
        };

        this.users.push(newUser);
        this.currentUser = newUser;
        this.saveUsers();
        localStorage.setItem('budget-buddy-current-user', JSON.stringify(newUser));
        
        resolve({ success: true, user: newUser });
      }, 1000);
    });
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem('budget-buddy-current-user');
  }

  getCurrentUser(): User | null {
    if (!this.currentUser) {
      const savedUser = localStorage.getItem('budget-buddy-current-user');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      }
    }
    return this.currentUser;
  }

  getAllUsers(): User[] {
    return [...this.users];
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
          resolve({ success: false, error: 'User not found' });
          return;
        }

        this.users[userIndex] = { ...this.users[userIndex], ...updates };
        this.saveUsers();

        // Update current user if it's the same user
        if (this.currentUser?.id === userId) {
          this.currentUser = this.users[userIndex];
          localStorage.setItem('budget-buddy-current-user', JSON.stringify(this.currentUser));
        }

        resolve({ success: true });
      }, 500);
    });
  }

  async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
          resolve({ success: false, error: 'User not found' });
          return;
        }

        // Don't allow deleting admin users
        if (this.users[userIndex].role === 'admin') {
          resolve({ success: false, error: 'Cannot delete admin users' });
          return;
        }

        this.users.splice(userIndex, 1);
        this.saveUsers();
        resolve({ success: true });
      }, 500);
    });
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }
}
