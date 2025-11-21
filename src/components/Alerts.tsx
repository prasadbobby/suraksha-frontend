import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Bell, MapPin, Clock, Navigation } from 'lucide-react';

interface AlertsProps {
  onBack: () => void;
}

const Alerts: React.FC<AlertsProps> = ({ onBack }) => {
  const [alertSettings, setAlertSettings] = useState({
    emergencyAlerts: true,
    communityAlerts: true,
    safetyTips: true,
    weatherAlerts: false,
    travelTips: true,
    incidentReports: true
  });

  const recentAlerts = [
    { 
      type: 'Safety Tip', 
      message: 'Avoid XYZ Street after 9 PM - High incident reports', 
      time: '2h ago',
      icon: MapPin,
      priority: 'high'
    },
    { 
      type: 'Travel Tip', 
      message: 'You\'re visiting a new area. Stay alert and keep contacts informed.', 
      time: '4h ago',
      icon: Navigation,
      priority: 'medium'
    },
    { 
      type: 'Community Alert', 
      message: 'Safety volunteer Meera is now active in your area', 
      time: '6h ago',
      icon: Bell,
      priority: 'low'
    }
  ];

  const updateSetting = (key: keyof typeof alertSettings) => {
    setAlertSettings(prev => ({ ...prev, [key]: !prev[key] }));
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
            <Bell className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Alerts</h1>
            <p className="text-xs text-muted-foreground">Stay informed about safety updates</p>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Alert Preferences */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Personalized Alert Preferences</CardTitle>
            <p className="text-sm text-muted-foreground">Choose what types of safety alerts you want to receive</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-foreground">Emergency Alerts</span>
                <p className="text-xs text-muted-foreground">Critical safety notifications</p>
              </div>
              <Switch checked={alertSettings.emergencyAlerts} onCheckedChange={() => updateSetting('emergencyAlerts')} />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-foreground">Community Alerts</span>
                <p className="text-xs text-muted-foreground">Updates from nearby helpers</p>
              </div>
              <Switch checked={alertSettings.communityAlerts} onCheckedChange={() => updateSetting('communityAlerts')} />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-foreground">Travel Safety Tips</span>
                <p className="text-xs text-muted-foreground">Location-based safety advice</p>
              </div>
              <Switch checked={alertSettings.travelTips} onCheckedChange={() => updateSetting('travelTips')} />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-foreground">Incident Reports</span>
                <p className="text-xs text-muted-foreground">Nearby safety incidents</p>
              </div>
              <Switch checked={alertSettings.incidentReports} onCheckedChange={() => updateSetting('incidentReports')} />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-foreground">General Safety Tips</span>
                <p className="text-xs text-muted-foreground">Daily safety recommendations</p>
              </div>
              <Switch checked={alertSettings.safetyTips} onCheckedChange={() => updateSetting('safetyTips')} />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-foreground">Weather Alerts</span>
                <p className="text-xs text-muted-foreground">Severe weather warnings</p>
              </div>
              <Switch checked={alertSettings.weatherAlerts} onCheckedChange={() => updateSetting('weatherAlerts')} />
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Recent Alerts</CardTitle>
            <p className="text-sm text-muted-foreground">Your latest safety notifications</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAlerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  alert.priority === 'high' 
                    ? 'bg-emergency/5 border-emergency/20' 
                    : alert.priority === 'medium' 
                    ? 'bg-primary/5 border-primary/20' 
                    : 'bg-card border-border'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    alert.priority === 'high' 
                      ? 'bg-emergency/20' 
                      : alert.priority === 'medium' 
                      ? 'bg-primary/20' 
                      : 'bg-muted/40'
                  }`}>
                    <alert.icon className={`w-4 h-4 ${
                      alert.priority === 'high' 
                        ? 'text-emergency' 
                        : alert.priority === 'medium' 
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-primary">{alert.type}</span>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {alert.time}
                      </div>
                    </div>
                    <p className="text-sm text-foreground">{alert.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Travel Safety Tips */}
        <Card className="shadow-soft bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg text-primary flex items-center">
              <Navigation className="w-5 h-5 mr-2" />
              Smart Travel Tips
            </CardTitle>
            <p className="text-sm text-muted-foreground">AI-powered location-based safety advice</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-card rounded-lg">
                <h3 className="font-semibold text-foreground mb-1">Visiting New Area Detected</h3>
                <p className="text-sm text-muted-foreground">
                  You're in Connaught Place for the first time this month. Stay on main roads and keep your trusted contacts informed.
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" size="sm" className="flex-1">
                  Share Location
                </Button>
                <Button variant="hero" size="sm" className="flex-1">
                  Get Safe Route
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Alerts;