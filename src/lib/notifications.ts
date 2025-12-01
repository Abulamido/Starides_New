import { doc, getDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

interface NotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}

/**
 * Send a push notification to a user via their FCM token
 * Note: This should ideally be called from a server-side function (Firebase Cloud Functions)
 * For now, this is a client-side implementation for demonstration
 */
export async function sendNotificationToUser(
    userId: string,
    notification: NotificationPayload
) {
    try {
        const firestore = getFirestore();
        const userRef = doc(firestore, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            console.error('User not found:', userId);
            return;
        }

        const userData = userDoc.data();
        const fcmToken = userData?.fcmToken;

        if (!fcmToken) {
            console.log('User has no FCM token:', userId);
            return;
        }

        // In production, this should be done via Firebase Cloud Functions
        // For now, we'll just log it
        console.log('Would send notification to:', userId, notification);

        // TODO: Implement server-side FCM sending via Cloud Functions
        // Example Cloud Function code:
        /*
        const admin = require('firebase-admin');
        
        await admin.messaging().send({
          token: fcmToken,
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: notification.data,
        });
        */
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

/**
 * Notification templates for different order events
 */
export const NotificationTemplates = {
    orderPlaced: (orderId: string) => ({
        title: 'New Order! 🎉',
        body: `You have a new order #${orderId.slice(0, 8)}`,
        data: { orderId, type: 'order_placed' },
    }),

    orderAccepted: (orderId: string) => ({
        title: 'Order Accepted! 🍳',
        body: `Your order #${orderId.slice(0, 8)} is being prepared`,
        data: { orderId, type: 'order_accepted' },
    }),

    orderReady: (orderId: string) => ({
        title: 'Order Ready! 🛍️',
        body: `Your order #${orderId.slice(0, 8)} is ready for pickup`,
        data: { orderId, type: 'order_ready' },
    }),

    riderAssigned: (orderId: string, riderName: string) => ({
        title: 'Rider Assigned! 🏍️',
        body: `${riderName} is on the way to pick up your order`,
        data: { orderId, type: 'rider_assigned' },
    }),

    orderInTransit: (orderId: string, eta: number) => ({
        title: 'In Transit! 🚀',
        body: `Your order will arrive in ~${eta} minutes`,
        data: { orderId, type: 'order_in_transit' },
    }),

    orderDelivered: (orderId: string) => ({
        title: 'Order Delivered! ✅',
        body: `Your order #${orderId.slice(0, 8)} has been delivered`,
        data: { orderId, type: 'order_delivered' },
    }),
};
