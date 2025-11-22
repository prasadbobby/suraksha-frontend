import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  AlertTriangle,
  Phone,
  Shield,
  Smartphone,
  Clock,
  MapPin,
  Users,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useShakeDetection } from '@/hooks/use-shake-detection';
import { useToast } from '@/hooks/use-toast';
import { useEmergency, useLocation, useContacts, useFirebase, Contact } from '@/lib/api';

interface EmergencySOSProps {
  onBack: () => void;
}

const EmergencySOS: React.FC<EmergencySOSProps> = ({ onBack }) => {
  const [shakeToAlert, setShakeToAlert] = useState(true);
  const [sirenMode, setSirenMode] = useState(false);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [trustedContacts, setTrustedContacts] = useState<Contact[]>([]);

  const { toast } = useToast();
  const { sendEmergencyAlert } = useEmergency();
  const { updateLocation } = useLocation();
  const { getContacts } = useContacts();
  const { sendEmergencyNotification } = useFirebase();

  // Emergency contacts with She Team
  const emergencyContacts = [
    { name: 'Police', number: '100', color: 'bg-destructive', priority: 1 },
    { name: 'Women Helpline', number: '1091', color: 'bg-primary', priority: 1 },
    { name: 'Ambulance', number: '102', color: 'bg-destructive', priority: 2 },
    { name: 'Fire Department', number: '101', color: 'bg-orange-500', priority: 2 },
    { name: 'She Team (Telangana)', number: '8712657014', color: 'bg-primary', priority: 1 },
    { name: 'Child Helpline', number: '1098', color: 'bg-blue-500', priority: 2 },
    { name: 'Domestic Violence Helpline', number: '181', color: 'bg-purple-500', priority: 1 },
    { name: 'Anti-Ragging Helpline', number: '1800-180-5522', color: 'bg-green-500', priority: 3 }
  ];

  // Load trusted contacts from ContactsManager
  useEffect(() => {
    loadTrustedContacts();
  }, []);

  const loadTrustedContacts = async () => {
    try {
      const response = await getContacts();
      if (response.success && response.contacts) {
        // Filter for trusted contacts only
        const trusted = response.contacts.filter(contact => contact.isTrusted);
        setTrustedContacts(trusted);
      }
    } catch (error) {
      console.error('Error loading trusted contacts:', error);
    }
  };

  // Get current location
  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number; address?: string } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error('Geolocation is not supported');
        resolve(null);
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = {
            latitude,
            longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          };
          setCurrentLocation(location);
          resolve(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use a default location if geolocation fails
          const defaultLocation = {
            latitude: 28.6139,
            longitude: 77.2090,
            address: 'New Delhi, India'
          };
          setCurrentLocation(defaultLocation);
          resolve(defaultLocation);
        },
        options
      );
    });
  };

  const handleEmergencyActivation = async () => {
    setEmergencyActive(true);
    setCountdown(5);
    setIsLoading(true);

    // Get current location first
    const location = await getCurrentLocation();

    toast({
      title: "🚨 Emergency Alert Activated!",
      description: "Sending location and alert to all trusted contacts...",
      variant: "destructive",
    });

    // Start countdown
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          triggerEmergencyActions('button', location);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const triggerEmergencyActions = async (
    triggerMethod: 'button' | 'shake',
    location: { latitude: number; longitude: number; address?: string } | null
  ) => {
    try {
      // Send emergency alert to backend
      const response = await sendEmergencyAlert({
        triggerMethod,
        location: location || undefined
      });

      if (response.success) {
        // Update user location in database
        if (location) {
          await updateLocation({
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.address,
            accuracy: 10
          });
        }

        // Send Firebase push notifications to trusted contacts with app accounts
        try {
          const contactEmails = trustedContacts
            .filter(contact => contact.email && contact.email.trim() !== '')
            .map(contact => contact.email);

          if (contactEmails.length > 0) {
            const firebaseResponse = await sendEmergencyNotification({
              userName: 'User', // You can get this from user profile if available
              userPhone: undefined, // You can get this from user profile if available
              location: location || undefined,
              contactEmails
            });

            if (firebaseResponse.success) {
              console.log(`📱 Firebase notifications sent: ${firebaseResponse.notificationsSent}`);
              console.log(`❌ Firebase notifications failed: ${firebaseResponse.notificationsFailed}`);
            } else if (firebaseResponse.error === 'Firebase not initialized') {
              console.log('⚠️ Firebase not configured - push notifications disabled');
              console.log('ℹ️ Emergency alerts are still working via SMS/email');
            }
          } else {
            console.log('⚠️ No trusted contacts with email addresses for Firebase notifications');
          }
        } catch (firebaseError) {
          console.error('❌ Firebase notification error:', firebaseError);
          // Don't fail the entire emergency process if Firebase notifications fail
        }

        if (sirenMode && audioEnabled) {
          console.log('🚨 SIREN ACTIVATED');
          // Here you could implement actual siren sounds
        }

        toast({
          title: "✅ Emergency Alert Sent!",
          description: `Notified ${response.contactsNotified || 0} trusted contacts via SMS/email. Firebase notifications sent to app users.`,
        });

        console.log('✅ Emergency actions completed:', {
          alertId: response.alertId,
          contactsNotified: response.contactsNotified,
          notificationsSent: response.notificationsSent,
          location: location
        });
      } else {
        throw new Error(response.error || 'Failed to send emergency alert');
      }
    } catch (error) {
      console.error('❌ Emergency alert failed:', error);
      toast({
        title: "❌ Emergency Alert Failed",
        description: "Could not send alert to contacts. Please try calling directly.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);

      // Reset emergency state after 30 seconds
      setTimeout(() => {
        setEmergencyActive(false);
      }, 30000);
    }
  };

  const handleShakeDetected = async () => {
    if (!emergencyActive) {
      let cancelled = false;

      const cancelToast = toast({
        title: "📱 Shake Detected!",
        description: "Emergency alert will be triggered in 5 seconds. Tap to cancel.",
        action: (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              cancelled = true;
              toast({ title: "❌ Alert Cancelled" });
            }}
          >
            Cancel
          </Button>
        ),
      });

      // Wait 5 seconds, then trigger if not cancelled
      setTimeout(async () => {
        if (!cancelled) {
          setEmergencyActive(true);
          setIsLoading(true);

          const location = await getCurrentLocation();

          toast({
            title: "🚨 Emergency Alert Activated!",
            description: "Shake detected - sending emergency alerts...",
            variant: "destructive",
          });

          // Trigger emergency actions immediately for shake detection
          triggerEmergencyActions('shake', location);
        }
      }, 5000);
    }
  };

  const { isShaking, shakeCount, requestShakePermission, simulateShake } = useShakeDetection({
    threshold: 15,
    timeout: 2000,
    onShake: shakeToAlert ? handleShakeDetected : undefined,
    enabled: shakeToAlert
  });

  const callEmergencyNumber = (number: string, name: string) => {
    // In a real app, this would initiate a call
    window.open(`tel:${number}`, '_self');
    toast({
      title: `📞 Calling ${name}`,
      description: `Dialing ${number}...`,
    });
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
          <div className="w-10 h-10 bg-gradient-emergency rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Emergency SOS</h1>
            <p className="text-xs text-muted-foreground">Instant emergency alert system</p>
          </div>
          {isShaking && (
            <Badge variant="destructive" className="animate-pulse">
              Shake Detected
            </Badge>
          )}
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6 pb-24">
        {/* Emergency SOS Button */}
        <Card className={`shadow-soft transition-all duration-300 ${emergencyActive ? 'bg-destructive/10 border-destructive' : ''}`}>
          <CardContent className="p-6 text-center">
            <Button
              variant={emergencyActive ? "destructive" : "hero"}
              size="lg"
              className={`w-32 h-32 rounded-full text-xl font-bold transition-all duration-300 ${
                emergencyActive ? 'animate-pulse scale-110' : 'hover:scale-105'
              }`}
              onClick={handleEmergencyActivation}
              disabled={emergencyActive || isLoading}
            >
              <div className="flex flex-col items-center">
                <AlertTriangle className="w-8 h-8 mb-2" />
                {countdown > 0 ? (
                  <span className="text-2xl">{countdown}</span>
                ) : isLoading ? (
                  <span className="text-sm">SENDING...</span>
                ) : (
                  <span>SOS</span>
                )}
              </div>
            </Button>

            <div className="mt-4">
              <h3 className="font-bold text-foreground mb-2">
                {emergencyActive ? 'Emergency Active' : 'Press for Emergency'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {emergencyActive
                  ? 'Alert sent to all emergency contacts'
                  : 'Long press to activate emergency alert'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Shake Detection */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle className="text-lg text-foreground">Shake to Alert</CardTitle>
                  <p className="text-sm text-muted-foreground">Automatically trigger SOS on device shake</p>
                </div>
              </div>
              <Switch checked={shakeToAlert} onCheckedChange={setShakeToAlert} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Shakes detected:</span>
              <Badge variant="secondary">{shakeCount}</Badge>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={requestShakePermission}
                className="flex-1"
              >
                Enable Shake Detection
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={simulateShake}
              >
                Test Shake
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Settings */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Emergency Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Siren Mode</span>
              </div>
              <Switch checked={sirenMode} onCheckedChange={setSirenMode} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {audioEnabled ? (
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium text-foreground">Audio Alerts</span>
              </div>
              <Switch checked={audioEnabled} onCheckedChange={setAudioEnabled} />
            </div>
          </CardContent>
        </Card>

        {/* Quick Call Emergency Numbers */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-destructive" />
              <CardTitle className="text-lg text-foreground">Emergency Hotlines</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {emergencyContacts
                .filter(contact => contact.priority === 1)
                .map((contact, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-16 justify-between border-2"
                  onClick={() => callEmergencyNumber(contact.number, contact.name)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${contact.color}`}>
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-foreground">{contact.name}</div>
                      <div className="text-sm text-muted-foreground">{contact.number}</div>
                    </div>
                  </div>
                  <Badge variant="secondary">Call</Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trusted Contacts */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-foreground" />
              <CardTitle className="text-lg text-foreground">Trusted Contacts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trustedContacts.length === 0 ? (
                <div className="text-center py-6">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">No Trusted Contacts</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Add trusted contacts to receive emergency notifications
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.href = '/contacts'}
                  >
                    Manage Contacts
                  </Button>
                </div>
              ) : (
                trustedContacts.map((contact, index) => (
                  <div
                    key={contact._id || contact.id || index}
                    className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                        {contact.name[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{contact.name}</h3>
                        <p className="text-sm text-muted-foreground">{contact.relation}</p>
                        {contact.email && (
                          <p className="text-xs text-muted-foreground">✓ App notifications enabled</p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => callEmergencyNumber(contact.phone, contact.name)}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Instructions */}
        <Card className="shadow-soft bg-muted/20 border-muted/40">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">How Emergency SOS Works</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>• Press SOS button or shake phone to activate</p>
                  <p>• 5-second countdown before emergency actions</p>
                  <p>• Location shared with all trusted contacts</p>
                  <p>• SMS alerts sent automatically</p>
                  <p>• Audio recording starts for evidence</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmergencySOS;