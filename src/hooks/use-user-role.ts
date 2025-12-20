'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';

export type UserRole = 'customer' | 'vendor' | 'rider' | 'admin' | null;

const ROLE_CACHE_KEY = 'starides_user_role';

/**
 * Synchronously get the cached user role from localStorage.
 * Used for fast PWA cold-start redirects before Firestore confirms.
 */
export function getCachedRole(): UserRole {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(ROLE_CACHE_KEY) as UserRole;
    }
    return null;
}

export function useUserRole() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [role, setRole] = useState<UserRole>(() => {
        // Initialize from localStorage if available (fast path for PWA)
        if (typeof window !== 'undefined') {
            return localStorage.getItem(ROLE_CACHE_KEY) as UserRole;
        }
        return null;
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // console.log('[Auth] State check:', { isUserLoading, hasUser: !!user });

        // Wait for user loading to complete
        if (isUserLoading) {
            setIsLoading(true);
            return;
        }

        // No user - set role to null, stop loading, and clear cache
        if (!user || !firestore) {
            setRole(null);
            setIsLoading(false);
            if (typeof window !== 'undefined') {
                localStorage.removeItem(ROLE_CACHE_KEY);
            }
            return;
        }

        // User exists - fetch their role
        const fetchRole = async () => {
            try {
                const userDoc = await getDoc(doc(firestore, 'users', user.uid));
                if (userDoc.exists()) {
                    const fetchedRole = userDoc.data().role as UserRole;
                    setRole(fetchedRole);
                    // Update cache for next time
                    if (typeof window !== 'undefined' && fetchedRole) {
                        localStorage.setItem(ROLE_CACHE_KEY, fetchedRole);
                    }
                } else {
                    setRole(null);
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem(ROLE_CACHE_KEY);
                    }
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
                // Don't clear role on error if we have a cached one
                if (!role) setRole(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRole();
    }, [user, firestore, isUserLoading]);

    return { role, isLoading };
}
