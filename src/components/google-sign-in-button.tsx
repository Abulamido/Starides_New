'use client';

import { Button } from '@/components/ui/button';
import { useAuth, useFirestore } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

type UserRole = 'customer' | 'vendor' | 'rider' | 'admin';

interface GoogleSignInButtonProps {
    role: UserRole;
    mode?: 'signup' | 'login';
}

export function GoogleSignInButton({ role, mode = 'signup' }: GoogleSignInButtonProps) {
    const auth = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        if (!auth || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Firebase not initialized',
                description: 'Please try again later.',
            });
            return;
        }

        setIsLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user document exists
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                // Existing user - verify role matches
                const userData = userDoc.data();
                if (userData.role !== role) {
                    toast({
                        variant: 'destructive',
                        title: 'Account Exists',
                        description: `This account is registered as a ${userData.role}. Please use the correct sign-in page.`,
                    });
                    await auth.signOut();
                    setIsLoading(false);
                    return;
                }

                // Update last login
                await setDoc(userDocRef, {
                    updatedAt: serverTimestamp(),
                }, { merge: true });

                toast({
                    title: 'Welcome back!',
                    description: `Logged in successfully.`,
                });
            } else {
                // New user - create documents
                const nameParts = user.displayName?.split(' ') || ['', ''];
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                // Create user document
                await setDoc(userDocRef, {
                    id: user.uid,
                    email: user.email,
                    firstName,
                    lastName,
                    role,
                    photoURL: user.photoURL,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });

                // Create role-specific document
                const roleDocRef = doc(firestore, `${role}s`, user.uid);
                await setDoc(roleDocRef, {
                    userId: user.uid,
                    id: user.uid,
                    createdAt: serverTimestamp(),
                });

                toast({
                    title: 'Account Created!',
                    description: `Welcome to Starides.`,
                });
            }

            // Redirect to appropriate dashboard
            const dashboardRoutes: Record<UserRole, string> = {
                customer: '/customer',
                vendor: '/vendor',
                rider: '/rider',
                admin: '/admin',
            };

            router.push(dashboardRoutes[role]);

        } catch (error: any) {
            console.error('Google Sign-In Error:', error);

            let errorMessage = 'Could not sign in with Google.';

            if (error.code === 'auth/popup-blocked') {
                errorMessage = 'Popup was blocked. Please allow popups for this site.';
            } else if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Sign-in was cancelled.';
            } else if (error.code === 'auth/account-exists-with-different-credential') {
                errorMessage = 'An account already exists with this email using a different sign-in method.';
            }

            toast({
                variant: 'destructive',
                title: 'Sign-in Failed',
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                </svg>
            )}
            Continue with Google
        </Button>
    );
}
