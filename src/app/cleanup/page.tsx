'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function CleanupPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [vendors, setVendors] = useState<any[]>([]);

    const loadVendors = async () => {
        if (!firestore) return;

        setLoading(true);
        try {
            const vendorsSnapshot = await getDocs(collection(firestore, 'vendors'));
            const vendorsData = vendorsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setVendors(vendorsData);
        } catch (error) {
            console.error('Error loading vendors:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteVendor = async (vendorId: string, vendorName: string) => {
        if (!firestore) return;

        if (!confirm(`Delete vendor "${vendorName}"?`)) return;

        try {
            await deleteDoc(doc(firestore, 'vendors', vendorId));
            toast({
                title: 'Vendor deleted',
                description: `${vendorName} has been removed.`,
            });
            loadVendors();
        } catch (error: any) {
            console.error('Error deleting vendor:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            });
        }
    };

    const deleteMockVendors = async () => {
        if (!firestore) return;

        if (!confirm('Delete all vendors EXCEPT "Chicken House"?')) return;

        setLoading(true);
        try {
            const vendorsSnapshot = await getDocs(collection(firestore, 'vendors'));
            let deletedCount = 0;

            for (const vendorDoc of vendorsSnapshot.docs) {
                const vendorData = vendorDoc.data();
                // Keep only Chicken House
                if (vendorData.name !== 'Chicken House') {
                    await deleteDoc(doc(firestore, 'vendors', vendorDoc.id));
                    deletedCount++;
                }
            }

            toast({
                title: 'Cleanup complete',
                description: `Deleted ${deletedCount} mock vendors. Only "Chicken House" remains.`,
            });
            loadVendors();
        } catch (error: any) {
            console.error('Error cleaning up:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">Database Cleanup</h1>

            <div className="flex gap-4">
                <Button onClick={loadVendors} disabled={loading}>
                    {loading ? 'Loading...' : 'Load Vendors'}
                </Button>
                <Button onClick={deleteMockVendors} disabled={loading} variant="destructive">
                    Delete All Mock Vendors
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Vendors ({vendors.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {vendors.map((vendor) => (
                            <div key={vendor.id} className="flex items-center justify-between p-4 border rounded">
                                <div>
                                    <h3 className="font-semibold">{vendor.name}</h3>
                                    <p className="text-sm text-muted-foreground">{vendor.category}</p>
                                    <p className="text-xs text-muted-foreground">ID: {vendor.id}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Has image: {vendor.image ? 'Yes' : 'No'}
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteVendor(vendor.id, vendor.name)}
                                >
                                    Delete
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
