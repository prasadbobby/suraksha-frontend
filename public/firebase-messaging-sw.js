// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBwZ2dU5rYjeZtgQzc1UkQtZowszAGbiA0",
  authDomain: "drop-files-bobby.firebaseapp.com",
  databaseURL: "https://drop-files-bobby.firebaseio.com",
  projectId: "drop-files-bobby",
  storageBucket: "drop-files-bobby.firebasestorage.app",
  messagingSenderId: "789298801694",
  appId: "1:789298801694:web:79d387857dc6af4690d20f",
  measurementId: "G-229D2BV4D4"
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);

// Initialize messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  // Customize notification based on payload
  let notificationTitle = payload.notification?.title || 'Suraksha Alert';
  let notificationOptions = {
    body: payload.notification?.body || 'You have a new safety alert',
    icon: '/icon-192x192.png', // Add your app icon
    badge: '/badge-72x72.png', // Add your app badge
    vibrate: [200, 100, 200], // Vibration pattern
    tag: payload.data?.type || 'general',
    data: payload.data,
    actions: []
  };

  // Add actions based on notification type
  if (payload.data?.type === 'emergency_alert') {
    notificationTitle = '🚨 Emergency Alert';
    notificationOptions.body = payload.notification?.body || 'Someone needs help!';
    notificationOptions.requireInteraction = true; // Keep notification visible
    notificationOptions.vibrate = [300, 200, 300, 200, 300]; // Stronger vibration
    notificationOptions.actions = [
      {
        action: 'view_location',
        title: '📍 View Location',
        icon: '/icons/location.png'
      },
      {
        action: 'call_help',
        title: '📞 Call',
        icon: '/icons/phone.png'
      }
    ];
  } else if (payload.data?.type === 'location_share') {
    notificationTitle = '📍 Location Shared';
    notificationOptions.body = payload.notification?.body || 'Location has been shared with you';
    notificationOptions.actions = [
      {
        action: 'view_map',
        title: 'View on Map',
        icon: '/icons/map.png'
      }
    ];
  } else if (payload.data?.type === 'safe_arrival') {
    notificationTitle = '✅ Safe Arrival';
    notificationOptions.body = payload.notification?.body || 'Contact has arrived safely';
  }

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  // Handle different actions
  if (action === 'view_location' || action === 'view_map') {
    // Open app to location view
    event.waitUntil(
      clients.openWindow(`/location?lat=${data.lat}&lng=${data.lng}`)
    );
  } else if (action === 'call_help') {
    // Open dialer
    event.waitUntil(
      clients.openWindow(`tel:${data.phone || '100'}`)
    );
  } else {
    // Default action - open app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url.includes('/') && 'focus' in client) {
              return client.focus();
            }
          }

          // If app is not open, open it
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});

// Handle notification close events
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);

  // Track notification dismissal
  const data = event.notification.data;
  if (data?.type === 'emergency_alert') {
    // Log emergency alert dismissal for analytics
    console.log('Emergency alert dismissed');
  }
});

// Install service worker
self.addEventListener('install', (event) => {
  console.log('Suraksha service worker installing...');
  self.skipWaiting();
});

// Activate service worker
self.addEventListener('activate', (event) => {
  console.log('Suraksha service worker activating...');
  event.waitUntil(clients.claim());
});

// Handle sync events for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'emergency-sync') {
    event.waitUntil(
      // Sync emergency data when back online
      syncEmergencyData()
    );
  }
});

async function syncEmergencyData() {
  try {
    // Get pending emergency alerts from IndexedDB or local storage
    // and sync them to Firebase when connection is restored
    console.log('Syncing emergency data...');

    // Implementation would depend on your offline storage strategy
    // This is a placeholder for the actual sync logic

    return Promise.resolve();
  } catch (error) {
    console.error('Error syncing emergency data:', error);
    return Promise.reject(error);
  }
}