# Budget Buddy - Enhanced Finance Tracker

A comprehensive personal finance tracker with email notifications and bank integration capabilities.

## 🚀 New Features

### 1. Enhanced Email Notification System
- **Multi-threshold alerts**: 80%, 85%, and 100% budget usage
- **Multiple email services**: EmailJS, Webhook, SMTP simulation
- **Real-time browser notifications**
- **Customizable alert thresholds**

### 2. Bank Account Integration
- **Multi-provider support**: Plaid, Open Banking (PSD2), Salt Edge, Yodlee
- **Automatic transaction import**
- **AI-powered expense categorization**
- **Secure authentication flows**

### 3. Testing & Development Tools
- **Budget testing panel** for triggering alerts
- **Email testing functionality**
- **Bank connection simulation**

## 🔧 Email Setup Guide

### Option 1: EmailJS (Recommended for beginners)
1. Sign up at [emailjs.com](https://emailjs.com)
2. Create a service (Gmail, Outlook, etc.)
3. Create an email template
4. Get your public key
5. Configure in Settings → Notifications

### Option 2: Custom Webhook
1. Set up your own email API endpoint
2. Configure webhook URL in settings
3. Handle POST requests with email data

### Option 3: Browser Simulation (Default)
- Works out of the box
- Shows browser notifications
- Logs to console

## 🏦 Bank Integration Setup

### For US Users (Plaid)
```javascript
// In production, you'd need:
const plaidConfig = {
  clientId: 'your_plaid_client_id',
  secret: 'your_plaid_secret',
  environment: 'production' // or 'sandbox' for testing
};
```

### For EU Users (Open Banking PSD2)
```javascript
// Requires bank-specific setup
const openBankingConfig = {
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret',
  redirectUri: 'https://yourapp.com/callback',
  bankId: 'bank_identifier'
};
```

### For Global Users (Salt Edge)
```javascript
const saltEdgeConfig = {
  appId: 'your_app_id',
  secret: 'your_secret',
  environment: 'live' // or 'test'
};
```

## 🔐 Security & Privacy

- **Local data storage**: All data stays in your browser
- **No external servers**: Your financial data never leaves your device
- **Optional cloud sync**: Only when you explicitly configure email/bank services
- **Encrypted connections**: All external APIs use HTTPS

## 📱 How to Test Budget Alerts

1. Go to **Settings** → **Notifications**
2. Enable email alerts and set your email
3. Create a budget in the **Budgets** tab
4. Use the **Budget Alert Testing** panel to:
   - Trigger 80% warning alerts
   - Trigger 85% critical alerts
   - Exceed budget limits

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx          # Main overview
│   ├── AddExpense.tsx         # Expense entry form
│   ├── ExpenseList.tsx        # Expense history
│   ├── BudgetManager.tsx      # Budget management
│   ├── SpendingTrends.tsx     # Charts and analytics
│   ├── Settings.tsx           # App configuration
│   └── BudgetTestingPanel.tsx # Testing tools
├── contexts/
│   └── BudgetContext.tsx      # Global state management
├── lib/
│   ├── types.ts               # TypeScript definitions
│   ├── emailService.ts        # Email notification service
│   └── bankIntegration.ts     # Bank API integration
├── hooks/
│   └── useLocalStorage.ts     # Local storage hook
└── App.tsx                    # Main application
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌟 Features

### Core Features
- ✅ Expense logging with categories
- ✅ Budget management (monthly/yearly)
- ✅ Spending trends visualization
- ✅ Local data persistence

### Enhanced Features
- ✅ Email budget alerts (80%, 85%, 100%)
- ✅ Bank account integration
- ✅ Automatic transaction import
- ✅ AI expense categorization
- ✅ Multi-provider support
- ✅ Real-time notifications
- ✅ Testing tools

### Supported Banks & Providers

#### United States
- Chase Bank
- Bank of America
- Wells Fargo
- Citibank
- Capital One

#### Europe
- Deutsche Bank
- Sparkasse
- ING Bank
- And 3000+ other banks via Open Banking

#### Global
- Any bank supported by Salt Edge or Yodlee

## 📧 Email Template Example

When budget reaches 85%:
```
Subject: 🚨 Budget Alert: Food & Dining - 85.3% Used

Your monthly budget for Food & Dining has reached 85.3% of the limit.

Budget Details:
• Category: Food & Dining
• Budget Limit: €500.00
• Amount Spent: €426.50
• Remaining: €73.50
• Usage: 85.3%

💡 Consider reviewing your spending to stay within budget.
```

## 🔗 API Integration Examples

### EmailJS Setup
```javascript
// Configure EmailJS in Settings
const emailConfig = {
  serviceType: 'emailjs',
  apiKey: 'your_emailjs_public_key'
};
```

### Plaid Integration
```javascript
// Initialize Plaid (requires backend)
const plaidHandler = Plaid.create({
  token: linkToken,
  onSuccess: (publicToken, metadata) => {
    // Exchange for access token on backend
  }
});
```

### Open Banking
```javascript
// Redirect to bank authorization
window.location.href = 'https://bank.com/oauth2/authorize?' + params;
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Deploy automatically on push
3. Set environment variables for API keys

### Netlify
1. Drag and drop `dist` folder
2. Or connect Git repository
3. Configure build command: `npm run build`

### Self-hosted
1. Build: `npm run build`
2. Serve `dist` folder with any web server
3. Configure HTTPS for security

## 📋 Roadmap

- [ ] Mobile app (React Native)
- [ ] Investment tracking
- [ ] Bill reminders
- [ ] Receipt scanning
- [ ] Multi-currency support
- [ ] Family sharing
- [ ] Advanced analytics
- [ ] API for third-party integrations

## 🆘 Troubleshooting

### Email Not Sending
1. Check email service configuration
2. Verify API keys are correct
3. Check browser console for errors
4. Test with simulation mode first

### Bank Connection Failed
1. Ensure you're using correct provider for your region
2. Check API credentials
3. Verify redirect URLs match configuration
4. Try sandbox/test mode first

### Budget Alerts Not Triggering
1. Make sure email notifications are enabled
2. Check if thresholds are set correctly
3. Verify budget amounts are properly configured
4. Use the testing panel to simulate alerts

## 📞 Support

For issues or questions:
1. Check the testing panel in Settings
2. Review browser console for errors
3. Verify all configurations are correct
4. Use simulation modes for testing

---

Built with ❤️ using React, TypeScript, and modern web technologies.
