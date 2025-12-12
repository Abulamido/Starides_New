'use client';

import { useUser, useFirestore } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FirestoreDiagnosticPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [testResult, setTestResult] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const testFirestoreAccess = async () => {
        if (!firestore) {
            setTestResult('❌ Firestore not initialized');
            return;
        }

        setLoading(true);
        try {
            const ordersRef = collection(firestore, 'orders');
            const snapshot = await getDocs(ordersRef);
            setTestResult(`✅ SUCCESS! Read ${snapshot.size} orders from Firestore`);
        } catch (error: any) {
            setTestResult(`❌ ERROR: ${error.message}\n\nCode: ${error.code}\n\nFull error: ${JSON.stringify(error, null, 2)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Firestore Diagnostic</h1>

            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Authentication Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p><strong>Loading:</strong> {isUserLoading ? 'Yes' : 'No'}</p>
                            <p><strong>User:</strong> {user ? '✅ Authenticated' : '❌ Not authenticated'}</p>
                            {user && (
                                <>
                                    <p><strong>UID:</strong> {user.uid}</p>
                                    <p><strong>Email:</strong> {user.email}</p>
                                    <p><strong>Display Name:</strong> {user.displayName || 'N/A'}</p>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Firestore Access Test</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            onClick={testFirestoreAccess}
                            disabled={loading || !user}
                        >
                            {loading ? 'Testing...' : 'Test Firestore Read'}
                        </Button>

                        {testResult && (
                            <div className="p-4 bg-muted rounded-md">
                                <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ol className="list-decimal list-inside space-y-2">
                            <li>Make sure you're signed in</li>
                            <li>Click "Test Firestore Read" button</li>
                            <li>Check if the test succeeds or fails</li>
                            <li>If it fails, copy the error message</li>
                        </ol>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
