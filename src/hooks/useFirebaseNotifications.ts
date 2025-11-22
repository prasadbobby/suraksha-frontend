import { useEffect, useState } from 'react';
import { requestNotificationPermission, onForegroundMessage } from '../lib/firebase';
import { useFirebase } from '../lib/api';
import { useToast } from './use-toast';

export const useFirebaseNotifications = () => {
  const [notificationToken, setNotificationToken] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const { saveNotificationToken } = useFirebase();
  const { toast } = useToast();

  // Request notification permission on component mount
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const result = await requestNotificationPermission();

        if (result.success && result.token) {
          console.log('📱 Firebase notification token:', result.token);
          setNotificationToken(result.token);
          setPermissionGranted(true);

          // Save token to backend
          try {
            await saveNotificationToken(result.token);
            console.log('✅ Notification token saved to backend');
          } catch (error) {
            console.error('❌ Failed to save notification token:', error);
          }
        } else {
          console.log('❌ Notification permission denied or not supported');
          setPermissionGranted(false);
        }
      } catch (error) {
        console.error('❌ Error requesting notification permission:', error);
        setPermissionGranted(false);
      }
    };

    requestPermission();
  }, [saveNotificationToken]);

  // Listen for foreground messages
  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload) => {
      console.log('📱 Foreground notification received:', payload);

      // Show notification as toast when app is open
      if (payload.notification) {
        toast({
          title: payload.notification.title || '🚨 Emergency Alert',
          description: payload.notification.body || 'You have received an emergency notification.',
          duration: 10000, // 10 seconds for emergency notifications
        });
      }

      // Handle emergency alerts specifically
      if (payload.data?.type === 'emergency_alert') {
        const { userName, latitude, longitude, address } = payload.data;

        // You could trigger additional actions here like:
        // - Auto-open maps with location
        // - Show full-screen emergency alert
        // - Play alert sound

        if (latitude && longitude) {
          console.log(`🚨 Emergency alert from ${userName} at ${latitude}, ${longitude}`);
        }
      }
    });

    return unsubscribe;
  }, [toast]);

  return {
    notificationToken,
    permissionGranted,
    requestPermission: async () => {
      try {
        const result = await requestNotificationPermission();
        if (result.success) {
          setPermissionGranted(true);
          setNotificationToken(result.token || null);
          return result;
        }
        return result;
      } catch (error) {
        console.error('Error requesting permission:', error);
        return { success: false, error };
      }
    }
  };
};