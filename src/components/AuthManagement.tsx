import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { RefreshCw, UserX, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import { AuthService } from '../lib/auth';
import { toast } from 'sonner';

export const AuthManagement: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState<{
    total: number;
    duplicateEmails: string[];
    usersWithoutPasswords: string[];
  } | null>(null);

  const authService = AuthService.getInstance();

  const loadStats = () => {
    const userStats = authService.getUserStatistics();
    setStats(userStats);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleCleanupDuplicates = async () => {
    if (!window.confirm('Are you sure you want to remove duplicate user accounts? This will keep only the first registration for each email.')) {
      return;
    }

    setIsProcessing(true);
    try {
      const result = await authService.cleanupDuplicateUsers();
      if (result.success) {
        toast.success(`Removed ${result.removed} duplicate accounts`);
        loadStats();
      } else {
        toast.error(result.error || 'Failed to cleanup duplicates');
      }
    } catch (error) {
      toast.error('Failed to cleanup duplicates');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefreshStats = () => {
    loadStats();
    toast.success('Statistics refreshed');
  };

  if (!stats) {
    return <div>Loading authentication statistics...</div>;
  }

  const hasIssues = stats.duplicateEmails.length > 0 || stats.usersWithoutPasswords.length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Authentication Management
          </CardTitle>
          <CardDescription>
            Manage user authentication issues and cleanup data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Users</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${stats.duplicateEmails.length > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center gap-2">
                {stats.duplicateEmails.length > 0 ? (
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                <div>
                  <p className={`text-sm font-medium ${stats.duplicateEmails.length > 0 ? 'text-orange-800' : 'text-green-800'}`}>
                    Duplicate Emails
                  </p>
                  <p className={`text-2xl font-bold ${stats.duplicateEmails.length > 0 ? 'text-orange-900' : 'text-green-900'}`}>
                    {stats.duplicateEmails.length}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${stats.usersWithoutPasswords.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center gap-2">
                {stats.usersWithoutPasswords.length > 0 ? (
                  <UserX className="w-5 h-5 text-red-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                <div>
                  <p className={`text-sm font-medium ${stats.usersWithoutPasswords.length > 0 ? 'text-red-800' : 'text-green-800'}`}>
                    Missing Passwords
                  </p>
                  <p className={`text-2xl font-bold ${stats.usersWithoutPasswords.length > 0 ? 'text-red-900' : 'text-green-900'}`}>
                    {stats.usersWithoutPasswords.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Issues Alert */}
          {hasIssues && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Authentication Issues Detected:</strong>
                <ul className="mt-2 space-y-1">
                  {stats.duplicateEmails.length > 0 && (
                    <li>• {stats.duplicateEmails.length} email(s) have duplicate registrations</li>
                  )}
                  {stats.usersWithoutPasswords.length > 0 && (
                    <li>• {stats.usersWithoutPasswords.length} user(s) missing password data</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Duplicate Emails Details */}
          {stats.duplicateEmails.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-800 mb-2">Duplicate Email Addresses:</h4>
              <div className="space-y-1">
                {stats.duplicateEmails.map(email => (
                  <Badge key={email} variant="outline" className="border-orange-300 text-orange-700">
                    {email}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={handleCleanupDuplicates}
              disabled={isProcessing || stats.duplicateEmails.length === 0}
              variant={stats.duplicateEmails.length > 0 ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              <UserX className="w-4 h-4" />
              Cleanup Duplicates
            </Button>

            <Button 
              onClick={handleRefreshStats}
              disabled={isProcessing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Stats
            </Button>
          </div>

          {/* Status Message */}
          {!hasIssues && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>✓ All authentication data is clean!</strong> No duplicate accounts or missing passwords detected.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Authentication Fix Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">🔧 Fixed Issues:</h4>
              <ul className="text-blue-700 space-y-1">
                <li>• ✅ Passwords are now properly stored and verified</li>
                <li>• ✅ Registration uses your actual password (not hardcoded ones)</li>
                <li>• ✅ Login verifies against your registered password</li>
                <li>• ✅ Existing users migrated with default passwords</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">⚠️ For Existing Duplicate Accounts:</h4>
              <ul className="text-yellow-700 space-y-1">
                <li>• Click "Cleanup Duplicates" to remove extra registrations</li>
                <li>• Only the first registration for each email will be kept</li>
                <li>• You can then login with your original password</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">✨ Default Login Credentials:</h4>
              <ul className="text-green-700 space-y-1">
                <li>• <strong>Admin:</strong> admin@budgetbuddy.com / admin123</li>
                <li>• <strong>Existing users:</strong> Your email / password123 (until you re-register)</li>
                <li>• <strong>New registrations:</strong> Your email / your chosen password</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
