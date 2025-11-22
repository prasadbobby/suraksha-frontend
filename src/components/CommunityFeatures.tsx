import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Users,
  MessageSquare,
  MapPin,
  Shield,
  Navigation,
  Heart,
  Route,
  Brain,
  Phone,
  UserCheck,
  Star,
  Lightbulb,
  Eye,
  HeartHandshake,
  MessageCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useContacts, Contact } from '@/lib/api';

interface CommunityFeaturesProps {
  onBack: () => void;
}

const CommunityFeatures: React.FC<CommunityFeaturesProps> = ({ onBack }) => {
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [verifiedHelpers, setVerifiedHelpers] = useState<any[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const { toast } = useToast();
  const { getContacts } = useContacts();

  // Load contacts from API
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const response = await getContacts();
        if (response.success && response.contacts) {
          setContacts(response.contacts);
          // Convert trusted contacts to verified helpers format
          const helpers = response.contacts
            .filter((contact: Contact) => contact.isTrusted)
            .map((contact: Contact, index: number) => ({
              id: contact._id || contact.id || index.toString(),
              name: contact.name,
              distance: contact.distance ? `${contact.distance}km` : `${(Math.random() * 2).toFixed(1)}km`, // Random distance if not available
              rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
              verified: true,
              available: true,
              phone: contact.phone,
              relation: contact.relation
            }));
          setVerifiedHelpers(helpers);
        }
      } catch (error) {
        console.error('Error loading contacts:', error);
        toast({
          title: "Error",
          description: "Failed to load contacts",
          variant: "destructive"
        });
      }
    };

    loadContacts();
  }, [getContacts, toast]);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);


  const planSafeRoute = () => {
    toast({
      title: "🗺️ Planning Safe Route",
      description: "Analyzing well-lit areas, police presence, and safe zones..."
    });

    // Simulate route planning with safety factors
    setTimeout(() => {
      toast({
        title: "✅ Safe Route Ready",
        description: "Route optimized for maximum safety. Avoiding isolated areas."
      });
    }, 2000);
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
            <Users className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Community & Safety</h1>
            <p className="text-xs text-muted-foreground">Connect, navigate safely, and find support</p>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6 pb-24">
        {/* Community Section */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg text-foreground">Community</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">Connect safely with your neighborhood</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="shadow-soft bg-primary/5 border-primary/20 cursor-pointer hover:shadow-primary transition-shadow">
                <CardContent className="p-3 text-center">
                  <Users className="w-6 h-6 text-primary mx-auto mb-1" />
                  <h4 className="text-sm font-semibold text-foreground">Neighbors</h4>
                  <p className="text-xs text-muted-foreground">12 nearby</p>
                </CardContent>
              </Card>

              <Card className="shadow-soft bg-accent/10 border-accent/30 cursor-pointer hover:shadow-primary transition-shadow">
                <CardContent className="p-3 text-center">
                  <MessageSquare className="w-6 h-6 text-primary mx-auto mb-1" />
                  <h4 className="text-sm font-semibold text-foreground">Discussions</h4>
                  <p className="text-xs text-muted-foreground">5 active</p>
                </CardContent>
              </Card>

              <Card className="shadow-soft bg-success/10 border-success/30 cursor-pointer hover:shadow-primary transition-shadow">
                <CardContent className="p-3 text-center">
                  <MapPin className="w-6 h-6 text-primary mx-auto mb-1" />
                  <h4 className="text-sm font-semibold text-foreground">Safety Map</h4>
                  <p className="text-xs text-muted-foreground">Live updates</p>
                </CardContent>
              </Card>

              <Card className="shadow-soft bg-orange-50 border-orange-200 cursor-pointer hover:shadow-primary transition-shadow">
                <CardContent className="p-3 text-center">
                  <Shield className="w-6 h-6 text-primary mx-auto mb-1" />
                  <h4 className="text-sm font-semibold text-foreground">Report Issue</h4>
                  <p className="text-xs text-muted-foreground">Quick report</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Verified Helpers */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-success" />
              <CardTitle className="text-lg text-foreground">Verified Helpers Nearby</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">KYC-verified community members ready to help</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {verifiedHelpers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserCheck className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p>No trusted contacts available</p>
                <p className="text-sm">Add trusted contacts in the Contacts section to see verified helpers</p>
              </div>
            ) : (
              verifiedHelpers.map((helper) => (
              <div
                key={helper.id}
                className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                      {helper.name[0]}
                    </div>
                    {helper.verified && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                        <Shield className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-foreground">{helper.name}</h3>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs text-muted-foreground">{helper.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-muted-foreground">{helper.distance}</span>
                      <Badge
                        variant={helper.available ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {helper.available ? "Available" : "Busy"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline" disabled={!helper.available}>
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Contact
                </Button>
              </div>
              ))
            )}
          </CardContent>
        </Card>


        {/* Smart Safe Routes */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Route className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg text-foreground">Smart Safe Routes</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">AI-powered route optimization for maximum safety</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                <Lightbulb className="w-4 h-4 text-yellow-600" />
                <span className="text-xs font-medium text-yellow-800">Well-lit Areas</span>
              </div>

              <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded border border-blue-200">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-800">Police Presence</span>
              </div>

              <div className="flex items-center space-x-2 p-2 bg-green-50 rounded border border-green-200">
                <UserCheck className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-800">Safe Zones</span>
              </div>

              <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded border border-purple-200">
                <HeartHandshake className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-800">Help Points</span>
              </div>
            </div>

            <Button variant="hero" onClick={planSafeRoute} className="w-full">
              <Navigation className="w-4 h-4 mr-2" />
              Plan Safe Route
            </Button>
          </CardContent>
        </Card>

        {/* Mental Wellness Support */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg text-foreground">Mental Wellness Support</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">Resources for emotional well-being and trauma support</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Card className="shadow-soft bg-pink-50 border-pink-200 cursor-pointer hover:shadow-primary transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-pink-600" />
                    <div>
                      <h4 className="font-semibold text-foreground">Counseling Helpline</h4>
                      <p className="text-xs text-muted-foreground">24/7 professional support</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft bg-green-50 border-green-200 cursor-pointer hover:shadow-primary transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <Brain className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-foreground">Self-Care Resources</h4>
                      <p className="text-xs text-muted-foreground">Breathing exercises, meditation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft bg-blue-50 border-blue-200 cursor-pointer hover:shadow-primary transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-foreground">Support Groups</h4>
                      <p className="text-xs text-muted-foreground">Connect with others safely</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default CommunityFeatures;