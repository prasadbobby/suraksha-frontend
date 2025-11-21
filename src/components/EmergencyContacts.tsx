import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Phone, Shield, Heart, Truck, Users, Baby } from 'lucide-react';

interface EmergencyContactsProps {
  onBack: () => void;
}

const EmergencyContacts: React.FC<EmergencyContactsProps> = ({ onBack }) => {
  const emergencyNumbers = [
    {
      name: 'Police Emergency',
      number: '100',
      description: 'Immediate Police Assistance',
      icon: Shield,
      color: 'emergency',
      urgent: true
    },
    {
      name: 'Women Helpline',
      number: '1091',
      description: '24/7 Women in Distress',
      icon: Shield,
      color: 'primary',
      urgent: true
    },
    {
      name: 'Medical Emergency',
      number: '102',
      description: 'Ambulance Services',
      icon: Heart,
      color: 'emergency',
      urgent: true
    },
    {
      name: 'Child Helpline',
      number: '1098',
      description: 'Child Protection Services',
      icon: Baby,
      color: 'primary',
      urgent: true
    },
    {
      name: 'Fire Emergency',
      number: '101',
      description: 'Fire Department',
      icon: Truck,
      color: 'emergency',
      urgent: false
    }
  ];

  const localSupport = [
    {
      name: 'She Team (Telangana)',
      number: '8712657014',
      description: 'Women Safety Wing - Hyderabad Police',
      icon: Users,
      color: 'primary'
    },
    {
      name: 'She Team (Andhra Pradesh)',
      number: '9490616555',
      description: 'Women Safety Wing - AP Police',
      icon: Users,
      color: 'primary'
    },
    {
      name: 'Domestic Violence Helpline',
      number: '181',
      description: 'Women Helpline (India)',
      icon: Shield,
      color: 'primary'
    },
    {
      name: 'Women NGO Support',
      number: '+91-11-26692700',
      description: 'Delhi Commission for Women',
      icon: Heart,
      color: 'primary'
    },
    {
      name: 'Anti-Ragging Helpline',
      number: '1800-180-5522',
      description: 'UGC Anti-Ragging Helpline',
      icon: Shield,
      color: 'primary'
    }
  ];

  const makeCall = (number: string) => {
    window.open(`tel:${number}`);
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
          <div>
            <h1 className="text-xl font-bold text-foreground">Emergency Contacts</h1>
            <p className="text-xs text-muted-foreground">Verified helplines & support</p>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Critical Emergency Numbers */}
        <Card className="shadow-emergency border-emergency/30">
          <CardHeader>
            <CardTitle className="text-lg text-emergency flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Critical Emergency
            </CardTitle>
            <p className="text-sm text-muted-foreground">Immediate response services</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {emergencyNumbers.filter(contact => contact.urgent).map((contact, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    contact.color === 'emergency' ? 'bg-emergency/20' : 'bg-primary/20'
                  }`}>
                    <contact.icon className={`w-5 h-5 ${
                      contact.color === 'emergency' ? 'text-emergency' : 'text-primary'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{contact.name}</h3>
                    <p className="text-sm text-muted-foreground">{contact.description}</p>
                  </div>
                </div>
                <Button
                  variant={contact.color === 'emergency' ? 'emergency' : 'hero'}
                  size="sm"
                  onClick={() => makeCall(contact.number)}
                  className="min-w-20 font-bold"
                >
                  {contact.number}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Other Emergency Services */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Other Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {emergencyNumbers.filter(contact => !contact.urgent).map((contact, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <contact.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{contact.name}</h3>
                    <p className="text-sm text-muted-foreground">{contact.description}</p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => makeCall(contact.number)}
                  className="min-w-20"
                >
                  {contact.number}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Local Support & NGOs */}
        <Card className="shadow-soft bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Support Organizations</CardTitle>
            <p className="text-sm text-muted-foreground">NGOs and counseling services</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {localSupport.map((contact, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <contact.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{contact.name}</h3>
                    <p className="text-sm text-muted-foreground">{contact.description}</p>
                  </div>
                </div>
                <Button
                  variant="hero"
                  size="sm"
                  onClick={() => makeCall(contact.number)}
                  className="text-xs px-3"
                >
                  Call
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Important Note */}
        <Card className="shadow-soft bg-accent/10 border-accent/30">
          <CardContent className="p-4">
            <p className="text-sm text-foreground text-center">
              <strong>Remember:</strong> In any emergency, call the appropriate number immediately. 
              These services are available 24/7 and are free of charge.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmergencyContacts;
