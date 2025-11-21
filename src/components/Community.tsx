import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, MessageSquare, MapPin, Shield, Eye, Clock } from 'lucide-react';

interface CommunityProps {
  onBack: () => void;
}

const Community: React.FC<CommunityProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'neighbors' | 'discussions' | 'heatmap'>('neighbors');

  const verifiedNeighbors = [
    { name: 'Meera Sharma', distance: '0.2km away', type: 'Verified Helper', status: 'online', rating: 4.9 },
    { name: 'Anita Gupta', distance: '0.5km away', type: 'Community Volunteer', status: 'online', rating: 4.8 },
    { name: 'Priya Singh', distance: '0.8km away', type: 'Safety Ambassador', status: 'offline', rating: 4.7 }
  ];

  const discussions = [
    { title: 'Safe walking routes at night', replies: 24, lastActive: '2h ago', category: 'Safety Tips', anonymous: true },
    { title: 'Incident near Metro Station', replies: 8, lastActive: '4h ago', category: 'Alert', anonymous: true },
    { title: 'Self-defense class recommendations', replies: 15, lastActive: '1d ago', category: 'Resources', anonymous: false }
  ];

  const unsafeZones = [
    { area: 'XYZ Street', time: 'After 9 PM', reports: 12, severity: 'high' },
    { area: 'Park Area (East)', time: 'Evening hours', reports: 8, severity: 'medium' },
    { area: 'Bus Stop Junction', time: 'Late night', reports: 5, severity: 'low' }
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
            <Users className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Community</h1>
            <p className="text-xs text-muted-foreground">Connect safely with your neighborhood</p>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-muted/30 rounded-lg p-1">
          <Button
            variant={activeTab === 'neighbors' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('neighbors')}
            className="flex-1 text-xs"
          >
            <Users className="w-4 h-4 mr-1" />
            Neighbors
          </Button>
          <Button
            variant={activeTab === 'discussions' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('discussions')}
            className="flex-1 text-xs"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Discussions
          </Button>
          <Button
            variant={activeTab === 'heatmap' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('heatmap')}
            className="flex-1 text-xs"
          >
            <MapPin className="w-4 h-4 mr-1" />
            Safety Map
          </Button>
        </div>

        {/* Verified Neighbors & Volunteers */}
        {activeTab === 'neighbors' && (
          <div className="space-y-4">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg text-foreground flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-success" />
                  Verified Helpers Nearby
                </CardTitle>
                <p className="text-sm text-muted-foreground">KYC-verified community members ready to help</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {verifiedNeighbors.map((neighbor, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground font-semibold text-sm">
                            {neighbor.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          neighbor.status === 'online' ? 'bg-success' : 'bg-muted-foreground'
                        }`}></div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{neighbor.name}</h3>
                        <p className="text-xs text-muted-foreground">{neighbor.distance} • {neighbor.type}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <div className="flex space-x-0.5">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className={`w-2 h-2 rounded-full ${
                                i < Math.floor(neighbor.rating) ? 'bg-success' : 'bg-muted'
                              }`}></div>
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">{neighbor.rating}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm">
                      Connect
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button variant="hero" className="w-full" size="lg">
              <Shield className="w-5 h-5 mr-2" />
              Become a Verified Helper
            </Button>
          </div>
        )}

        {/* Anonymous Discussion Rooms */}
        {activeTab === 'discussions' && (
          <div className="space-y-4">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg text-foreground flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                  Safe Discussions
                </CardTitle>
                <p className="text-sm text-muted-foreground">Share experiences and tips anonymously</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {discussions.map((discussion, index) => (
                  <div
                    key={index}
                    className="p-3 bg-card rounded-lg border border-border hover:border-primary/30 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground text-sm">{discussion.title}</h3>
                      {discussion.anonymous && (
                        <Badge variant="secondary" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          Anonymous
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="text-xs">{discussion.category}</Badge>
                        <span className="text-xs text-muted-foreground">{discussion.replies} replies</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {discussion.lastActive}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button variant="hero" className="w-full" size="lg">
              <MessageSquare className="w-5 h-5 mr-2" />
              Start Anonymous Discussion
            </Button>
          </div>
        )}

        {/* Incident Heatmap */}
        {activeTab === 'heatmap' && (
          <div className="space-y-4">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg text-foreground flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-emergency" />
                  Safety Heatmap
                </CardTitle>
                <p className="text-sm text-muted-foreground">Real-time unsafe zones based on community reports</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {unsafeZones.map((zone, index) => (
                  <div
                    key={index}
                    className="p-3 bg-card rounded-lg border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{zone.area}</h3>
                      <Badge 
                        variant={zone.severity === 'high' ? 'destructive' : zone.severity === 'medium' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {zone.severity === 'high' ? '⚠️ High Risk' : zone.severity === 'medium' ? '🔶 Medium' : '🟡 Low'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Avoid during: {zone.time}</span>
                      <span className="text-muted-foreground">{zone.reports} reports</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="emergency" size="sm" className="h-12">
                <MapPin className="w-4 h-4 mr-2" />
                Report Incident
              </Button>
              <Button variant="secondary" size="sm" className="h-12">
                <Shield className="w-4 h-4 mr-2" />
                View Full Map
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;