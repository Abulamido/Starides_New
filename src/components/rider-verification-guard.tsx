'use client';

import { useEffect, useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface RiderVerificationGuardProps {
    children: React.ReactNode;
}

export function RiderVerificationGuard({ children }: RiderVerificationGuardProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const [status, setStatus] = useState<'Verified' | 'Unverified' | 'Rejected' | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!user || !firestore) return;

        const riderRef = doc(firestore, 'riders', user.uid);
        const unsubscribe = onSnapshot(riderRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setStatus(data.verificationStatus || 'Unverified');
            } else {
                // Handle case where rider doc doesn't exist yet (shouldn't happen if signed up correctly)
                setStatus('Unverified');
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching rider status:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, firestore]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (status === 'Verified') {
        return <>{children}</>;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                        {status === 'Rejected' ? (
                            <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
                        ) : (
                            <ShieldAlert className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                        )}
                    </div>
                    <CardTitle className="text-xl">
                        {status === 'Rejected' ? 'Account Rejected' : 'Verification Pending'}
                    </CardTitle>
                    <CardDescription>
                        {status === 'Rejected'
                            ? 'Your rider account application has been rejected. Please contact support for more information.'
                            : 'Your account is currently under review. You will be able to access the dashboard once an administrator approves your application.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="text-sm text-muted-foreground text-center">
                        Status: <span className="font-medium text-foreground">{status}</span>
                    </div>
                    <Button variant="outline" onClick={() => router.push('/')}>
                        Return to Home
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
