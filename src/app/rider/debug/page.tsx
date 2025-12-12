'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RiderDebugPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${msg}`]);

    const runTests = async () => {
        if (!user || !firestore) {
            addLog('❌ User or Firestore not ready');
            return;
        }

        setLogs([]);
        addLog(`👤 User: ${user.email} (${user.uid})`);

        // Test 1: Simple Read (Processing Orders)
        try {
            addLog('🔄 Test 1: Fetching "Processing" orders...');
            const q1 = query(
                collection(firestore, 'orders'),
                where('status', '==', 'Processing')
            );
            const snap1 = await getDocs(q1);
            addLog(`✅ Test 1 Success: Found ${snap1.size} orders`);
        } catch (e: any) {
            addLog(`❌ Test 1 Failed: ${e.message}`);
        }

        // Test 2: Read Assigned Orders
        try {
            addLog('🔄 Test 2: Fetching assigned orders...');
            const q2 = query(
                collection(firestore, 'orders'),
                where('riderId', '==', user.uid)
            );
            const snap2 = await getDocs(q2);
            addLog(`✅ Test 2 Success: Found ${snap2.size} orders`);
        } catch (e: any) {
            addLog(`❌ Test 2 Failed: ${e.message}`);
        }

        // Test 3: Read All Orders (Should Fail)
        try {
            addLog('🔄 Test 3: Fetching ALL orders (Control Test)...');
            const q3 = query(collection(firestore, 'orders'));
            await getDocs(q3);
            addLog('⚠️ Test 3 Unexpectedly Succeeded (Rules might be too open)');
        } catch (e: any) {
            addLog(`✅ Test 3 Failed as expected: ${e.message}`);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Rider Permissions Debugger</h1>
            <Button onClick={runTests} disabled={isUserLoading}>Run Diagnostics</Button>

            <Card>
                <CardHeader><CardTitle>Logs</CardTitle></CardHeader>
                <CardContent className="bg-slate-950 text-green-400 font-mono text-sm p-4 rounded-md h-96 overflow-auto">
                    {logs.length === 0 ? 'Ready to run tests...' : logs.map((log, i) => (
                        <div key={i}>{log}</div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
