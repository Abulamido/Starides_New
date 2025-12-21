'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRole, UserRole } from '@/hooks/use-user-role';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
    allowedRole: UserRole;
    children: React.ReactNode;
}

export function RoleGuard({ allowedRole, children }: RoleGuardProps) {
    const { user, isUserLoading } = useUser();
    const { role, isLoading: isRoleLoading } = useUserRole();
    const router = useRouter();

    useEffect(() => {
        // Wait for user auth to complete
        if (isUserLoading) return;

        // Not logged in - redirect to login
        if (!user) {
            router.replace('/auth/login');
            return;
        }

        // Wait for role to load
        if (isRoleLoading) return;

        // If we have a role and it's the wrong one, redirect to correct dashboard
        if (role && role !== allowedRole) {
            router.replace(`/${role}`);
        }
        // Note: If role is null but user exists, we don't redirect - 
        // this can happen during signup flow or if Firestore is slow
    }, [user, role, isUserLoading, isRoleLoading, allowedRole, router]);

    // Show loading while checking authentication
    if (isUserLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Not authenticated - show loading while redirecting
    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Show loading while fetching role
    if (isRoleLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Wrong role - show loading while redirecting
    if (role && role !== allowedRole) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Correct role OR no role yet (allow content to show) - show content
    return <>{children}</>;
}


