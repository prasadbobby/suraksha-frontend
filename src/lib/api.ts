// API service for communicating with MongoDB backend
const API_BASE_URL = import.meta.env.PROD
  ? import.meta.env.VITE_API_BASE_URL_PRODUCTION || 'https://suraksha-api.vercel.app/api'
  : import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
  [key: string]: any;
}

class ApiService {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Authentication methods
  async login(email: string, password: string) {
    const response = await this.request<{
      token: string;
      user: {
        id: string;
        email: string;
        name: string;
        phone?: string;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.token) {
      this.token = response.token;
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }) {
    const response = await this.request<{
      token: string;
      user: {
        id: string;
        email: string;
        name: string;
        phone?: string;
      };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.token) {
      this.token = response.token;
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Contact methods
  async getContacts() {
    return this.request<{ contacts: Contact[] }>('/contacts');
  }

  async createContact(contactData: Partial<Contact>) {
    return this.request<{ contact: Contact }>('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  async updateContact(id: string, contactData: Partial<Contact>) {
    return this.request<{ contact: Contact }>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    });
  }

  async deleteContact(id: string) {
    return this.request(`/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  // Location methods
  async updateLocation(locationData: {
    latitude: number;
    longitude: number;
    address?: string;
    accuracy?: number;
  }) {
    return this.request('/location/update', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  async shareLocation(locationData: {
    latitude: number;
    longitude: number;
    address?: string;
    contactIds: string[];
    duration?: number;
  }) {
    return this.request('/location/share', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  // Emergency methods
  async sendEmergencyAlert(alertData: {
    triggerMethod: 'button' | 'shake';
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
  }) {
    return this.request<{
      alertId: string;
      contactsNotified: number;
      notificationsSent: number;
    }>('/emergency/alert', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  }

  async getEmergencyAlerts() {
    return this.request<{ alerts: EmergencyAlert[] }>('/emergency/alerts');
  }

  // User profile methods
  async getUserProfile() {
    return this.request<{ user: User }>('/user/profile');
  }

  async updateUserProfile(profileData: {
    name?: string;
    phone?: string;
    notificationToken?: string;
    safetySettings?: any;
    alertPreferences?: any;
  }) {
    return this.request<{ user: User }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updateSafetySettings(safetySettings: any) {
    return this.request<{ user: User }>('/user/safety-settings', {
      method: 'PUT',
      body: JSON.stringify({ safetySettings }),
    });
  }

  async updateAlertPreferences(alertPreferences: any) {
    return this.request<{ user: User }>('/user/alert-preferences', {
      method: 'PUT',
      body: JSON.stringify({ alertPreferences }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Firebase notification methods
  async sendEmergencyNotification(emergencyData: {
    userName: string;
    userPhone?: string;
    location?: { latitude: number; longitude: number; address?: string };
    contactEmails: string[];
  }) {
    return this.request('/firebase/emergency', {
      method: 'POST',
      body: JSON.stringify(emergencyData)
    });
  }

  async sendLocationNotification(locationData: {
    userName: string;
    location: { latitude: number; longitude: number; address?: string };
    contactEmails: string[];
    isLiveSharing?: boolean;
  }) {
    return this.request('/firebase/location', {
      method: 'POST',
      body: JSON.stringify(locationData)
    });
  }

  async saveNotificationToken(token: string) {
    return this.request('/firebase/token', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  }
}

// Type definitions
export interface Contact {
  _id?: string;
  id?: string;
  name: string;
  phone: string;
  email?: string; // ✅ Email field for notifications
  relation: string;
  isTrusted: boolean;
  isPriority: boolean;
  notificationsEnabled: boolean;
  distance?: number;
  lastSeen?: string;
  createdAt?: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  isActive: boolean;
  notificationToken?: string;
  safetySettings?: {
    notificationsEnabled: boolean;
    locationSharingEnabled: boolean;
    sosEnabled: boolean;
    stealthMode: boolean;
    autoRecording: boolean;
    includeLocation: boolean;
    biometricLock: boolean;
  };
  alertPreferences?: {
    emergencyAlerts: boolean;
    communityAlerts: boolean;
    travelSafetyTips: boolean;
    incidentReports: boolean;
    generalSafetyTips: boolean;
    weatherAlerts: boolean;
  };
  createdAt: string;
  lastSeen: string;
}

export interface EmergencyAlert {
  _id: string;
  userId: string;
  triggerMethod: 'button' | 'shake';
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status: 'active' | 'resolved' | 'cancelled';
  contactsNotified: string[];
  notificationsSent: number;
  createdAt: string;
  resolvedAt?: string;
}

export interface LocationRecord {
  _id: string;
  userId: string;
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
  timestamp: string;
  isShared: boolean;
  sharedWith: string[];
  expiresAt?: string;
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// React import for hooks
import { useMemo } from 'react';

// Helper functions for React components

export const useAuth = () => {
  return useMemo(() => ({
    login: apiService.login.bind(apiService),
    register: apiService.register.bind(apiService),
    logout: apiService.logout.bind(apiService),
    isAuthenticated: apiService.isAuthenticated.bind(apiService),
    getCurrentUser: apiService.getCurrentUser.bind(apiService),
  }), []); // ✅ Stable references - only created once
};

export const useContacts = () => {
  return useMemo(() => ({
    getContacts: apiService.getContacts.bind(apiService),
    createContact: apiService.createContact.bind(apiService),
    updateContact: apiService.updateContact.bind(apiService),
    deleteContact: apiService.deleteContact.bind(apiService),
  }), []); // ✅ Stable references
};

export const useLocation = () => {
  return useMemo(() => ({
    updateLocation: apiService.updateLocation.bind(apiService),
    shareLocation: apiService.shareLocation.bind(apiService),
  }), []); // ✅ Stable references
};

export const useEmergency = () => {
  return useMemo(() => ({
    sendEmergencyAlert: apiService.sendEmergencyAlert.bind(apiService),
    getEmergencyAlerts: apiService.getEmergencyAlerts.bind(apiService),
  }), []); // ✅ Stable references
};

export const useProfile = () => {
  return useMemo(() => ({
    getUserProfile: apiService.getUserProfile.bind(apiService),
    updateUserProfile: apiService.updateUserProfile.bind(apiService),
    updateSafetySettings: apiService.updateSafetySettings.bind(apiService),
    updateAlertPreferences: apiService.updateAlertPreferences.bind(apiService),
  }), []); // ✅ Stable references
};

export const useFirebase = () => {
  return useMemo(() => ({
    sendEmergencyNotification: apiService.sendEmergencyNotification.bind(apiService),
    sendLocationNotification: apiService.sendLocationNotification.bind(apiService),
    saveNotificationToken: apiService.saveNotificationToken.bind(apiService),
  }), []); // ✅ Stable references
};