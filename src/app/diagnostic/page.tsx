'use client';

import { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DiagnosticPage() {
    const firestore = useFirestore();
    const [vendors, setVendors] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const checkDatabase = async () => {
        if (!firestore) return;

        setLoading(true);
        try {
            // Check vendors
            const vendorsSnapshot = await getDocs(collection(firestore, 'vendors'));
            const vendorsData = vendorsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setVendors(vendorsData);

            // Check products
            const productsSnapshot = await getDocs(collection(firestore, 'products'));
            const productsData = productsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(productsData);

            console.log('Vendors:', vendorsData);
            console.log('Products:', productsData);
        } catch (error) {
            console.error('Error checking database:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkDatabase();
    }, [firestore]);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">Database Diagnostic</h1>

            <Button onClick={checkDatabase} disabled={loading}>
                {loading ? 'Checking...' : 'Refresh Data'}
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Vendors ({vendors.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="bg-muted p-4 rounded overflow-auto max-h-96">
                        {JSON.stringify(vendors, null, 2)}
                    </pre>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Products ({products.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="bg-muted p-4 rounded overflow-auto max-h-96">
                        {JSON.stringify(products, null, 2)}
                    </pre>
                </CardContent>
            </Card>
        </div>
    );
}
