import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Settings, EyeOff, Shield, Users, Phone, Camera, Watch, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProfile, useAuth } from '@/lib/api';
import FirebaseTest from './FirebaseTest';

interface SettingsPageProps {
  onBack: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const { toast } = useToast();
  const { getUserProfile, updateSafetySettings } = useProfile();

  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    stealthMode: false,
    autoRecording: true,
    includeLocation: true,
    biometricLock: true,
    wearableSync: false
  });

  const [showFirebaseTest, setShowFirebaseTest] = useState(false);

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      setLoading(true);

      const response = await getUserProfile();

      if (response.success && response.data?.user?.safetySettings) {
        const safetySettings = response.data.user.safetySettings;
        setSettings({
          stealthMode: safetySettings.stealthMode ?? false,
          autoRecording: safetySettings.autoRecording ?? true,
          includeLocation: safetySettings.includeLocation ?? true,
          biometricLock: safetySettings.biometricLock ?? true,
          wearableSync: false // This is not a safety setting, so keep local
        });
      }
    } catch (error) {
      console.error('Failed to load user settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings. Using defaults.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof typeof settings) => {
    const newValue = !settings[key];

    // For non-safety settings, just update locally
    if (key === 'wearableSync') {
      setSettings(prev => ({ ...prev, [key]: newValue }));
      return;
    }

    try {
      // Update local state immediately for better UX
      setSettings(prev => ({ ...prev, [key]: newValue }));

      // Save safety settings to backend
      const response = await updateSafetySettings({
        [key]: newValue
      });

      if (response.success) {
        toast({
          title: "Setting Updated",
          description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} has been ${newValue ? 'enabled' : 'disabled'}.`,
        });
      } else {
        throw new Error(response.error || 'Failed to update setting');
      }
    } catch (error) {
      // Revert the change if it failed
      setSettings(prev => ({ ...prev, [key]: !newValue }));

      console.error('Failed to update setting:', error);
      toast({
        title: "Error",
        description: "Failed to save setting. Please try again.",
        variant: "destructive"
      });
    }
  };

  const sosContacts = [
    { name: 'Family Members', priority: 1, enabled: true },
    { name: 'Close Friends', priority: 2, enabled: true },
    { name: 'Police (100)', priority: 3, enabled: true },
    { name: 'Women Helpline (1091)', priority: 4, enabled: true }
  ];

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
            <Settings className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Settings</h1>
            <p className="text-xs text-muted-foreground">Customize your safety preferences</p>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6 pb-24">
        {/* Loading State */}
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        ) : (
          <>
        {/* Stealth Mode */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center">
              <EyeOff className="w-5 h-5 mr-2" />
              Stealth Mode
            </CardTitle>
            <p className="text-sm text-muted-foreground">Run SURAKSHA discretely in the background</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-foreground">Enable Stealth Mode</span>
                <p className="text-xs text-muted-foreground">App runs without obvious screen indicators</p>
              </div>
              <Switch checked={settings.stealthMode} onCheckedChange={() => updateSetting('stealthMode')} />
            </div>
            {settings.stealthMode && (
              <div className="p-3 bg-muted/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  ✓ Hidden from recent apps • ✓ Silent notifications • ✓ Disguised app icon
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Custom SOS Flow */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Custom SOS Flow
            </CardTitle>
            <p className="text-sm text-muted-foreground">Customize your emergency response sequence</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Alert Priority Order</h3>
              {sosContacts.map((contact, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-semibold text-primary">
                      {contact.priority}
                    </div>
                    <span className="text-sm font-medium text-foreground">{contact.name}</span>
                  </div>
                  <Switch checked={contact.enabled} />
                </div>
              ))}
            </div>
            
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-foreground">Include Location</span>
                  <p className="text-xs text-muted-foreground">Send GPS coordinates with SOS</p>
                </div>
                <Switch checked={settings.includeLocation} onCheckedChange={() => updateSetting('includeLocation')} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-foreground">Auto Recording</span>
                  <p className="text-xs text-muted-foreground">Start recording video/audio when SOS triggered</p>
                </div>
                <Switch checked={settings.autoRecording} onCheckedChange={() => updateSetting('autoRecording')} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wearable Integration */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center">
              <Watch className="w-5 h-5 mr-2" />
              Wearable & Smart Device Sync
            </CardTitle>
            <p className="text-sm text-muted-foreground">Connect with smartwatches and IoT devices</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-foreground">Smartwatch Integration</span>
                <p className="text-xs text-muted-foreground">Quick SOS via watch button</p>
              </div>
              <Switch checked={settings.wearableSync} onCheckedChange={() => updateSetting('wearableSync')} />
            </div>
            
            {!settings.wearableSync ? (
              <div className="space-y-3">
                <Button variant="secondary" size="sm" className="w-full">
                  <Watch className="w-4 h-4 mr-2" />
                  Connect Apple Watch
                </Button>
                <Button variant="secondary" size="sm" className="w-full">
                  <Watch className="w-4 h-4 mr-2" />
                  Connect Fitbit
                </Button>
                <Button variant="secondary" size="sm" className="w-full">
                  <Shield className="w-4 h-4 mr-2" />
                  Setup Smart Home Integration
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-success/10 rounded border border-success/20">
                  <span className="text-sm text-foreground">Apple Watch Series 8</span>
                  <span className="text-xs text-success">Connected</span>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    ✓ Double-tap crown for SOS • ✓ Auto-lights activation • ✓ Heart rate monitoring
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security & Privacy */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-foreground">Biometric Lock</span>
                <p className="text-xs text-muted-foreground">Secure app with fingerprint/Face ID</p>
              </div>
              <Switch checked={settings.biometricLock} onCheckedChange={() => updateSetting('biometricLock')} />
            </div>
            
            <div className="space-y-2">
              <Button variant="secondary" size="sm" className="w-full justify-start">
                <Camera className="w-4 h-4 mr-2" />
                Manage Evidence Storage
              </Button>
              <Button variant="secondary" size="sm" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Trusted Contacts Management
              </Button>
              <Button variant="secondary" size="sm" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Data Export & Privacy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card className="shadow-soft bg-muted/10 border-muted/30">
          <CardContent className="p-4 text-center">
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">SURAKSHA v2.1.0</h3>
              <p className="text-xs text-muted-foreground">
                Protecting women with cutting-edge safety technology
              </p>
              <div className="flex justify-center space-x-4 text-xs text-muted-foreground">
                <span>• Privacy Policy</span>
                <span>• Help Center</span>
                <span>• About</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Developer/Debug Section */}
        <Card className="shadow-soft bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center">
              <TestTube className="w-5 h-5 mr-2 text-yellow-600" />
              Developer Tools
            </CardTitle>
            <p className="text-sm text-muted-foreground">Debug and test app functionality</p>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => setShowFirebaseTest(true)}
              className="w-full justify-start border-yellow-200 hover:bg-yellow-50"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Test Firebase & Notifications
            </Button>
          </CardContent>
        </Card>
          </>
        )}
      </div>

      {/* Firebase Test Modal/Overlay */}
      {showFirebaseTest && (
        <div className="fixed inset-0 z-50">
          <FirebaseTest onBack={() => setShowFirebaseTest(false)} />
        </div>
      )}
    </div>
  );
};

export default SettingsPage;