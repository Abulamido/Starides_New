// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
firebase.initializeApp({
    apiKey: "AIzaSyDqtHYc1Jnfscx5X9d4vSFhgRLj8O7GpCA",
    authDomain: "studio-2143552053-ccbad.firebaseapp.com",
    projectId: "studio-2143552053-ccbad",
    storageBucket: "studio-2143552053-ccbad.firebasestorage.app",
    messagingSenderId: "347067189449",
    appId: "1:347067189449:web:a72f6e514751c827266518"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: payload.data?.orderId || 'default',
        requireInteraction: false,
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification click received.');
    event.notification.close();

    const data = event.notification.data;
    let targetUrl = '/';

    // Contextual navigation based on notification data
    if (data?.orderId) {
        if (data.type?.includes('rider')) {
            targetUrl = '/rider/deliveries';
        } else if (data.type?.includes('vendor')) {
            targetUrl = '/vendor/orders';
        } else {
            targetUrl = '/customer/orders';
        }
    }

    // Open the app or focus existing window
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If a window is already open, focus it and navigate
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    if (targetUrl !== '/' && 'navigate' in client) {
                        client.navigate(targetUrl);
                    }
                    return client.focus();
                }
            }
            // Otherwise, open a new window
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
