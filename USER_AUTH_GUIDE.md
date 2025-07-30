# Budget Buddy - User Authentication & Admin Management

## 🔐 Authentication System

Budget Buddy now includes a comprehensive user authentication and management system with separate user profiles and admin capabilities.

### Features

#### 🚀 **User Authentication**
- **Sign Up**: Create new user accounts with email and password
- **Sign In**: Secure login with email/password authentication
- **User Profiles**: Personalized user profiles with editable information
- **Data Isolation**: Each user has their own private budget and expense data

#### 👤 **User Management**
- **Profile Management**: Users can edit their personal information
- **Secure Data Storage**: User-specific data storage (expenses, budgets, notifications)
- **Session Management**: Persistent login sessions with secure logout

#### 🛡️ **Admin Dashboard**
- **User Overview**: Complete user management interface for administrators
- **User Statistics**: Total users, active users, admin count, and new registrations
- **User Search**: Search and filter users by name or email
- **User Actions**: View user details, activate/deactivate accounts, delete users
- **Role Management**: Admin vs standard user role distinction

### Demo Accounts

For testing purposes, the app includes demo accounts:

#### **Admin Account**
- **Email**: `admin@budgetbuddy.com`
- **Password**: `admin123`
- **Features**: Full admin dashboard access, user management capabilities

#### **Regular User Account**
- **Email**: `demo@example.com` (or create your own)
- **Password**: `password123`
- **Features**: Personal budget tracking, expense management

### How to Use

1. **First Visit**: You'll see the authentication screen with Sign In/Sign Up tabs
2. **Sign Up**: Create a new account or use the demo credentials
3. **Dashboard Access**: After login, access your personal budget dashboard
4. **Admin Features**: If you're an admin, you'll see an additional "Admin" tab
5. **Data Privacy**: Your budget data is completely separate from other users

### Technical Implementation

#### **Authentication Service**
- Mock authentication service for demo purposes
- localStorage-based user data persistence
- Password validation and user registration
- Session management and automatic login restoration

#### **Data Isolation**
- User-specific localStorage keys (`expenses-{userId}`, `budgets-{userId}`)
- Context-aware data management
- Secure data separation between users

#### **Admin Features**
- User CRUD operations
- Account status management
- Role-based access control
- Comprehensive user analytics

### Security Features

- **Input Validation**: Email format validation, password strength requirements
- **Access Control**: Role-based access to admin features
- **Data Protection**: User data isolation and secure storage
- **Session Security**: Proper login/logout handling

---

## 🎯 Getting Started

1. Visit the app at: https://imohweb.github.io/mybudget-buddy/
2. Try the demo accounts or create your own account
3. Start tracking your personal finances!
4. Admins can access the user management dashboard

---

*Note: This is a demo application with mock authentication. In a production environment, you would implement proper backend authentication with encrypted passwords, JWT tokens, and secure API endpoints.*
