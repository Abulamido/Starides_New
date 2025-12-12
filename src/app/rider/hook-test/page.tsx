'use client';

import { useEffect } from 'react';

export default function HookDiagnosticPage() {
    useEffect(() => {
        console.log('=== HOOK DIAGNOSTIC ===');
        console.log('If you see this, the page rendered successfully');
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Hook Diagnostic Page</h1>
            <p>This page is used to test hook execution.</p>
            <p>Check the browser console for diagnostic information.</p>
        </div>
    );
}
