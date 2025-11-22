/**
 * Frontend Firebase Configuration
 *
 * This file handles CLIENT-SIDE Firebase features only:
 * - User authentication (Google sign-in)
 * - Push notification permissions and receiving messages
 * - Real-time subscriptions
 * - File uploads
 *
 * For API calls (contacts, emergency alerts, location sharing), use /lib/api.ts instead.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBwZ2dU5rYjeZtgQzc1UkQtZowszAGbiA0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "drop-files-bobby.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://drop-files-bobby.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "drop-files-bobby",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "drop-files-bobby.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "789298801694",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:789298801694:web:79d387857dc6af4690d20f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-229D2BV4D4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize messaging (for notifications)
let messaging: any = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  messaging = getMessaging(app);
}

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Auth functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Google sign-in error:', error);
    return { success: false, error: error };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error };
  }
};

// User profile functions
export const createUserProfile = async (userId: string, profileData: any) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...profileData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error };
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, error: 'Profile not found' };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error };
  }
};

// Note: Emergency contacts and alerts are now handled by the backend API
// See /lib/api.ts for the proper API calls to use instead

// Note: Location tracking is now handled by the backend API
// See /lib/api.ts useLocation() hook for proper API calls

// Notification functions
export const requestNotificationPermission = async () => {
  if (!messaging) {
    return { success: false, error: 'Messaging not supported' };
  }

  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || 'BF-SHQY48kxphXSqtCM5JHaupL3nH9p3P1AByA9nGBq8f9zVbfEmqlk6eYZ3qtaGMy_eCilJKz4YoAz4ff8SKQc'
      });

      return { success: true, token };
    } else {
      return { success: false, error: 'Permission denied' };
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return { success: false, error };
  }
};

export const saveNotificationToken = async (userId: string, token: string) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      notificationToken: token,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error saving notification token:', error);
    return { success: false, error };
  }
};

// Listen for foreground messages
export const onForegroundMessage = (callback: (payload: any) => void) => {
  if (!messaging) return () => {};

  return onMessage(messaging, callback);
};

// Real-time subscriptions and file uploads
export const subscribeToLocationUpdates = (userId: string, callback: (location: any) => void) => {
  const locationRef = doc(db, 'userLocations', userId);
  return onSnapshot(locationRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
};

export const uploadEvidence = async (userId: string, file: File, type: 'image' | 'video' | 'audio') => {
  try {
    const filename = `evidence/${userId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filename);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Save evidence metadata to Firestore
    const evidenceId = `evidence_${Date.now()}`;
    await setDoc(doc(db, 'evidence', evidenceId), {
      userId,
      type,
      filename,
      downloadURL,
      size: file.size,
      uploadedAt: new Date()
    });

    return { success: true, downloadURL, evidenceId };
  } catch (error) {
    console.error('Error uploading evidence:', error);
    return { success: false, error };
  }
};

export default app;