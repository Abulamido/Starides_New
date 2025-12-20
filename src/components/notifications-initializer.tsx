'use client';

import { useEffect, useRef } from 'react';
import { useNotifications } from '@/hooks/use-notifications';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

export function NotificationsInitializer() {
    const { user } = useUser();
    const { permission, requestPermission } = useNotifications();
    const { toast } = useToast();
    const initialized = useRef(false);

    useEffect(() => {
        if (user && !initialized.current) {
            console.log('[Notifications] System initialized for user:', user.email);
            initialized.current = true;

            // Subtle indicator that notifications are ready
            if (permission === 'granted') {
                toast({
                    title: "Notifications Active",
                    description: "You're all set to receive real-time updates.",
                    duration: 3000,
                });
            }
        }

        // Only request permission for authenticated users
        if (user && permission === 'default') {
            const timer = setTimeout(() => {
                requestPermission();
            }, 5000); // 5s delay

            return () => clearTimeout(timer);
        }
    }, [user, permission, requestPermission, toast]);

    return null;
}
