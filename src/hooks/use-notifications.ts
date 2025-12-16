'use client';

import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from './use-toast';

export function useNotifications() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [fcmToken, setFcmToken] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined' || !user || !firestore) return;

        // Check if notifications are supported
        if (!('Notification' in window)) {
            return;
        }

        setPermission(Notification.permission);

        // Request permission if not granted
        if (Notification.permission === 'default') {
            requestPermission();
        } else if (Notification.permission === 'granted') {
            setupMessaging();
        }
    }, [user, firestore]);

    const requestPermission = async () => {
        try {
            const permission = await Notification.requestPermission();
            setPermission(permission);

            if (permission === 'granted') {
                setupMessaging();
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    };

    const setupMessaging = async () => {
        try {
            const messaging = getMessaging();

            // Register service worker first
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            await navigator.serviceWorker.ready;

            // Get FCM token
            const token = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                serviceWorkerRegistration: registration,
            });

            if (token) {
                setFcmToken(token);

                // Save token to user document
                if (user && firestore) {
                    try {
                        const userRef = doc(firestore, 'users', user.uid);
                        await setDoc(userRef, {
                            fcmToken: token,
                            fcmTokenUpdatedAt: new Date(),
                        }, { merge: true });
                    } catch (err) {
                        // Ignore error
                    }
                }

                console.log('FCM Token:', token);
            }

            // Handle foreground messages
            onMessage(messaging, (payload) => {

                // Show toast notification
                toast({
                    title: payload.notification?.title || 'New Notification',
                    description: payload.notification?.body || '',
                });
            });
        } catch (error) {
            console.error('Error setting up messaging:', error);
        }
    };

    return {
        permission,
        fcmToken,
        requestPermission,
    };
}
