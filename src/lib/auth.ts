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
  passwordHash?: string; // Store hashed password
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

  // Simple password hashing for demo (in production, use bcrypt or similar)
  private hashPassword(password: string): string {
    // Simple hash for demo - in production use proper hashing like bcrypt
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  private loadUsers(): void {
    const savedUsers = localStorage.getItem('budget-buddy-users');
    if (savedUsers) {
      this.users = JSON.parse(savedUsers);
      // Migrate existing users without password hashes
      this.migrateExistingUsers();
    }
  }

  private migrateExistingUsers(): void {
    let needsUpdate = false;
    this.users.forEach(user => {
      if (!user.passwordHash) {
        // For existing users without password, set a default based on role
        user.passwordHash = user.role === 'admin' 
          ? this.hashPassword('admin123')
          : this.hashPassword('password123');
        needsUpdate = true;
      }
    });
    
    if (needsUpdate) {
      this.saveUsers();
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
        isActive: true,
        passwordHash: this.hashPassword('admin123') // Default admin password
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

        // Verify password against stored hash
        if (!user.passwordHash) {
          resolve({ success: false, error: 'Account setup incomplete. Please contact support.' });
          return;
        }

        if (this.verifyPassword(credentials.password, user.passwordHash)) {
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
          isActive: true,
          passwordHash: this.hashPassword(data.password) // Store the actual password hash
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

  // Admin method to clean up duplicate users
  async cleanupDuplicateUsers(): Promise<{ success: boolean; removed: number; error?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const seen = new Set<string>();
        const duplicates: number[] = [];
        
        this.users.forEach((user, index) => {
          if (seen.has(user.email)) {
            duplicates.push(index);
          } else {
            seen.add(user.email);
          }
        });

        // Remove duplicates (keeping the first occurrence)
        duplicates.reverse().forEach(index => {
          this.users.splice(index, 1);
        });

        if (duplicates.length > 0) {
          this.saveUsers();
        }

        resolve({ success: true, removed: duplicates.length });
      }, 500);
    });
  }

  // Get user statistics including duplicates
  getUserStatistics(): { total: number; duplicateEmails: string[]; usersWithoutPasswords: string[] } {
    const emailCounts = new Map<string, number>();
    const usersWithoutPasswords: string[] = [];

    this.users.forEach(user => {
      // Count email occurrences
      emailCounts.set(user.email, (emailCounts.get(user.email) || 0) + 1);
      
      // Check for users without passwords
      if (!user.passwordHash) {
        usersWithoutPasswords.push(user.email);
      }
    });

    const duplicateEmails = Array.from(emailCounts.entries())
      .filter(([email, count]) => count > 1)
      .map(([email]) => email);

    return {
      total: this.users.length,
      duplicateEmails,
      usersWithoutPasswords
    };
  }
}
