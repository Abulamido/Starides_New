'use server';

import { adminDb, adminMessaging } from '@/firebase/admin';

interface SendPushParams {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, string>;
}

export async function sendPushNotification(params: SendPushParams) {
    const { userId, title, body, data = {} } = params;

    try {
        // 1. Get user's FCM token from Firestore
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return { success: false, error: 'User not found' };
        }

        const fcmToken = userDoc.data()?.fcmToken;
        if (!fcmToken) {
            return { success: false, error: 'User has no FCM token' };
        }

        // 2. Send message via FCM
        const message = {
            notification: {
                title,
                body,
            },
            data,
            token: fcmToken,
            android: {
                notification: {
                    sound: 'default',
                    priority: 'high' as const,
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1,
                    },
                },
            },
        };

        const response = await adminMessaging.send(message);
        console.log('[Push] Sent successfully:', response);

        return { success: true, messageId: response };
    } catch (error: any) {
        console.error('[Push] Error sending notification:', error);
        return { success: false, error: error.message };
    }
}
