import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, X, Bell, Database, Shield, Cloud, Zap, Send } from 'lucide-react';
import { requestNotificationPermission, createUserProfile, getUserProfile, auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useAuth } from '@/lib/api';

interface FirebaseTestProps {
  onBack: () => void;
}

const FirebaseTest: React.FC<FirebaseTestProps> = ({ onBack }) => {
  const [notificationToken, setNotificationToken] = useState<string | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [testResults, setTestResults] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();
  const { saveNotificationToken, sendEmergencyNotification } = useFirebase();
  const { getCurrentUser } = useAuth();

  const testNotificationPermission = async () => {
    try {
      const result = await requestNotificationPermission();

      if (result.success && result.token) {
        setNotificationToken(result.token);
        setNotificationStatus('granted');
        setTestResults(prev => ({...prev, notifications: true}));

        toast({
          title: "✅ Notifications Enabled",
          description: "Push notifications are now configured!"
        });
      } else {
        setNotificationStatus('denied');
        setTestResults(prev => ({...prev, notifications: false}));

        toast({
          title: "❌ Notification Permission Denied",
          description: result.error as string,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Notification test failed:', error);
      setTestResults(prev => ({...prev, notifications: false}));

      toast({
        title: "❌ Notification Test Failed",
        description: "Unable to request notification permissions",
        variant: "destructive"
      });
    }
  };

  const testFirestoreConnection = async () => {
    try {
      const testUserId = 'test-user-' + Date.now();
      const testProfile = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+91 98765 43210'
      };

      // Test creating a document
      const createResult = await createUserProfile(testUserId, testProfile);

      if (createResult.success) {
        // Test reading the document
        const readResult = await getUserProfile(testUserId);

        if (readResult.success && readResult.data) {
          setTestResults(prev => ({...prev, firestore: true}));

          toast({
            title: "✅ Firestore Connected",
            description: "Database read/write operations working!"
          });
        } else {
          throw new Error('Failed to read test document');
        }
      } else {
        throw new Error('Failed to create test document');
      }
    } catch (error) {
      console.error('Firestore test failed:', error);
      setTestResults(prev => ({...prev, firestore: false}));

      toast({
        title: "❌ Firestore Connection Failed",
        description: "Database operations are not working",
        variant: "destructive"
      });
    }
  };

  const testAuthentication = async () => {
    try {
      // Test if Auth is properly initialized
      if (auth && auth.app) {
        setTestResults(prev => ({...prev, auth: true}));

        toast({
          title: "✅ Authentication Ready",
          description: "Firebase Auth is properly configured!"
        });
      } else {
        throw new Error('Auth not properly initialized');
      }
    } catch (error) {
      console.error('Auth test failed:', error);
      setTestResults(prev => ({...prev, auth: false}));

      toast({
        title: "❌ Authentication Failed",
        description: "Firebase Auth configuration issue",
        variant: "destructive"
      });
    }
  };

  const testTokenSaving = async () => {
    try {
      if (!notificationToken) {
        throw new Error('No notification token available. Run notification test first.');
      }

      const result = await saveNotificationToken(notificationToken);

      if (result.success) {
        setTestResults(prev => ({...prev, tokenSaving: true}));

        toast({
          title: "✅ Token Saved to Backend",
          description: "Notification token successfully stored in MongoDB!"
        });
      } else {
        throw new Error(result.error || 'Failed to save token');
      }
    } catch (error) {
      console.error('Token saving test failed:', error);
      setTestResults(prev => ({...prev, tokenSaving: false}));

      toast({
        title: "❌ Token Saving Failed",
        description: error instanceof Error ? error.message : "Unable to save token to backend",
        variant: "destructive"
      });
    }
  };

  const testEmergencyNotification = async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('User not logged in. Please log into SURAKSHA first.');
      }

      const emergencyData = {
        userName: currentUser.name || 'Test User',
        userPhone: currentUser.phone,
        location: {
          latitude: 17.441759,
          longitude: 78.650033,
          address: 'Test Location, Hyderabad, India'
        },
        contactEmails: [currentUser.email] // Send test notification to self
      };

      const result = await sendEmergencyNotification(emergencyData);

      if (result.success) {
        setTestResults(prev => ({...prev, emergencyNotification: true}));

        toast({
          title: "✅ Emergency Notification Sent",
          description: `Sent to ${result.notificationsSent || 0} contacts. Check your devices!`
        });
      } else {
        throw new Error(result.error || 'Failed to send emergency notification');
      }
    } catch (error) {
      console.error('Emergency notification test failed:', error);
      setTestResults(prev => ({...prev, emergencyNotification: false}));

      toast({
        title: "❌ Emergency Notification Failed",
        description: error instanceof Error ? error.message : "Unable to send emergency notification",
        variant: "destructive"
      });
    }
  };

  const runAllTests = async () => {
    setTestResults({});

    toast({
      title: "🧪 Running Comprehensive Tests",
      description: "Testing Firebase, backend, and notification pipeline..."
    });

    // Run tests in sequence to avoid overwhelming the system
    await testAuthentication();
    await testFirestoreConnection();
    await testNotificationPermission();

    // Only run token saving and emergency tests if notification permission was granted
    if (notificationToken) {
      await testTokenSaving();
      await testEmergencyNotification();
    }
  };

  const getStatusIcon = (status: boolean | undefined) => {
    if (status === true) return <Check className="w-4 h-4 text-success" />;
    if (status === false) return <X className="w-4 h-4 text-destructive" />;
    return <div className="w-4 h-4 bg-muted rounded-full" />;
  };

  const getStatusBadge = (status: boolean | undefined) => {
    if (status === true) return <Badge variant="secondary" className="bg-success/20 text-success">Working</Badge>;
    if (status === false) return <Badge variant="destructive">Failed</Badge>;
    return <Badge variant="secondary">Pending</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-soft">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
            <Cloud className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Firebase Setup</h1>
            <p className="text-xs text-muted-foreground">Test and configure Firebase services</p>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Firebase Configuration Status */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Firebase Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Project ID</span>
                  <Badge variant="secondary" className="bg-success/20 text-success">drop-files-bobby</Badge>
                </div>
              </div>

              <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Messaging Sender</span>
                  <Badge variant="secondary" className="bg-success/20 text-success">789298801694</Badge>
                </div>
              </div>

              <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">VAPID Key</span>
                  <Badge variant="secondary" className="bg-success/20 text-success">Configured</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Tests */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Service Tests</CardTitle>
            <p className="text-sm text-muted-foreground">Test Firebase services connectivity</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(testResults.auth)}
                  <div>
                    <h3 className="font-semibold text-foreground">Authentication</h3>
                    <p className="text-sm text-muted-foreground">Firebase Auth service</p>
                  </div>
                </div>
                {getStatusBadge(testResults.auth)}
              </div>

              <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(testResults.firestore)}
                  <div>
                    <h3 className="font-semibold text-foreground">Firestore Database</h3>
                    <p className="text-sm text-muted-foreground">Real-time database</p>
                  </div>
                </div>
                {getStatusBadge(testResults.firestore)}
              </div>

              <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(testResults.notifications)}
                  <div>
                    <h3 className="font-semibold text-foreground">Push Notifications</h3>
                    <p className="text-sm text-muted-foreground">Cloud messaging</p>
                  </div>
                </div>
                {getStatusBadge(testResults.notifications)}
              </div>

              <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(testResults.tokenSaving)}
                  <div>
                    <h3 className="font-semibold text-foreground">Backend Token Sync</h3>
                    <p className="text-sm text-muted-foreground">Save token to MongoDB</p>
                  </div>
                </div>
                {getStatusBadge(testResults.tokenSaving)}
              </div>

              <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(testResults.emergencyNotification)}
                  <div>
                    <h3 className="font-semibold text-foreground">Emergency Notifications</h3>
                    <p className="text-sm text-muted-foreground">End-to-end notification test</p>
                  </div>
                </div>
                {getStatusBadge(testResults.emergencyNotification)}
              </div>
            </div>

            <Button
              variant="hero"
              size="lg"
              onClick={runAllTests}
              className="w-full"
            >
              Run All Tests
            </Button>
          </CardContent>
        </Card>

        {/* Individual Test Buttons */}
        <div className="grid grid-cols-1 gap-3">
          <Button
            variant="outline"
            onClick={testAuthentication}
            className="h-12 justify-between"
          >
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Test Authentication</span>
            </div>
            {getStatusIcon(testResults.auth)}
          </Button>

          <Button
            variant="outline"
            onClick={testFirestoreConnection}
            className="h-12 justify-between"
          >
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Test Firestore</span>
            </div>
            {getStatusIcon(testResults.firestore)}
          </Button>

          <Button
            variant="outline"
            onClick={testNotificationPermission}
            className="h-12 justify-between"
          >
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Test Notifications</span>
            </div>
            {getStatusIcon(testResults.notifications)}
          </Button>

          <Button
            variant="outline"
            onClick={testTokenSaving}
            className="h-12 justify-between"
            disabled={!notificationToken}
          >
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Save Token to Backend</span>
            </div>
            {getStatusIcon(testResults.tokenSaving)}
          </Button>

          <Button
            variant="outline"
            onClick={testEmergencyNotification}
            className="h-12 justify-between bg-red-50 border-red-200 hover:bg-red-100"
            disabled={!notificationToken}
          >
            <div className="flex items-center space-x-2">
              <Send className="w-4 h-4 text-red-600" />
              <span>Test Emergency Alert</span>
            </div>
            {getStatusIcon(testResults.emergencyNotification)}
          </Button>
        </div>

        {/* Notification Token Display */}
        {notificationToken && (
          <Card className="shadow-soft bg-success/5 border-success/20">
            <CardHeader>
              <CardTitle className="text-lg text-success">Notification Token</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-card rounded-lg border border-border">
                <p className="text-xs text-muted-foreground break-all font-mono">
                  {notificationToken}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                This token can be used to send push notifications to this device.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Setup Instructions */}
        <Card className="shadow-soft bg-muted/20 border-muted/40">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Cloud className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Firebase Services</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>• Authentication: Ready for user sign-up/sign-in</p>
                  <p>• Firestore: Database for storing user data</p>
                  <p>• Cloud Messaging: Push notifications for alerts</p>
                  <p>• Storage: Ready for evidence and media files</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FirebaseTest;