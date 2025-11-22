import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Shield,
  Phone,
  MapPin,
  AlertTriangle,
  Users,
  LogOut,
  Heart,
  Bell,
  Settings,
  Send
} from 'lucide-react';
import { useAuth } from '@/lib/api';
import { useFirebaseNotifications } from '@/hooks/useFirebaseNotifications';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [sosActive, setSosActive] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

  const { getCurrentUser } = useAuth();

  // 🔔 Initialize Firebase notifications
  const { notificationToken, permissionGranted } = useFirebaseNotifications();

  // Load current user on component mount
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []); // ✅ Empty dependency array - only run once on mount

  // Log notification status for debugging
  useEffect(() => {
    console.log('🔔 Notification permission granted:', permissionGranted);
    if (notificationToken) {
      console.log('📱 Notification token received:', notificationToken.substring(0, 20) + '...');
    }
  }, [permissionGranted, notificationToken]);

  const handleSOS = () => {
    navigate('/sos');
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-soft">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">SURAKSHA</h1>
              <p className="text-xs text-muted-foreground">
                Welcome back, {currentUser?.name || 'User'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-success/20 rounded-full text-xs font-medium text-success-foreground flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Safe</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6 pb-24">
        {/* Main Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Card
            className="shadow-soft hover:shadow-primary transition-all cursor-pointer hover:scale-[1.02]"
            onClick={() => navigate('/emergency')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-emergency/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="w-6 h-6 text-emergency" />
              </div>
              <h3 className="font-bold text-foreground mb-1">Emergency</h3>
              <p className="text-sm text-muted-foreground">Quick access to help</p>
            </CardContent>
          </Card>

          <Card
            className="shadow-soft hover:shadow-primary transition-all cursor-pointer hover:scale-[1.02]"
            onClick={() => navigate('/location')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-1">Location Sharing</h3>
              <p className="text-sm text-muted-foreground">Share with trusted contacts</p>
            </CardContent>
          </Card>
        </div>

        {/* Emergency SOS */}
        <Card className={`shadow-emergency border-2 ${sosActive ? 'border-emergency bg-emergency/10 animate-pulse' : 'border-emergency/30'}`}>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-emergency" />
                <h2 className="text-lg font-bold text-emergency">Emergency SOS</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Tap to immediately alert your emergency contacts
              </p>
              <Button
                variant="emergency"
                size="lg"
                onClick={handleSOS}
                disabled={sosActive}
                className="w-full h-16 text-lg font-bold"
              >
                <Send className="w-6 h-6 mr-2" />
                {sosActive ? 'SOS ALERT SENT!' : 'SEND SOS ALERT'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card
            className="shadow-soft hover:shadow-primary transition-all cursor-pointer hover:scale-[1.02]"
            onClick={() => navigate('/community')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-1">Community</h3>
              <p className="text-sm text-muted-foreground">Connect safely</p>
            </CardContent>
          </Card>

          <Card
            className="shadow-soft hover:shadow-primary transition-all cursor-pointer hover:scale-[1.02]"
            onClick={() => navigate('/contacts')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-bold text-foreground mb-1">Contacts</h3>
              <p className="text-sm text-muted-foreground">Manage trusted contacts</p>
            </CardContent>
          </Card>

          <Card
            className="shadow-soft hover:shadow-primary transition-all cursor-pointer hover:scale-[1.02]"
            onClick={() => navigate('/wellness')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-1">Wellness</h3>
              <p className="text-sm text-muted-foreground">Stay healthy</p>
            </CardContent>
          </Card>

          <Card
            className="shadow-soft hover:shadow-primary transition-all cursor-pointer hover:scale-[1.02]"
            onClick={() => navigate('/alerts')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-secondary/40 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="font-bold text-foreground mb-1">Alerts</h3>
              <p className="text-sm text-muted-foreground">Stay informed</p>
            </CardContent>
          </Card>

          <Card
            className="shadow-soft hover:shadow-primary transition-all cursor-pointer hover:scale-[1.02]"
            onClick={() => navigate('/settings')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Settings className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-bold text-foreground mb-1">Settings</h3>
              <p className="text-sm text-muted-foreground">App preferences</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;