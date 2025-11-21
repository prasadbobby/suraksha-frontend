import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmergencyContacts from './EmergencyContacts';
import LocationSharing from './LocationSharing';
import CommunityFeatures from './CommunityFeatures';
import ContactsManager from './ContactsManager';
import EmergencySOS from './EmergencySOS';
import Alerts from './Alerts';
import SettingsPage from './SettingsPage';
import Wellness from './Wellness';

// Wrapper components that use the existing components with navigation
export const EmergencyContactsRoute = () => {
  const navigate = useNavigate();
  return <EmergencyContacts onBack={() => navigate('/')} />;
};

export const LocationSharingRoute = () => {
  const navigate = useNavigate();
  return <LocationSharing onBack={() => navigate('/')} />;
};

export const CommunityFeaturesRoute = () => {
  const navigate = useNavigate();
  return <CommunityFeatures onBack={() => navigate('/')} />;
};

export const ContactsManagerRoute = () => {
  const navigate = useNavigate();
  return <ContactsManager onBack={() => navigate('/')} />;
};

export const EmergencySOSRoute = () => {
  const navigate = useNavigate();
  return <EmergencySOS onBack={() => navigate('/')} />;
};

export const AlertsRoute = () => {
  const navigate = useNavigate();
  return <Alerts onBack={() => navigate('/')} />;
};

export const SettingsPageRoute = () => {
  const navigate = useNavigate();
  return <SettingsPage onBack={() => navigate('/')} />;
};

export const WellnessRoute = () => {
  const navigate = useNavigate();
  return <Wellness onBack={() => navigate('/')} />;
};