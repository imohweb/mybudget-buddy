import { Budget, formatCurrency, getCategoryInfo } from './types';

export interface EmailAlert {
  to: string;
  subject: string;
  body: string;
  budgetId: string;
  timestamp: string;
}

export class EmailService {
  private static instance: EmailService;
  private alerts: EmailAlert[] = [];
  private emailConfig: {
    serviceType: 'emailjs' | 'webhook' | 'smtp' | 'simulation';
    apiKey?: string;
    webhookUrl?: string;
    smtpConfig?: {
      host: string;
      port: number;
      user: string;
      pass: string;
    };
  };

  private constructor() {
    // Default to simulation mode - can be configured later
    this.emailConfig = {
      serviceType: 'simulation'
    };
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  // Configure email service
  configure(config: EmailService['emailConfig']) {
    this.emailConfig = config;
  }

  async sendBudgetAlert(
    userEmail: string, 
    budgetData: {
      id: string;
      categoryId: string;
      amount: number;
      spent: number;
      percentage: number;
      period: 'monthly' | 'yearly';
    }
  ): Promise<void> {
    const category = getCategoryInfo(budgetData.categoryId);
    const remaining = budgetData.amount - budgetData.spent;

    const alert: EmailAlert = {
      to: userEmail,
      subject: `🚨 Budget Alert: ${category.name} - ${budgetData.percentage.toFixed(1)}% Used`,
      body: this.generateEmailBody(budgetData, category.name, remaining),
      budgetId: budgetData.id,
      timestamp: new Date().toISOString()
    };

    // Store alert for reference
    this.alerts.push(alert);

    try {
      switch (this.emailConfig.serviceType) {
        case 'emailjs':
          await this.sendViaEmailJS(alert);
          break;
        case 'webhook':
          await this.sendViaWebhook(alert);
          break;
        case 'smtp':
          await this.sendViaSMTP(alert);
          break;
        default:
          await this.simulateEmail(alert);
      }
    } catch (error) {
      console.error('Failed to send email alert:', error);
      throw error;
    }
  }

  private async sendViaEmailJS(alert: EmailAlert): Promise<void> {
    // EmailJS integration for client-side email sending
    if (!this.emailConfig.apiKey) {
      throw new Error('EmailJS API key not configured');
    }

    const emailJSData = {
      service_id: 'your_service_id',
      template_id: 'budget_alert_template',
      user_id: this.emailConfig.apiKey,
      template_params: {
        to_email: alert.to,
        subject: alert.subject,
        message: alert.body,
        timestamp: alert.timestamp
      }
    };

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailJSData)
    });

    if (!response.ok) {
      throw new Error(`EmailJS failed: ${response.statusText}`);
    }

    console.log('✅ Email sent via EmailJS to:', alert.to);
  }

  private async sendViaWebhook(alert: EmailAlert): Promise<void> {
    if (!this.emailConfig.webhookUrl) {
      throw new Error('Webhook URL not configured');
    }

    const response = await fetch(this.emailConfig.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alert)
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`);
    }

    console.log('✅ Email sent via webhook to:', alert.to);
  }

  private async sendViaSMTP(alert: EmailAlert): Promise<void> {
    // This would typically be handled by a backend service
    // For security reasons, SMTP credentials shouldn't be in frontend code
    console.warn('SMTP sending should be handled by backend service');
    throw new Error('SMTP sending not supported in frontend - use webhook instead');
  }

  private async simulateEmail(alert: EmailAlert): Promise<void> {
    console.log('📧 Email Alert Generated:', alert);
    
    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(alert.subject, {
        body: `Budget alert for ${getCategoryInfo(alert.budgetId).name}`,
        icon: '/favicon.ico'
      });
    }
    
    // Simulate email sending delay
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`✅ Simulated email sent to ${alert.to}`);
        resolve();
      }, 1000);
    });
  }

  private generateEmailBody(
    budgetData: {
      amount: number;
      spent: number;
      percentage: number;
      period: 'monthly' | 'yearly';
    },
    categoryName: string,
    remaining: number
  ): string {
    return `
Dear Budget Buddy User,

🚨 Budget Alert: ${categoryName}

Your ${budgetData.period} budget for ${categoryName} has reached ${budgetData.percentage.toFixed(1)}% of the limit.

Budget Details:
• Category: ${categoryName}
• Budget Limit: ${formatCurrency(budgetData.amount)}
• Amount Spent: ${formatCurrency(budgetData.spent)}
• Remaining: ${formatCurrency(remaining)}
• Usage: ${budgetData.percentage.toFixed(1)}%

${budgetData.percentage >= 100 
  ? '⚠️ You have exceeded your budget limit!' 
  : '💡 Consider reviewing your spending to stay within budget.'
}

Best regards,
Your Budget Buddy Team

---
This is an automated message. Please do not reply to this email.
    `.trim();
  }

  getAlerts(): EmailAlert[] {
    return [...this.alerts];
  }

  clearAlerts(): void {
    this.alerts = [];
  }

  getAlertsForBudget(budgetId: string): EmailAlert[] {
    return this.alerts.filter(alert => alert.budgetId === budgetId);
  }
}

export default EmailService;
