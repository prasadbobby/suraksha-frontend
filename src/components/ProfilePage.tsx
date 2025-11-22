import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useProfile, useContacts, type User, type Contact } from "@/lib/api";
import {
  User as UserIcon,
  Phone,
  Mail,
  Shield,
  Bell,
  Settings,
  LogOut,
  Edit2,
  Save,
  X,
  MapPin,
  Heart,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  emergencyContacts: number;
  notificationsEnabled: boolean;
  locationSharingEnabled: boolean;
  sosEnabled: boolean;
  memberSince: string;
}

interface ProfilePageProps {
  onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { toast } = useToast();
  const auth = useAuth();
  const profileApi = useProfile();
  const contactsApi = useContacts();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Initialize with empty profile
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    emergencyContacts: 0,
    notificationsEnabled: true,
    locationSharingEnabled: true,
    sosEnabled: true,
    memberSince: ''
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Get current user from localStorage first
      const currentUser = auth.getCurrentUser();

      if (currentUser) {
        // Try to fetch fresh data from API
        const [profileResponse, contactsResponse] = await Promise.all([
          profileApi.getUserProfile(),
          contactsApi.getContacts()
        ]);

        let userData = currentUser;
        let userContacts: Contact[] = [];

        if (profileResponse.success && profileResponse.data?.user) {
          userData = profileResponse.data.user;
        }

        if (contactsResponse.success && contactsResponse.data?.contacts) {
          userContacts = contactsResponse.data.contacts;
          setContacts(userContacts);
        }

        // Format member since date
        const memberSince = userData.createdAt
          ? new Date(userData.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long'
            })
          : 'Recently';

        const userProfile: UserProfile = {
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          emergencyContacts: userContacts.filter(c => c.isTrusted).length,
          notificationsEnabled: userData.safetySettings?.notificationsEnabled ?? true,
          locationSharingEnabled: userData.safetySettings?.locationSharingEnabled ?? true,
          sosEnabled: userData.safetySettings?.sosEnabled ?? true,
          memberSince
        };

        setProfile(userProfile);
        setEditedProfile(userProfile);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data. Using cached information.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedProfile(profile); // Reset changes
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Update profile data via API
      const response = await profileApi.updateUserProfile({
        name: editedProfile.name,
        phone: editedProfile.phone
      });

      if (response.success) {
        setProfile(editedProfile);
        setIsEditing(false);
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
      } else {
        throw new Error(response.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string | boolean | number) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSafetySettingChange = async (setting: string, value: boolean) => {
    try {
      // Update local state immediately for better UX
      setProfile(prev => ({
        ...prev,
        [setting]: value
      }));

      // Update in the database
      const safetySettings = {
        [setting]: value
      };

      const response = await profileApi.updateSafetySettings(safetySettings);

      if (response.success) {
        toast({
          title: "Setting Updated",
          description: "Your safety setting has been saved.",
        });
      } else {
        throw new Error(response.error || 'Failed to update safety setting');
      }
    } catch (error) {
      // Revert the change if it failed
      setProfile(prev => ({
        ...prev,
        [setting]: !value
      }));

      console.error('Failed to update safety setting:', error);
      toast({
        title: "Error",
        description: "Failed to save safety setting. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    auth.logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    // Navigate back or to login page
    onBack();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

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
            <UserIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Profile</h1>
            <p className="text-xs text-muted-foreground">Manage your account and safety settings</p>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6 pb-24">

        {/* Profile Card */}
        <Card className="shadow-soft">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Your basic account information
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditToggle}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditToggle}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editedProfile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{profile.name}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={editedProfile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{profile.phone || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{profile.email}</span>
                  <Badge variant="secondary" className="ml-auto">Verified</Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Member since {profile.memberSince}</span>
              <Badge variant="outline" className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                Active Member
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Safety Settings Card */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" />
              Safety Settings
            </CardTitle>
            <CardDescription>
              Configure your emergency and safety preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Emergency alerts & updates</p>
                  </div>
                </div>
                <Switch
                  checked={profile.notificationsEnabled}
                  onCheckedChange={(checked) => handleSafetySettingChange('notificationsEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-success" />
                  <div>
                    <p className="font-medium text-foreground">Location Sharing</p>
                    <p className="text-sm text-muted-foreground">Share location with contacts</p>
                  </div>
                </div>
                <Switch
                  checked={profile.locationSharingEnabled}
                  onCheckedChange={(checked) => handleSafetySettingChange('locationSharingEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-medium text-foreground">Emergency SOS</p>
                    <p className="text-sm text-muted-foreground">Quick emergency assistance</p>
                  </div>
                </div>
                <Switch
                  checked={profile.sosEnabled}
                  onCheckedChange={(checked) => handleSafetySettingChange('sosEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <UserIcon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Emergency Contacts</p>
                    <p className="text-sm text-muted-foreground">{profile.emergencyContacts} contacts added</p>
                  </div>
                </div>
                <Badge variant="outline">{profile.emergencyContacts}</Badge>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <div className="flex items-center gap-3">
                <UserIcon className="h-4 w-4" />
                Manage Emergency Contacts
              </div>
            </Button>

            <Button variant="outline" className="w-full justify-start">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4" />
                Notification Settings
              </div>
            </Button>

            <Button variant="outline" className="w-full justify-start">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4" />
                Privacy & Security
              </div>
            </Button>

            <Separator />

            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default ProfilePage;