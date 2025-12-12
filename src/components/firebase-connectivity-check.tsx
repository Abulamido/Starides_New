'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConnectivityStatus {
    firebaseAuth: 'checking' | 'success' | 'error';
    firebaseFirestore: 'checking' | 'success' | 'error';
    network: 'checking' | 'success' | 'error';
    errorDetails?: string;
}

export function FirebaseConnectivityCheck() {
    const [status, setStatus] = useState<ConnectivityStatus>({
        firebaseAuth: 'checking',
        firebaseFirestore: 'checking',
        network: 'checking',
    });
    const [showDiagnostics, setShowDiagnostics] = useState(false);

    useEffect(() => {
        if (showDiagnostics) {
            checkConnectivity();
        }
    }, [showDiagnostics]);

    const checkConnectivity = async () => {
        setStatus({
            firebaseAuth: 'checking',
            firebaseFirestore: 'checking',
            network: 'checking',
        });

        // Check network connectivity
        try {
            const networkResponse = await fetch('https://www.google.com/favicon.ico', {
                mode: 'no-cors',
                cache: 'no-cache',
            });
            setStatus(prev => ({ ...prev, network: 'success' }));
        } catch (error) {
            setStatus(prev => ({
                ...prev,
                network: 'error',
                errorDetails: 'No internet connection detected'
            }));
        }

        // Check Firebase Auth endpoint
        try {
            const authResponse = await fetch(
                'https://identitytoolkit.googleapis.com/v1/projects',
                { mode: 'no-cors', cache: 'no-cache' }
            );
            setStatus(prev => ({ ...prev, firebaseAuth: 'success' }));
        } catch (error: any) {
            setStatus(prev => ({
                ...prev,
                firebaseAuth: 'error',
                errorDetails: 'Cannot reach Firebase Auth servers. Check firewall/proxy settings.'
            }));
        }

        // Check Firebase Firestore endpoint
        try {
            const firestoreResponse = await fetch(
                'https://firestore.googleapis.com/',
                { mode: 'no-cors', cache: 'no-cache' }
            );
            setStatus(prev => ({ ...prev, firebaseFirestore: 'success' }));
        } catch (error) {
            setStatus(prev => ({
                ...prev,
                firebaseFirestore: 'error',
                errorDetails: 'Cannot reach Firebase Firestore servers.'
            }));
        }
    };

    const getStatusIcon = (state: 'checking' | 'success' | 'error') => {
        switch (state) {
            case 'checking':
                return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
            case 'success':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'error':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
        }
    };

    const hasErrors = status.firebaseAuth === 'error' ||
        status.firebaseFirestore === 'error' ||
        status.network === 'error';

    // Conditional rendering without early return
    return (
        <>
            {!showDiagnostics ? (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDiagnostics(true)}
                    className="mt-4"
                >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Run Connection Diagnostics
                </Button>
            ) : (
                <div className="mt-4 space-y-4">
                    <Alert variant={hasErrors ? 'destructive' : 'default'}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Firebase Connectivity Diagnostics</AlertTitle>
                        <AlertDescription>
                            <div className="mt-2 space-y-2">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(status.network)}
                                    <span className="text-sm">Network Connectivity</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(status.firebaseAuth)}
                                    <span className="text-sm">Firebase Authentication</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(status.firebaseFirestore)}
                                    <span className="text-sm">Firebase Firestore</span>
                                </div>
                            </div>

                            {hasErrors && status.errorDetails && (
                                <div className="mt-4 p-3 bg-destructive/10 rounded-md">
                                    <p className="text-sm font-medium">Error Details:</p>
                                    <p className="text-sm mt-1">{status.errorDetails}</p>
                                </div>
                            )}

                            {hasErrors && (
                                <div className="mt-4 p-3 bg-yellow-500/10 rounded-md border border-yellow-500/20">
                                    <p className="text-sm font-medium mb-2">Troubleshooting Steps:</p>
                                    <ul className="text-sm space-y-1 list-disc list-inside">
                                        <li>Disable browser extensions (especially ad blockers)</li>
                                        <li>Try incognito/private browsing mode</li>
                                        <li>Clear browser cache and cookies</li>
                                        <li>Check if you're behind a firewall/proxy</li>
                                        <li>Verify internet connection is stable</li>
                                    </ul>
                                </div>
                            )}

                            <div className="mt-4 flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={checkConnectivity}
                                >
                                    Recheck
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowDiagnostics(false)}
                                >
                                    Close
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                </div>
            )}
        </>
    );
}
