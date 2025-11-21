import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Heart, Navigation, Volume2, Phone, MapPin, Shield } from 'lucide-react';

interface WellnessProps {
  onBack: () => void;
}

const Wellness: React.FC<WellnessProps> = ({ onBack }) => {
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  const startSafeNavigation = () => {
    setIsNavigating(true);
    // Simulate navigation guidance
    setTimeout(() => setIsNavigating(false), 5000);
  };

  const voiceGuidanceMessages = [
    "You are in danger. Stay calm. I am guiding you to the safest route.",
    "Move towards the highlighted path. Police and SHE Teams are nearby.",
    "Your emergency contacts have been notified. Continue straight — help is on the way.",
    "Safe zone ahead. You're doing great. Help will reach you shortly."
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
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Wellness</h1>
            <p className="text-xs text-muted-foreground">AI-powered safety guidance and support</p>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* AI Voice Guidance */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center">
              <Volume2 className="w-5 h-5 mr-2 text-primary" />
              AI Safety Voice Guide
            </CardTitle>
            <p className="text-sm text-muted-foreground">Google Maps-style navigation with reassuring safety guidance</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-foreground">Enable Voice Guidance</span>
                <p className="text-xs text-muted-foreground">Calming AI voice during emergencies</p>
              </div>
              <Switch checked={voiceGuidanceEnabled} onCheckedChange={setVoiceGuidanceEnabled} />
            </div>

            {voiceGuidanceEnabled && (
              <div className="space-y-3">
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <h3 className="font-semibold text-primary mb-2">Sample Emergency Guidance:</h3>
                  <div className="space-y-2">
                    {voiceGuidanceMessages.map((message, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-xs text-primary font-semibold mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-sm text-foreground italic">"{message}"</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button
                  variant={isNavigating ? "emergency" : "hero"}
                  size="lg"
                  className="w-full"
                  onClick={startSafeNavigation}
                  disabled={isNavigating}
                >
                  <Navigation className="w-5 h-5 mr-2" />
                  {isNavigating ? "🎯 AI Guide Active..." : "Test AI Safety Guide"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Smart Route Planning */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-success" />
              Smart Safe Routes
            </CardTitle>
            <p className="text-sm text-muted-foreground">AI-powered route optimization for maximum safety</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-success/10 rounded-lg border border-success/20 text-center">
                <MapPin className="w-6 h-6 text-success mx-auto mb-1" />
                <p className="text-xs font-medium text-success">Well-lit Areas</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 text-center">
                <Shield className="w-6 h-6 text-primary mx-auto mb-1" />
                <p className="text-xs font-medium text-primary">Police Presence</p>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg border border-accent/30 text-center">
                <Heart className="w-6 h-6 text-primary mx-auto mb-1" />
                <p className="text-xs font-medium text-foreground">Safe Zones</p>
              </div>
              <div className="p-3 bg-secondary/40 rounded-lg border border-secondary/50 text-center">
                <Phone className="w-6 h-6 text-foreground mx-auto mb-1" />
                <p className="text-xs font-medium text-foreground">Help Points</p>
              </div>
            </div>
            
            <Button variant="hero" size="lg" className="w-full">
              <Navigation className="w-5 h-5 mr-2" />
              Plan Safe Route
            </Button>
          </CardContent>
        </Card>

        {/* Mental Wellness Support */}
        <Card className="shadow-soft bg-accent/10 border-accent/30">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center">
              <Heart className="w-5 h-5 mr-2 text-primary" />
              Mental Wellness Support
            </CardTitle>
            <p className="text-sm text-muted-foreground">Resources for emotional well-being and trauma support</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <Button variant="secondary" size="sm" className="justify-start h-12">
                <Heart className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Counseling Helpline</p>
                  <p className="text-xs text-muted-foreground">24/7 professional support</p>
                </div>
              </Button>
              
              <Button variant="secondary" size="sm" className="justify-start h-12">
                <Shield className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Self-Care Resources</p>
                  <p className="text-xs text-muted-foreground">Breathing exercises, meditation</p>
                </div>
              </Button>
              
              <Button variant="secondary" size="sm" className="justify-start h-12">
                <Heart className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Support Groups</p>
                  <p className="text-xs text-muted-foreground">Connect with others safely</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Voice Commands */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Voice Command Shortcuts</CardTitle>
            <p className="text-sm text-muted-foreground">Quick voice-activated safety features</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                <span className="font-medium text-foreground">"Hey SURAKSHA, Emergency"</span>
                <span className="text-xs text-muted-foreground">Trigger SOS</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                <span className="font-medium text-foreground">"Hey SURAKSHA, Safe Route"</span>
                <span className="text-xs text-muted-foreground">Start navigation</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                <span className="font-medium text-foreground">"Hey SURAKSHA, Call Help"</span>
                <span className="text-xs text-muted-foreground">Call emergency</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {isNavigating && (
          <Card className="shadow-emergency border-2 border-primary bg-primary/5 animate-pulse">
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <Navigation className="w-6 h-6 text-primary-foreground animate-pulse" />
                </div>
                <h3 className="font-bold text-primary">AI Safety Guide Active</h3>
                <p className="text-sm text-foreground italic">
                  "You are safe. I'm guiding you to the safest route. Stay calm and follow the highlighted path."
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Wellness;