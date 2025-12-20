'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';

export type UserRole = 'customer' | 'vendor' | 'rider' | 'admin' | null;

export function useUserRole() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [role, setRole] = useState<UserRole>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log('[Auth] State check:', { isUserLoading, hasUser: !!user });

        // Wait for user loading to complete
        if (isUserLoading) {
            setIsLoading(true);
            return;
        }

        // No user - set role to null and stop loading
        if (!user || !firestore) {
            setRole(null);
            setIsLoading(false);
            return;
        }

        // User exists - fetch their role
        const fetchRole = async () => {
            try {
                const userDoc = await getDoc(doc(firestore, 'users', user.uid));
                if (userDoc.exists()) {
                    setRole(userDoc.data().role as UserRole);
                } else {
                    setRole(null);
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
                setRole(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRole();
    }, [user, firestore, isUserLoading]);

    return { role, isLoading };
}
