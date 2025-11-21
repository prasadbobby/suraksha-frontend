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
  Mic,
  Volume2,
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

interface CommunityFeaturesProps {
  onBack: () => void;
}

const CommunityFeatures: React.FC<CommunityFeaturesProps> = ({ onBack }) => {
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [verifiedHelpers, setVerifiedHelpers] = useState([
    { id: '1', name: 'Priya Sharma', distance: '0.5km', rating: 4.9, verified: true, available: true },
    { id: '2', name: 'Rajesh Kumar', distance: '0.8km', rating: 4.8, verified: true, available: true },
    { id: '3', name: 'Anjali Singh', distance: '1.2km', rating: 4.7, verified: true, available: false }
  ]);

  const { toast } = useToast();

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

  const handleVoiceCommand = async (command: string) => {
    try {
      // Use Eleven Labs API for voice response
      const response = await fetch('/api/voice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: getResponseText(command), command })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        await audio.play();
      }
    } catch (error) {
      console.error('Voice command error:', error);
    }
  };

  const getResponseText = (command: string): string => {
    switch (command.toLowerCase()) {
      case 'emergency':
        return "Emergency mode activated. Sending alert to all trusted contacts. Stay calm, help is on the way.";
      case 'safe route':
        return "Finding the safest route to your destination. I'll guide you through well-lit areas with police presence.";
      case 'call help':
        return "Calling emergency services and your trusted contacts now. Stay on the line.";
      default:
        return "I'm here to help keep you safe. What do you need assistance with?";
    }
  };

  const startVoiceListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast({
          title: "🎤 Listening...",
          description: "Say 'Hey SURAKSHA' followed by your command"
        });
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();

        if (transcript.includes('hey suraksha')) {
          if (transcript.includes('emergency')) {
            handleVoiceCommand('emergency');
          } else if (transcript.includes('safe route')) {
            handleVoiceCommand('safe route');
          } else if (transcript.includes('call help')) {
            handleVoiceCommand('call help');
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      toast({
        title: "Voice Commands Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive"
      });
    }
  };

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

  const testAIGuide = () => {
    const guidance = [
      "You are in danger. Stay calm. I am guiding you to the safest route.",
      "Move towards the highlighted path. Police and SHE Teams are nearby.",
      "Your emergency contacts have been notified. Continue straight — help is on the way.",
      "Safe zone ahead. You're doing great. Help will reach you shortly."
    ];

    guidance.forEach((text, index) => {
      setTimeout(() => {
        handleVoiceCommand(text);
        toast({
          title: `Step ${index + 1}`,
          description: text
        });
      }, index * 3000);
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
          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Community & Safety</h1>
            <p className="text-xs text-muted-foreground">Connect, navigate safely, and find support</p>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6">
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
            {verifiedHelpers.map((helper) => (
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
            ))}
          </CardContent>
        </Card>

        {/* AI Safety Voice Guide */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Navigation className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg text-foreground">AI Safety Voice Guide</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">Google Maps-style navigation with reassuring safety guidance</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Enable Voice Guidance</span>
              <Switch checked={voiceGuidanceEnabled} onCheckedChange={setVoiceGuidanceEnabled} />
            </div>

            <div className="bg-muted/30 rounded-lg p-3">
              <h4 className="font-semibold text-foreground mb-2">Sample Emergency Guidance:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                  <Badge className="bg-destructive text-white">1</Badge>
                  <span className="text-muted-foreground">"You are in danger. Stay calm. I am guiding you to the safest route."</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Badge className="bg-primary text-white">2</Badge>
                  <span className="text-muted-foreground">"Move towards the highlighted path. Police and SHE Teams are nearby."</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Badge className="bg-success text-white">3</Badge>
                  <span className="text-muted-foreground">"Your emergency contacts have been notified. Continue straight — help is on the way."</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Badge className="bg-accent text-white">4</Badge>
                  <span className="text-muted-foreground">"Safe zone ahead. You're doing great. Help will reach you shortly."</span>
                </div>
              </div>
            </div>

            <Button
              variant="hero"
              onClick={testAIGuide}
              className="w-full"
              disabled={!voiceGuidanceEnabled}
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Test AI Safety Guide
            </Button>
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

        {/* Voice Command Shortcuts */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Mic className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg text-foreground">Voice Command Shortcuts</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">Quick voice-activated safety features</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <span className="font-medium text-foreground">"Hey SURAKSHA, Emergency"</span>
                  <p className="text-xs text-muted-foreground">Trigger SOS</p>
                </div>
                <Badge variant="destructive">Emergency</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <span className="font-medium text-foreground">"Hey SURAKSHA, Safe Route"</span>
                  <p className="text-xs text-muted-foreground">Start navigation</p>
                </div>
                <Badge variant="default">Navigation</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <span className="font-medium text-foreground">"Hey SURAKSHA, Call Help"</span>
                  <p className="text-xs text-muted-foreground">Call emergency</p>
                </div>
                <Badge variant="secondary">Support</Badge>
              </div>
            </div>

            <Button
              variant={isListening ? "destructive" : "hero"}
              onClick={startVoiceListening}
              className="w-full"
            >
              <Mic className="w-4 h-4 mr-2" />
              {isListening ? "Listening..." : "Start Voice Commands"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommunityFeatures;