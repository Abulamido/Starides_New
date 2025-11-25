'use client';

import { useEffect } from 'react';
import { useNotifications } from '@/hooks/use-notifications';
import { useUser } from '@/firebase';

export function NotificationsInitializer() {
    const { user } = useUser();
    const { permission, requestPermission } = useNotifications();

    useEffect(() => {
        // Only request permission for authenticated users
        if (user && permission === 'default') {
            // Wait a bit before requesting to avoid overwhelming the user
            const timer = setTimeout(() => {
                requestPermission();
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [user, permission, requestPermission]);

    // This component doesn't render anything
    return null;
}
