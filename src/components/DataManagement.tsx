import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Download, Upload, Trash2, Database, Info } from 'lucide-react';
import { DataManager } from '../lib/dataManager';

export const DataManagement: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  const dataManager = DataManager.getInstance();

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleExport = () => {
    try {
      setIsProcessing(true);
      dataManager.downloadData();
      showMessage('success', 'Data exported successfully!');
    } catch (error) {
      showMessage('error', `Export failed: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    dataManager.uploadData(file)
      .then(result => {
        if (result.success) {
          showMessage('success', 'Data imported successfully! Please refresh the page.');
        } else {
          showMessage('error', result.error || 'Import failed');
        }
      })
      .finally(() => {
        setIsProcessing(false);
        // Reset file input
        event.target.value = '';
      });
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
      try {
        setIsProcessing(true);
        dataManager.clearAllData();
        showMessage('success', 'All data cleared! Please refresh the page.');
      } catch (error) {
        showMessage('error', `Clear failed: ${error}`);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const storageInfo = dataManager.getStorageInfo();
  const usagePercentage = (storageInfo.used / storageInfo.total) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export, import, and manage your application data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert className={message.type === 'error' ? 'border-red-500' : message.type === 'success' ? 'border-green-500' : 'border-blue-500'}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Storage Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4" />
              <span className="font-medium">Storage Usage</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Used: {storageInfo.used} KB</span>
                <span>Available: {storageInfo.available} KB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${usagePercentage > 80 ? 'bg-red-500' : usagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                ></div>
              </div>
              <Badge variant={usagePercentage > 80 ? 'destructive' : 'secondary'}>
                {usagePercentage.toFixed(1)}% used
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handleExport}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Data
            </Button>

            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="import-file"
                disabled={isProcessing}
              />
              <Button 
                onClick={() => document.getElementById('import-file')?.click()}
                disabled={isProcessing}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Import Data
              </Button>
            </div>

            <Button 
              onClick={handleClearData}
              disabled={isProcessing}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </Button>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Export:</strong> Download all data as a JSON file for backup</p>
            <p><strong>Import:</strong> Upload a previously exported JSON file to restore data</p>
            <p><strong>Clear:</strong> Permanently delete all application data</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Storage Limitations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">⚠️ localStorage Limitations:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Data only stored on this device/browser</li>
              <li>• No synchronization across devices</li>
              <li>• Data lost if browser cache is cleared</li>
              <li>• Limited to ~5-10MB storage</li>
              <li>• No real-time collaboration</li>
            </ul>
          </div>
          
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 Database Solutions:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Firebase:</strong> Google's real-time database with authentication</li>
              <li>• <strong>Supabase:</strong> Open-source Firebase alternative with PostgreSQL</li>
              <li>• <strong>PocketBase:</strong> Lightweight backend in a single file</li>
              <li>• <strong>Custom API:</strong> Node.js/Express with your preferred database</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
