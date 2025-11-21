import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, MapPin, Share, Users, Shield, Navigation } from 'lucide-react';
import GoogleMap from './GoogleMap';
import { useContacts, useLocation, Contact } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface LocationSharingProps {
  onBack: () => void;
}

// Utility function to calculate distance between two coordinates (in kilometers)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

const LocationSharing: React.FC<LocationSharingProps> = ({ onBack }) => {
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [liveSharing, setLiveSharing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [trustedContacts, setTrustedContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyA8oNPOywenDAWebK3b09F9Bg6WVB_3LTk';

  const { toast } = useToast();
  const { getContacts } = useContacts();
  const { shareLocation } = useLocation();

  // Load trusted contacts from database and persistent sharing state
  useEffect(() => {
    loadTrustedContacts();
    loadPersistedSharingState();
  }, []);

  // Save sharing state when it changes
  useEffect(() => {
    if (liveSharing) {
      localStorage.setItem('suraksha_live_sharing', 'true');
      localStorage.setItem('suraksha_sharing_start_time', new Date().toISOString());
    } else {
      localStorage.removeItem('suraksha_live_sharing');
      localStorage.removeItem('suraksha_sharing_start_time');
    }
  }, [liveSharing]);

  // Get current location
  useEffect(() => {
    if (locationEnabled) {
      getCurrentLocation();
    } else if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [locationEnabled]);

  const loadTrustedContacts = async () => {
    try {
      const response = await getContacts();
      if (response.success && response.contacts) {
        // Filter only trusted contacts
        const trusted = response.contacts.filter(contact => contact.isTrusted);
        setTrustedContacts(trusted);
      } else {
        toast({
          title: "Failed to load contacts",
          description: response.error || "Could not fetch trusted contacts",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading trusted contacts:', error);
      toast({
        title: "Connection Error",
        description: "Unable to load trusted contacts. Please check your connection.",
        variant: "destructive"
      });
    }
  };

  const loadPersistedSharingState = () => {
    try {
      const wasSharing = localStorage.getItem('suraksha_live_sharing') === 'true';
      const startTimeStr = localStorage.getItem('suraksha_sharing_start_time');

      if (wasSharing && startTimeStr) {
        const startTime = new Date(startTimeStr);
        const now = new Date();
        const hoursSinceStart = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);

        // Only restore if less than 24 hours have passed (default sharing duration)
        if (hoursSinceStart < 24) {
          setLiveSharing(true);
          console.log(`🔄 Restored live sharing session (${Math.round(hoursSinceStart * 100) / 100} hours ago)`);
        } else {
          // Session expired, clean up
          localStorage.removeItem('suraksha_live_sharing');
          localStorage.removeItem('suraksha_sharing_start_time');
          console.log('⏰ Live sharing session expired, cleaned up');
        }
      }
    } catch (error) {
      console.error('Error loading persisted sharing state:', error);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported');
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
        setCurrentLocation({
          lat: latitude,
          lng: longitude,
          address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        });

        // Start watching position if live sharing is enabled
        if (liveSharing && !watchId) {
          const id = navigator.geolocation.watchPosition(
            (pos) => {
              const { latitude: lat, longitude: lng } = pos.coords;
              setCurrentLocation(prev => ({
                ...prev!,
                lat,
                lng,
                address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
              }));
            },
            (error) => console.error('Error watching position:', error),
            options
          );
          setWatchId(id);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        // Use default location (New Delhi) if location access fails
        setCurrentLocation({
          lat: 28.6139,
          lng: 77.2090,
          address: 'Connaught Place, New Delhi'
        });
      },
      options
    );
  };

  const toggleLiveSharing = async () => {
    const newSharingState = !liveSharing;
    setLiveSharing(newSharingState);

    if (newSharingState) {
      // Start live sharing
      setIsLoading(true);

      toast({
        title: "📍 Starting Live Location Sharing",
        description: "Getting your current location and notifying trusted contacts...",
      });

      try {
        // Get current location first
        await getCurrentLocationAsync();

        if (currentLocation) {
          // Get trusted contact IDs for notification (only contacts with email)
          const trustedContactIds = trustedContacts
            .filter(contact =>
              contact.isTrusted &&
              contact.notificationsEnabled !== false &&
              contact.email &&
              contact.email.trim() !== ''
            )
            .map(contact => contact._id || contact.id);

          // Share location with trusted contacts via API
          const response = await shareLocation({
            latitude: currentLocation.lat,
            longitude: currentLocation.lng,
            address: currentLocation.address,
            contactIds: trustedContactIds,
            duration: 24, // 24 hours
            accuracy: 10,
            isLiveSharing: true
          });

          if (response.success) {
            const notificationCount = response.notificationsSent || trustedContactIds.length;
            if (notificationCount > 0) {
              toast({
                title: "✅ Live Sharing Started",
                description: `Location shared with ${notificationCount} trusted contacts - Email notifications sent!`,
              });
            } else {
              toast({
                title: "⚠️ Live Sharing Started",
                description: "Location tracking active, but no contacts have email addresses for notifications. Add email addresses to your trusted contacts.",
                variant: "destructive"
              });
            }

            // Start watching position for continuous updates
            startLocationWatching();
          } else {
            throw new Error(response.error || 'Failed to share location');
          }
        }
      } catch (error) {
        console.error('Error starting live sharing:', error);
        toast({
          title: "❌ Failed to Start Live Sharing",
          description: "Could not share location with trusted contacts. Please try again.",
          variant: "destructive"
        });
        setLiveSharing(false);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Stop live sharing
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }

      toast({
        title: "🔒 Live Sharing Stopped",
        description: "Your location is no longer being shared",
      });
    }
  };

  const getCurrentLocationAsync = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
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
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          };
          setCurrentLocation(location);
          resolve();
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use default location if geolocation fails
          setCurrentLocation({
            lat: 28.6139,
            lng: 77.2090,
            address: 'Connaught Place, New Delhi'
          });
          resolve();
        },
        options
      );
    });
  };

  // Debounce function to prevent excessive API calls
  const debounceTimeoutRef = useRef(null);
  const lastLocationRef = useRef(null);

  const startLocationWatching = () => {
    if (watchId) return; // Already watching

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = {
          lat: latitude,
          lng: longitude,
          address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        };

        setCurrentLocation(newLocation);

        // Clear existing timeout
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        // Check if location changed significantly (more than ~10 meters)
        const lastLocation = lastLocationRef.current;
        if (lastLocation) {
          const distance = calculateDistance(
            lastLocation.lat,
            lastLocation.lng,
            latitude,
            longitude
          );

          // If location hasn't changed significantly (less than 10 meters), don't send update
          if (distance < 0.01) { // roughly 10 meters
            return;
          }
        }

        // Debounce the API call to prevent excessive requests
        debounceTimeoutRef.current = setTimeout(async () => {
          try {
            // Get trusted contact IDs for continuous updates (only contacts with email)
            const trustedContactIds = trustedContacts
              .filter(contact =>
                contact.isTrusted &&
                contact.notificationsEnabled !== false &&
                contact.email &&
                contact.email.trim() !== ''
              )
              .map(contact => contact._id || contact.id);

            // Only send if there are contacts to notify
            if (trustedContactIds.length === 0) {
              return;
            }

            await shareLocation({
              latitude,
              longitude,
              address: newLocation.address,
              contactIds: trustedContactIds,
              duration: 24,
              accuracy: position.coords.accuracy || 10,
              isLiveSharing: true
            });

            // Update last sent location
            lastLocationRef.current = { lat: latitude, lng: longitude };

          } catch (error) {
            console.error('Error updating live location:', error);
          }
        }, 5000); // Wait 5 seconds before sending update (adjustable)
      },
      (error) => console.error('Error watching position:', error),
      options
    );

    setWatchId(id);
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
            <MapPin className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Location Sharing</h1>
            <p className="text-xs text-muted-foreground">Share your location with trusted contacts</p>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Location Services */}
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-lg text-foreground">Location Services</CardTitle>
                <p className="text-sm text-muted-foreground">Allow SURAKSHA to access your location for safety features</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-success/20 rounded-full text-xs font-medium text-success">
              Enabled
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Enable Location Access</span>
              <Switch checked={locationEnabled} onCheckedChange={setLocationEnabled} />
            </div>
            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {currentLocation ? currentLocation.address : 'Getting location...'}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${locationEnabled ? 'bg-success' : 'bg-muted-foreground'}`}></div>
                  <span className="text-xs text-muted-foreground">
                    {locationEnabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            {/* Google Maps Integration */}
            {locationEnabled && currentLocation && (
              <div className="mt-4">
                <GoogleMap
                  apiKey={GOOGLE_MAPS_API_KEY}
                  center={{ lat: currentLocation.lat, lng: currentLocation.lng }}
                  height="200px"
                  className="shadow-soft"
                  markers={[
                    {
                      id: 'current',
                      position: { lat: currentLocation.lat, lng: currentLocation.lng },
                      title: 'Your Current Location',
                      type: 'current'
                    }
                  ]}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Location Sharing */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Share className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-lg text-foreground">Live Location Sharing</CardTitle>
                <p className="text-sm text-muted-foreground">Share your real-time location with all trusted contacts</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              variant="hero"
              size="lg"
              className="w-full h-12"
              onClick={toggleLiveSharing}
              disabled={isLoading || trustedContacts.length === 0}
            >
              <Share className="w-5 h-5 mr-2" />
              {isLoading ? 'Preparing...' : liveSharing ? 'Stop Live Sharing' : 'Start Live Sharing'}
            </Button>

            {trustedContacts.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Add trusted contacts to enable location sharing
              </p>
            )}
          </CardContent>
        </Card>

        {/* Trusted Contacts */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-foreground" />
              <div>
                <CardTitle className="text-lg text-foreground">Trusted Contacts</CardTitle>
                <p className="text-sm text-muted-foreground">Share your location with these trusted people</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {trustedContacts.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-2">No trusted contacts yet</p>
                <p className="text-sm text-muted-foreground">
                  Add trusted contacts in the Contacts section to enable location sharing
                </p>
              </div>
            ) : (
              trustedContacts.map((contact) => (
                <div
                  key={contact.id || contact._id}
                  className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold relative">
                      {contact.name[0]}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{contact.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {contact.relation} • {contact.phone}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="px-4"
                    onClick={async () => {
                      if (currentLocation) {
                        try {
                          // Get trusted contact IDs for one-time sharing (only contacts with email)
                          const trustedContactIds = trustedContacts
                            .filter(contact =>
                              contact.isTrusted &&
                              contact.notificationsEnabled !== false &&
                              contact.email &&
                              contact.email.trim() !== ''
                            )
                            .map(contact => contact._id || contact.id);

                          const response = await shareLocation({
                            latitude: currentLocation.lat,
                            longitude: currentLocation.lng,
                            address: currentLocation.address,
                            contactIds: trustedContactIds,
                            duration: 2, // 2 hours for one-time sharing
                            accuracy: 10,
                            isLiveSharing: false
                          });

                          const notificationCount = response.notificationsSent || trustedContactIds.length;
                          if (notificationCount > 0) {
                            toast({
                              title: "📍 Location Shared",
                              description: `Location sent to ${notificationCount} trusted contacts via email!`,
                            });
                          } else {
                            toast({
                              title: "⚠️ Location Saved",
                              description: "Location saved but no email notifications sent. Add email addresses to your trusted contacts.",
                              variant: "destructive"
                            });
                          }
                        } catch (error) {
                          toast({
                            title: "❌ Sharing Failed",
                            description: "Could not share location. Please try again.",
                            variant: "destructive"
                          });
                        }
                      }
                    }}
                    disabled={!currentLocation}
                  >
                    <Share className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Safety Features */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-soft bg-primary/5 border-primary/20 cursor-pointer hover:shadow-primary transition-shadow">
            <CardContent className="p-4 text-center">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Safe Route</h3>
              <p className="text-xs text-muted-foreground">Get safest path</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft bg-accent/10 border-accent/30 cursor-pointer hover:shadow-primary transition-shadow">
            <CardContent className="p-4 text-center">
              <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Geo-fence</h3>
              <p className="text-xs text-muted-foreground">Safety zones</p>
            </CardContent>
          </Card>
        </div>

        {/* Privacy Notice */}
        <Card className="shadow-soft bg-muted/20 border-muted/40">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Privacy & Security</h3>
                <p className="text-sm text-muted-foreground">
                  Your location data is encrypted and only shared with your chosen trusted contacts. 
                  You can stop sharing at any time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LocationSharing;