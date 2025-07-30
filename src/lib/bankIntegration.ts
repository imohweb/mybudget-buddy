// Bank Integration Service for connecting to real banking APIs
// This service provides a unified interface for various banking APIs

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'credit';
  balance: number;
  currency: string;
}

interface BankTransaction {
  id: string;
  accountId: string;
  amount: number;
  description: string;
  date: string;
  category?: string;
  merchant?: string;
  type: 'debit' | 'credit';
}

interface BankProvider {
  id: string;
  name: string;
  type: 'open_banking' | 'plaid' | 'yodlee' | 'saltedge' | 'custom';
  regions: string[];
  features: string[];
}

export class BankIntegrationService {
  private static instance: BankIntegrationService;
  private providers: Map<string, BankProvider> = new Map();
  private connections: Map<string, any> = new Map();

  private constructor() {
    this.initializeProviders();
  }

  static getInstance(): BankIntegrationService {
    if (!BankIntegrationService.instance) {
      BankIntegrationService.instance = new BankIntegrationService();
    }
    return BankIntegrationService.instance;
  }

  private initializeProviders() {
    // European Open Banking (PSD2)
    this.providers.set('open_banking_eu', {
      id: 'open_banking_eu',
      name: 'European Open Banking',
      type: 'open_banking',
      regions: ['EU', 'UK'],
      features: ['accounts', 'transactions', 'balance']
    });

    // US Plaid
    this.providers.set('plaid', {
      id: 'plaid',
      name: 'Plaid',
      type: 'plaid',
      regions: ['US', 'CA', 'EU'],
      features: ['accounts', 'transactions', 'balance', 'identity']
    });

    // Salt Edge (Global)
    this.providers.set('saltedge', {
      id: 'saltedge',
      name: 'Salt Edge',
      type: 'saltedge',
      regions: ['EU', 'US', 'CA', 'AU'],
      features: ['accounts', 'transactions', 'balance']
    });

    // Yodlee (Global)
    this.providers.set('yodlee', {
      id: 'yodlee',
      name: 'Yodlee',
      type: 'yodlee',
      regions: ['US', 'CA', 'AU', 'IN'],
      features: ['accounts', 'transactions', 'balance', 'investments']
    });
  }

  getAvailableProviders(region?: string): BankProvider[] {
    const providers = Array.from(this.providers.values());
    if (region) {
      return providers.filter(p => p.regions.includes(region.toUpperCase()));
    }
    return providers;
  }

  // Plaid Integration
  async connectPlaid(config: {
    clientId: string;
    secret: string;
    environment: 'sandbox' | 'development' | 'production';
  }): Promise<void> {
    try {
      // This would integrate with Plaid's Link API
      console.log('Setting up Plaid connection...');
      
      // In a real implementation, you would:
      // 1. Initialize Plaid client
      // 2. Create a link token
      // 3. Open Plaid Link for user authentication
      
      // Simulated Plaid setup
      this.connections.set('plaid', {
        clientId: config.clientId,
        environment: config.environment,
        status: 'configured'
      });

      // Example: How to initialize Plaid Link in the frontend
      const linkConfig = {
        token: 'link_token_here', // Get from your backend
        onSuccess: (publicToken: string, metadata: any) => {
          // Send public token to your backend to exchange for access token
          this.exchangePlaidToken(publicToken);
        },
        onEvent: (eventName: string, metadata: any) => {
          console.log('Plaid event:', eventName, metadata);
        },
        onExit: (error: any, metadata: any) => {
          console.log('Plaid exit:', error, metadata);
        }
      };

      console.log('Plaid configuration ready:', linkConfig);
    } catch (error) {
      console.error('Failed to setup Plaid:', error);
      throw error;
    }
  }

  private async exchangePlaidToken(publicToken: string): Promise<void> {
    // In a real app, this would be done on your backend
    console.log('Exchanging public token for access token:', publicToken);
    
    // Backend endpoint would handle:
    // const response = await plaidClient.linkTokenExchange({
    //   public_token: publicToken
    // });
    // 
    // Store access_token securely and associate with user
  }

  // Open Banking (PSD2) Integration
  async connectOpenBanking(config: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    bankId: string;
  }): Promise<void> {
    try {
      console.log('Setting up Open Banking connection...');
      
      // Create authorization URL
      const authUrl = this.createOpenBankingAuthUrl(config);
      
      // In a real app, redirect user to bank's authorization page
      console.log('Redirect user to:', authUrl);
      
      // After user authorizes, you'll receive an authorization code
      // Exchange it for access token on your backend
      
    } catch (error) {
      console.error('Failed to setup Open Banking:', error);
      throw error;
    }
  }

  private createOpenBankingAuthUrl(config: any): string {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: 'accounts transactions',
      response_type: 'code',
      state: Math.random().toString(36)
    });

    return `https://auth.bank.com/oauth2/authorize?${params.toString()}`;
  }

  // Salt Edge Integration
  async connectSaltEdge(config: {
    appId: string;
    secret: string;
    environment: 'test' | 'live';
  }): Promise<void> {
    try {
      console.log('Setting up Salt Edge connection...');
      
      // Salt Edge Connect widget setup
      const connectConfig = {
        app_id: config.appId,
        secret: config.secret,
        theme: 'default',
        return_to: window.location.origin + '/banking/callback',
        provider_modes: ['web', 'oauth', 'api'],
        categorization: 'personal',
        show_consent_confirmation: true
      };

      console.log('Salt Edge configuration ready:', connectConfig);
      
    } catch (error) {
      console.error('Failed to setup Salt Edge:', error);
      throw error;
    }
  }

  // Fetch accounts from connected banks
  async getAccounts(providerId: string): Promise<BankAccount[]> {
    const connection = this.connections.get(providerId);
    if (!connection) {
      throw new Error(`No connection found for provider: ${providerId}`);
    }

    try {
      switch (providerId) {
        case 'plaid':
          return await this.getPlaidAccounts(connection);
        case 'open_banking_eu':
          return await this.getOpenBankingAccounts(connection);
        case 'saltedge':
          return await this.getSaltEdgeAccounts(connection);
        default:
          throw new Error(`Unsupported provider: ${providerId}`);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      return [];
    }
  }

  private async getPlaidAccounts(connection: any): Promise<BankAccount[]> {
    // In real implementation, call Plaid API
    // const response = await plaidClient.accountsGet({
    //   access_token: connection.accessToken
    // });
    // return response.data.accounts.map(account => ({...}));

    // Simulated response
    return [
      {
        id: 'plaid_acc_1',
        bankName: 'Chase Bank',
        accountNumber: '****1234',
        accountType: 'checking',
        balance: 2500.50,
        currency: 'USD'
      }
    ];
  }

  private async getOpenBankingAccounts(connection: any): Promise<BankAccount[]> {
    // Simulated Open Banking response
    return [
      {
        id: 'ob_acc_1',
        bankName: 'Deutsche Bank',
        accountNumber: '****5678',
        accountType: 'checking',
        balance: 1800.25,
        currency: 'EUR'
      }
    ];
  }

  private async getSaltEdgeAccounts(connection: any): Promise<BankAccount[]> {
    // Simulated Salt Edge response
    return [
      {
        id: 'se_acc_1',
        bankName: 'ING Bank',
        accountNumber: '****9012',
        accountType: 'savings',
        balance: 5000.00,
        currency: 'EUR'
      }
    ];
  }

  // Fetch transactions
  async getTransactions(
    providerId: string, 
    accountId: string, 
    fromDate?: string, 
    toDate?: string
  ): Promise<BankTransaction[]> {
    const connection = this.connections.get(providerId);
    if (!connection) {
      throw new Error(`No connection found for provider: ${providerId}`);
    }

    try {
      switch (providerId) {
        case 'plaid':
          return await this.getPlaidTransactions(connection, accountId, fromDate, toDate);
        case 'open_banking_eu':
          return await this.getOpenBankingTransactions(connection, accountId, fromDate, toDate);
        case 'saltedge':
          return await this.getSaltEdgeTransactions(connection, accountId, fromDate, toDate);
        default:
          throw new Error(`Unsupported provider: ${providerId}`);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      return [];
    }
  }

  private async getPlaidTransactions(
    connection: any, 
    accountId: string, 
    fromDate?: string, 
    toDate?: string
  ): Promise<BankTransaction[]> {
    // Simulated Plaid transactions
    return [
      {
        id: 'plaid_txn_1',
        accountId,
        amount: -25.50,
        description: 'STARBUCKS STORE #123',
        date: '2025-07-29',
        category: 'food',
        merchant: 'Starbucks',
        type: 'debit'
      },
      {
        id: 'plaid_txn_2',
        accountId,
        amount: -120.00,
        description: 'GROCERY STORE',
        date: '2025-07-28',
        category: 'food',
        merchant: 'Whole Foods',
        type: 'debit'
      }
    ];
  }

  private async getOpenBankingTransactions(
    connection: any, 
    accountId: string, 
    fromDate?: string, 
    toDate?: string
  ): Promise<BankTransaction[]> {
    // Simulated Open Banking transactions
    return [
      {
        id: 'ob_txn_1',
        accountId,
        amount: -45.20,
        description: 'REWE SUPERMARKET',
        date: '2025-07-29',
        category: 'food',
        type: 'debit'
      }
    ];
  }

  private async getSaltEdgeTransactions(
    connection: any, 
    accountId: string, 
    fromDate?: string, 
    toDate?: string
  ): Promise<BankTransaction[]> {
    // Simulated Salt Edge transactions
    return [
      {
        id: 'se_txn_1',
        accountId,
        amount: -35.80,
        description: 'ALBERT HEIJN',
        date: '2025-07-29',
        category: 'food',
        type: 'debit'
      }
    ];
  }

  // Auto-categorize transactions using AI/ML
  categorizeTransaction(description: string, amount: number): string {
    const description_lower = description.toLowerCase();
    
    // Simple rule-based categorization (can be enhanced with ML)
    if (description_lower.includes('grocery') || 
        description_lower.includes('supermarket') ||
        description_lower.includes('restaurant') ||
        description_lower.includes('starbucks') ||
        description_lower.includes('mcdonalds')) {
      return 'food';
    }
    
    if (description_lower.includes('gas') || 
        description_lower.includes('uber') ||
        description_lower.includes('taxi') ||
        description_lower.includes('parking')) {
      return 'transport';
    }
    
    if (description_lower.includes('amazon') || 
        description_lower.includes('shopping') ||
        description_lower.includes('store')) {
      return 'shopping';
    }
    
    if (description_lower.includes('movie') || 
        description_lower.includes('netflix') ||
        description_lower.includes('spotify')) {
      return 'entertainment';
    }
    
    if (description_lower.includes('electric') || 
        description_lower.includes('water') ||
        description_lower.includes('internet') ||
        description_lower.includes('phone')) {
      return 'bills';
    }
    
    return 'other';
  }

  // Sync transactions and create expenses automatically
  async syncTransactions(providerId: string): Promise<{ imported: number; errors: number }> {
    try {
      const accounts = await this.getAccounts(providerId);
      let imported = 0;
      let errors = 0;

      for (const account of accounts) {
        try {
          const transactions = await this.getTransactions(
            providerId, 
            account.id,
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
            new Date().toISOString()
          );

          for (const transaction of transactions) {
            if (transaction.type === 'debit' && transaction.amount < 0) {
              // Convert bank transaction to expense
              const expense = {
                amount: Math.abs(transaction.amount),
                category: this.categorizeTransaction(transaction.description, transaction.amount),
                description: transaction.description,
                date: transaction.date
              };

              // Here you would add the expense to your app
              console.log('Auto-imported expense:', expense);
              imported++;
            }
          }
        } catch (error) {
          console.error(`Error syncing account ${account.id}:`, error);
          errors++;
        }
      }

      return { imported, errors };
    } catch (error) {
      console.error('Sync failed:', error);
      return { imported: 0, errors: 1 };
    }
  }
}

export default BankIntegrationService;
