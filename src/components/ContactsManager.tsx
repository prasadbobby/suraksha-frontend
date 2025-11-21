import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Users,
  UserPlus,
  Phone,
  Edit,
  Trash2,
  Star,
  Search,
  Download,
  Bell,
  MapPin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useContacts, Contact } from '@/lib/api';

interface ContactsManagerProps {
  onBack: () => void;
}

const ContactsManager: React.FC<ContactsManagerProps> = ({ onBack }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: '',
    phone: '',
    email: '',
    relation: '',
    isTrusted: false,
    isPriority: false,
    notificationsEnabled: true
  });
  const { toast } = useToast();
  const { getContacts, createContact, updateContact, deleteContact } = useContacts();

  // Load contacts from API
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setIsLoading(true);
    try {
      const response = await getContacts();
      if (response.success && response.contacts) {
        setContacts(response.contacts);
      } else {
        toast({
          title: "Failed to load contacts",
          description: response.error || "Could not fetch contacts from server",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to server. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm) ||
    contact.relation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const trustedContacts = contacts.filter(contact => contact.isTrusted);
  const nearbyContacts = contacts.filter(contact => contact.distance && contact.distance <= 10);

  const addContact = async () => {
    if (!newContact.name || !newContact.phone) {
      toast({
        title: "Missing Information",
        description: "Please provide at least name and phone number.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await createContact({
        name: newContact.name!,
        phone: newContact.phone!,
        email: newContact.email || '',
        relation: newContact.relation || 'Contact',
        isTrusted: newContact.isTrusted || false,
        isPriority: newContact.isPriority || false,
        notificationsEnabled: newContact.notificationsEnabled || true
      });

      if (response.success && response.contact) {
        setContacts([...contacts, response.contact]);
        setNewContact({
          name: '',
          phone: '',
          email: '',
          relation: '',
          isTrusted: false,
          isPriority: false,
          notificationsEnabled: true
        });
        setIsAddingContact(false);

        toast({
          title: "✅ Contact Added",
          description: `${response.contact.name} has been added to your contacts.`
        });
      } else {
        toast({
          title: "Failed to add contact",
          description: response.error || "Could not add contact to server",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateContactHandler = async (contactId: string, updates: Partial<Contact>) => {
    setIsLoading(true);
    try {
      const response = await updateContact(contactId, updates);

      if (response.success && response.contact) {
        setContacts(contacts.map(contact =>
          (contact._id || contact.id) === contactId ? response.contact : contact
        ));

        toast({
          title: "✅ Contact Updated",
          description: "Contact information has been updated."
        });
      } else {
        toast({
          title: "Failed to update contact",
          description: response.error || "Could not update contact",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: "Error",
        description: "Failed to update contact. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteContactHandler = async (contactId: string) => {
    const contact = contacts.find(c => (c._id || c.id) === contactId);
    if (!contact) return;

    setIsLoading(true);
    try {
      const response = await deleteContact(contactId);

      if (response.success) {
        setContacts(contacts.filter(c => (c._id || c.id) !== contactId));

        toast({
          title: "🗑️ Contact Removed",
          description: `${contact.name} has been removed from your contacts.`
        });
      } else {
        toast({
          title: "Failed to delete contact",
          description: response.error || "Could not delete contact",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const syncPhoneContacts = async () => {
    setSyncEnabled(true);
    toast({
      title: "📱 Syncing Contacts",
      description: "Accessing your device contacts..."
    });

    try {
      // Request permission and access real device contacts
      if ('contacts' in navigator && 'ContactsManager' in window) {
        // @ts-ignore - Web Contacts API
        const contacts = await navigator.contacts.select(['name', 'tel'], {multiple: true});

        const newContacts: Contact[] = [];
        for (const contact of contacts) {
          if (contact.name && contact.tel && contact.tel.length > 0) {
            try {
              const response = await createContact({
                name: contact.name[0] || 'Unknown Contact',
                phone: contact.tel[0] || '',
                email: '',
                relation: 'Contact',
                isTrusted: false,
                isPriority: false,
                notificationsEnabled: true
              });

              if (response.success && response.contact) {
                newContacts.push(response.contact);
              }
            } catch (error) {
              console.error('Error creating synced contact:', error);
            }
          }
        }

        setContacts(prev => [...prev, ...newContacts]);
        toast({
          title: "✅ Sync Complete",
          description: `${newContacts.length} contacts imported successfully.`
        });
      } else {
        // Fallback for browsers that don't support Contacts API
        toast({
          title: "Contact Sync Not Available",
          description: "Your browser doesn't support contact syncing. Please add contacts manually.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error syncing contacts:', error);
      toast({
        title: "Sync Failed",
        description: "Could not access device contacts. Please add contacts manually.",
        variant: "destructive"
      });
    } finally {
      setSyncEnabled(false);
    }
  };

  const callContact = (contact: Contact) => {
    window.open(`tel:${contact.phone}`, '_self');
    toast({
      title: `📞 Calling ${contact.name}`,
      description: `Dialing ${contact.phone}...`
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
            <h1 className="text-xl font-bold text-foreground">Contacts</h1>
            <p className="text-xs text-muted-foreground">Manage trusted contacts & emergency notifications</p>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="shadow-soft text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{trustedContacts.length}</div>
              <div className="text-xs text-muted-foreground">Trusted</div>
            </CardContent>
          </Card>
          <Card className="shadow-soft text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">{nearbyContacts.length}</div>
              <div className="text-xs text-muted-foreground">Nearby</div>
            </CardContent>
          </Card>
          <Card className="shadow-soft text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">{contacts.length}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <Card className="shadow-soft">
          <CardContent className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="hero"
                size="sm"
                onClick={() => setIsAddingContact(true)}
                className="flex-1"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={syncPhoneContacts}
                className="flex-1"
                disabled={syncEnabled}
              >
                <Download className="w-4 h-4 mr-2" />
                {syncEnabled ? 'Syncing...' : 'Sync Phone'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Add Contact Form */}
        {isAddingContact && (
          <Card className="shadow-soft border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg text-primary">Add New Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Full name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="relation">Relation</Label>
                  <Input
                    id="relation"
                    placeholder="Mother, Friend, etc."
                    value={newContact.relation}
                    onChange={(e) => setNewContact({...newContact, relation: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="+91 98765 43210"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={newContact.email}
                  onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="trusted">Trusted Contact</Label>
                  <Switch
                    id="trusted"
                    checked={newContact.isTrusted}
                    onCheckedChange={(checked) => setNewContact({...newContact, isTrusted: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="priority">Priority Contact</Label>
                  <Switch
                    id="priority"
                    checked={newContact.isPriority}
                    onCheckedChange={(checked) => setNewContact({...newContact, isPriority: checked})}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="hero"
                  onClick={addContact}
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Contact'}
                </Button>
                <Button variant="secondary" onClick={() => setIsAddingContact(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contacts List */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">
              {searchTerm ? `Search Results (${filteredContacts.length})` : 'All Contacts'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredContacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No contacts found.' : 'No contacts added yet.'}
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                        {contact.name[0]}
                      </div>
                      {contact.isTrusted && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                          <Star className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-foreground">{contact.name}</h3>
                        {contact.isPriority && (
                          <Badge variant="secondary" className="text-xs">Priority</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{contact.relation}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-muted-foreground">{contact.phone}</span>
                        {contact.distance && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{contact.distance}km</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {/* Trusted/Priority Toggle Buttons */}
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant={contact.isTrusted ? "default" : "outline"}
                        onClick={() => updateContactHandler(contact._id || contact.id, { isTrusted: !contact.isTrusted })}
                        className="text-xs px-2 py-1 h-7"
                      >
                        {contact.isTrusted ? "Trusted ✓" : "Mark Trusted"}
                      </Button>
                      <Button
                        size="sm"
                        variant={contact.isPriority ? "default" : "outline"}
                        onClick={() => updateContactHandler(contact._id || contact.id, { isPriority: !contact.isPriority })}
                        className="text-xs px-2 py-1 h-7"
                      >
                        {contact.isPriority ? "Priority ✓" : "Priority"}
                      </Button>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => callContact(contact)}
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteContactHandler(contact._id || contact.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Emergency Instructions */}
        <Card className="shadow-soft bg-muted/20 border-muted/40">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Bell className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Emergency Notifications</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>• Trusted contacts receive instant alerts during emergencies</p>
                  <p>• Nearby contacts (within 10km) get location notifications</p>
                  <p>• Priority contacts are notified first</p>
                  <p>• All contacts can be reached with one-tap calling</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactsManager;