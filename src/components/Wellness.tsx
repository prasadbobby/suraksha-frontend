import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Heart, Navigation, Phone, MapPin, Shield } from 'lucide-react';

interface WellnessProps {
  onBack: () => void;
}

const Wellness: React.FC<WellnessProps> = ({ onBack }) => {

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

      <div className="max-w-md mx-auto p-4 space-y-6 pb-24">

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


      </div>
    </div>
  );
};

export default Wellness;