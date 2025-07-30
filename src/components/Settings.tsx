import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Gear, 
  Bell, 
  Bank, 
  Shield, 
  Warning, 
  CheckCircle, 
  Link, 
  Info 
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import EmailService from '@/lib/emailService';
import BankIntegrationService from '@/lib/bankIntegration';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { BudgetTestingPanel } from './BudgetTestingPanel';

interface NotificationSettings {
  emailEnabled: boolean;
  email: string;
  thresholds: {
    warning: number; // 80%
    critical: number; // 85%
    exceeded: boolean; // 100%
  };
  serviceType: 'emailjs' | 'webhook' | 'smtp' | 'simulation';
  emailJSKey?: string;
  webhookUrl?: string;
}

interface BankConnection {
  id: string;
  bankName: string;
  accountType: string;
  lastSync: string;
  status: 'connected' | 'disconnected' | 'error';
}

export function Settings() {
  const [notifications, setNotifications] = useLocalStorage<NotificationSettings>('notifications', {
    emailEnabled: true,
    email: 'user@example.com',
    thresholds: {
      warning: 80,
      critical: 85,
      exceeded: true
    },
    serviceType: 'simulation'
  });

  const [bankConnections, setBankConnections] = useLocalStorage<BankConnection[]>('bank-connections', []);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const emailService = EmailService.getInstance();
  const bankService = BankIntegrationService.getInstance();

  useEffect(() => {
    // Configure email service when settings change
    emailService.configure({
      serviceType: notifications.serviceType,
      apiKey: notifications.emailJSKey,
      webhookUrl: notifications.webhookUrl
    });
  }, [notifications, emailService]);

  const handleTestEmail = async () => {
    if (!notifications.email) {
      toast.error('Please enter an email address first');
      return;
    }

    setIsTestingEmail(true);
    try {
      await emailService.sendBudgetAlert(notifications.email, {
        id: 'test',
        categoryId: 'food',
        amount: 100,
        spent: 85,
        percentage: 85,
        period: 'monthly'
      });
      toast.success('Test email sent successfully!');
    } catch (error) {
      toast.error('Failed to send test email');
      console.error(error);
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleConnectBank = async (bankName: string) => {
    try {
      // In a real app, this would show a proper bank connection flow
      const providers = bankService.getAvailableProviders();
      const provider = providers.find(p => p.name.toLowerCase().includes(bankName.toLowerCase().split(' ')[0]));
      
      if (provider) {
        // Simulate the connection process
        switch (provider.type) {
          case 'plaid':
            await bankService.connectPlaid({
              clientId: 'demo_client_id',
              secret: 'demo_secret',
              environment: 'sandbox'
            });
            break;
          case 'open_banking':
            await bankService.connectOpenBanking({
              clientId: 'demo_client_id',
              clientSecret: 'demo_secret',
              redirectUri: window.location.origin + '/callback',
              bankId: 'demo_bank'
            });
            break;
          case 'saltedge':
            await bankService.connectSaltEdge({
              appId: 'demo_app_id',
              secret: 'demo_secret',
              environment: 'test'
            });
            break;
        }
      }

      // Simulate successful connection
      const newConnection: BankConnection = {
        id: Date.now().toString(),
        bankName,
        accountType: 'Checking',
        lastSync: new Date().toISOString(),
        status: 'connected'
      };

      setBankConnections(current => [...current, newConnection]);
      toast.success(`Connected to ${bankName} successfully!`);
    } catch (error) {
      toast.error('Failed to connect to bank');
      console.error(error);
    }
  };

  const handleSyncTransactions = async (connectionId: string) => {
    setIsSyncing(true);
    try {
      const connection = bankConnections.find(c => c.id === connectionId);
      if (!connection) return;

      const result = await bankService.syncTransactions('plaid'); // Use appropriate provider
      
      if (result.imported > 0) {
        toast.success(`Imported ${result.imported} new transactions`);
        
        // Update last sync time
        setBankConnections(current => 
          current.map(conn => 
            conn.id === connectionId 
              ? { ...conn, lastSync: new Date().toISOString() }
              : conn
          )
        );
      } else {
        toast.info('No new transactions found');
      }
      
      if (result.errors > 0) {
        toast.warning(`${result.errors} errors occurred during sync`);
      }
    } catch (error) {
      toast.error('Failed to sync transactions');
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnectBank = (id: string) => {
    setBankConnections(current => current.filter(conn => conn.id !== id));
    toast.success('Bank account disconnected');
  };

  const supportedBanks = [
    { id: 'chase', name: 'Chase Bank', logo: '🏦' },
    { id: 'bofa', name: 'Bank of America', logo: '🏛️' },
    { id: 'wells', name: 'Wells Fargo', logo: '🏦' },
    { id: 'citi', name: 'Citibank', logo: '🏛️' },
    { id: 'capital', name: 'Capital One', logo: '🏦' },
    { id: 'deutsche', name: 'Deutsche Bank', logo: '🇩🇪' },
    { id: 'sparkasse', name: 'Sparkasse', logo: '🇩🇪' },
    { id: 'ing', name: 'ING Bank', logo: '🇳🇱' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure notifications, bank connections, and app preferences
        </p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="banking" className="flex items-center gap-2">
            <Bank className="h-4 w-4" />
            Banking
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Enable Email Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive budget alerts via email
                  </p>
                </div>
                <Switch
                  checked={notifications.emailEnabled}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, emailEnabled: checked }))
                  }
                />
              </div>

              {notifications.emailEnabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex gap-2">
                      <Input
                        id="email"
                        type="email"
                        value={notifications.email}
                        onChange={(e) => 
                          setNotifications(prev => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="your@email.com"
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleTestEmail}
                        disabled={isTestingEmail}
                      >
                        {isTestingEmail ? 'Sending...' : 'Test'}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Alert Thresholds</Label>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="warning-threshold">Warning Threshold (%)</Label>
                        <Input
                          id="warning-threshold"
                          type="number"
                          min="50"
                          max="100"
                          value={notifications.thresholds.warning}
                          onChange={(e) => 
                            setNotifications(prev => ({
                              ...prev,
                              thresholds: { ...prev.thresholds, warning: parseInt(e.target.value) }
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="critical-threshold">Critical Threshold (%)</Label>
                        <Input
                          id="critical-threshold"
                          type="number"
                          min="70"
                          max="100"
                          value={notifications.thresholds.critical}
                          onChange={(e) => 
                            setNotifications(prev => ({
                              ...prev,
                              thresholds: { ...prev.thresholds, critical: parseInt(e.target.value) }
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-service">Email Service</Label>
                    <Select
                      value={notifications.serviceType}
                      onValueChange={(value: any) => 
                        setNotifications(prev => ({ ...prev, serviceType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simulation">Simulation (Browser Only)</SelectItem>
                        <SelectItem value="emailjs">EmailJS (Free)</SelectItem>
                        <SelectItem value="webhook">Custom Webhook</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {notifications.serviceType === 'emailjs' && (
                    <div className="space-y-2">
                      <Label htmlFor="emailjs-key">EmailJS Public Key</Label>
                      <Input
                        id="emailjs-key"
                        value={notifications.emailJSKey || ''}
                        onChange={(e) => 
                          setNotifications(prev => ({ ...prev, emailJSKey: e.target.value }))
                        }
                        placeholder="Your EmailJS public key"
                      />
                      <p className="text-xs text-muted-foreground">
                        Get your key from <a href="https://emailjs.com" target="_blank" className="text-primary hover:underline">emailjs.com</a>
                      </p>
                    </div>
                  )}

                  {notifications.serviceType === 'webhook' && (
                    <div className="space-y-2">
                      <Label htmlFor="webhook-url">Webhook URL</Label>
                      <Input
                        id="webhook-url"
                        value={notifications.webhookUrl || ''}
                        onChange={(e) => 
                          setNotifications(prev => ({ ...prev, webhookUrl: e.target.value }))
                        }
                        placeholder="https://your-api.com/send-email"
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <BudgetTestingPanel />
        </TabsContent>

        <TabsContent value="banking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bank className="h-5 w-5" />
                Bank Connections
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Bank integration is currently in development. This feature will allow automatic expense import from your bank accounts.
                </AlertDescription>
              </Alert>

              {bankConnections.length > 0 && (
                <div className="space-y-4">
                  <Label>Connected Accounts</Label>
                  {bankConnections.map((connection) => (
                    <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">🏦</div>
                        <div>
                          <p className="font-medium">{connection.bankName}</p>
                          <p className="text-sm text-muted-foreground">
                            {connection.accountType} • Last sync: {new Date(connection.lastSync).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={connection.status === 'connected' ? 'default' : 'destructive'}>
                          {connection.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSyncTransactions(connection.id)}
                          disabled={isSyncing}
                        >
                          {isSyncing ? 'Syncing...' : 'Sync'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnectBank(connection.id)}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <Label>Add Bank Connection</Label>
                <div className="grid gap-3 md:grid-cols-2">
                  {supportedBanks.map((bank) => (
                    <Button
                      key={bank.id}
                      variant="outline"
                      className="justify-start h-auto p-4"
                      onClick={() => handleConnectBank(bank.name)}
                      disabled={bankConnections.some(conn => conn.bankName === bank.name)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{bank.logo}</span>
                        <span>{bank.name}</span>
                      </div>
                      {bankConnections.some(conn => conn.bankName === bank.name) && (
                        <CheckCircle className="h-4 w-4 ml-auto text-green-600" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your financial data is stored locally in your browser and never sent to external servers without your explicit consent.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Data Export</Label>
                    <p className="text-sm text-muted-foreground">
                      Download your data as JSON
                    </p>
                  </div>
                  <Button variant="outline">
                    Export Data
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Clear All Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete all expenses and budgets
                    </p>
                  </div>
                  <Button variant="destructive">
                    Clear Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
