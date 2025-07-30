# 💰 Budget Buddy - Personal Finance Tracker

A modern, responsive budget tracking application built with React 19, TypeScript, and Tailwind CSS. Track your expenses, set budgets, and get intelligent notifications to stay on top of your finances.

## 🌐 Live Demo

**[View Live App](https://imohweb.github.io/mybudget-buddy/)**

## ✨ Features

### 💼 Core Functionality
- **📊 Expense Tracking**: Add, categorize, and manage your daily expenses
- **🎯 Budget Management**: Set monthly and yearly budgets for different categories
- **📈 Visual Analytics**: Interactive charts and spending trend analysis
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### 🔔 Smart Notifications
- **Multi-threshold Email Alerts**: Get notified at 80%, 85%, and 100% of budget usage
- **Browser Notifications**: Instant alerts when adding expenses
- **Email Integration**: Support for EmailJS, webhooks, and SMTP

### 🏦 Banking Integration (Framework)
- **Multiple Providers**: Support for Plaid, Open Banking PSD2, Salt Edge, and Yodlee
- **Automatic Categorization**: AI-powered expense categorization
- **Real-time Sync**: Connect bank accounts for automatic expense import
- **Secure**: Industry-standard security practices

### 🛠️ Technical Features
- **Local Storage**: Data persists locally in your browser
- **Offline Ready**: Works without internet connection
- **Error Boundaries**: Graceful error handling
- **TypeScript**: Full type safety and better developer experience
- **Modern React**: Built with React 19 and latest hooks

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/imohweb/mybudget-buddy.git
   cd mybudget-buddy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:5174
   ```

### Build for Production

```bash
# Build the app
npm run build

# Preview the production build
npm run preview
```

## 📖 Usage Guide

### 1. Dashboard Overview
- View your monthly spending summary
- See budget progress for each category
- Quick expense entry form

### 2. Adding Expenses
- Click "Add Expense" tab
- Select category, enter amount and description
- Choose date (defaults to today)
- Save to track immediately

### 3. Budget Management
- Go to "Budgets" tab
- Set monthly or yearly budget limits
- Monitor spending vs. budget in real-time
- Get visual indicators when approaching limits

### 4. Email Notifications
- Visit "Settings" → "Email Notifications"
- Configure your preferred email service
- Test notifications with the built-in testing panel
- Set custom threshold percentages

### 5. Banking Integration
- Go to "Settings" → "Banking"
- Choose your banking provider
- Connect accounts with API credentials
- Enable automatic expense import

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Charts**: Recharts
- **Icons**: Phosphor Icons
- **Notifications**: Sonner
- **Build Tool**: Vite
- **Email**: EmailJS, Custom Webhooks
- **Banking APIs**: Plaid, Open Banking, Salt Edge, Yodlee

## 📂 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── AddExpense.tsx   # Expense form
│   ├── BudgetManager.tsx # Budget management
│   ├── ExpenseList.tsx  # Expense listing
│   ├── Settings.tsx     # Configuration panel
│   └── SpendingTrends.tsx # Analytics
├── contexts/            # React contexts
│   └── BudgetContext.tsx # Global state management
├── lib/                 # Utilities and services
│   ├── types.ts         # TypeScript interfaces
│   ├── utils.ts         # Helper functions
│   ├── emailService.ts  # Email notifications
│   └── bankIntegration.ts # Banking APIs
├── hooks/               # Custom React hooks
└── styles/              # CSS files
```

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# Banking API Keys (choose one)
VITE_PLAID_CLIENT_ID=your_plaid_client_id
VITE_PLAID_SECRET=your_plaid_secret
VITE_PLAID_ENV=sandbox # or development/production

# Webhook URL for notifications
VITE_WEBHOOK_URL=your_webhook_url
```

### Email Service Setup

1. **EmailJS** (Recommended)
   - Sign up at [emailjs.com](https://www.emailjs.com/)
   - Create service and template
   - Add credentials to environment variables

2. **Custom Webhook**
   - Set up your webhook endpoint
   - Configure URL in environment variables

### Banking Integration Setup

1. **Plaid** (US/Canada/Europe)
   - Sign up at [plaid.com](https://plaid.com/)
   - Get API credentials
   - Add to environment variables

2. **Open Banking** (Europe)
   - Register with PSD2 provider
   - Configure API access

## 🚀 Deployment

### GitHub Pages (Current)

The app is automatically deployed to GitHub Pages via GitHub Actions:

1. Push changes to `master` branch
2. GitHub Actions builds and deploys automatically
3. Access at: https://imohweb.github.io/mybudget-buddy/

### Manual Deployment

```bash
# Deploy to GitHub Pages
npm run deploy
```

### Other Platforms

- **Vercel**: Connect GitHub repository
- **Netlify**: Drag and drop `dist` folder
- **Firebase Hosting**: Use Firebase CLI

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Documentation

- **Detailed Setup Guide**: See [ENHANCED_README.md](ENHANCED_README.md)
- **Deployment Guide**: See [GITHUB_PAGES_GUIDE.md](GITHUB_PAGES_GUIDE.md)
- **Quick Deploy**: See [DEPLOY_QUICK.md](DEPLOY_QUICK.md)
- **Troubleshooting**: See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Charts powered by [Recharts](https://recharts.org/)
- Icons by [Phosphor Icons](https://phosphoricons.com/)

---

**Made with ❤️ for better financial management**
