'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function FixVendorPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadVendors = async () => {
        if (!firestore) return;

        setLoading(true);
        try {
            const vendorsSnapshot = await getDocs(collection(firestore, 'vendors'));
            const vendorsData = vendorsSnapshot.docs.map(doc => ({
                docId: doc.id,
                ...doc.data()
            }));
            setVendors(vendorsData);
            console.log('Vendors:', vendorsData);
        } catch (error) {
            console.error('Error loading vendors:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVendors();
    }, [firestore]);

    const fixVendor = async (vendorDocId: string, vendorData: any) => {
        if (!firestore) return;

        setLoading(true);
        try {
            const updates: any = {};

            // Ensure all required fields exist
            if (!vendorData.image) {
                updates.image = `https://api.dicebear.com/7.x/shapes/svg?seed=${vendorData.name || 'Vendor'}`;
            }
            if (!vendorData.imageHint) {
                updates.imageHint = `${vendorData.category || 'Store'} vendor`;
            }
            if (vendorData.rating === undefined) {
                updates.rating = 4.5;
            }
            if (vendorData.reviewCount === undefined) {
                updates.reviewCount = 0;
            }
            if (!vendorData.userId && vendorDocId) {
                updates.userId = vendorDocId;
            }
            if (!vendorData.id) {
                updates.id = vendorDocId;
            }

            if (Object.keys(updates).length > 0) {
                await updateDoc(doc(firestore, 'vendors', vendorDocId), updates);
                toast({
                    title: 'Vendor fixed',
                    description: `Updated ${Object.keys(updates).length} fields`,
                });
                loadVendors();
            } else {
                toast({
                    title: 'No updates needed',
                    description: 'Vendor already has all required fields',
                });
            }
        } catch (error: any) {
            console.error('Error fixing vendor:', error);
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
            <h1 className="text-3xl font-bold">Fix Vendor Data</h1>

            <Button onClick={loadVendors} disabled={loading}>
                {loading ? 'Loading...' : 'Refresh'}
            </Button>

            <div className="space-y-4">
                {vendors.map((vendor) => (
                    <Card key={vendor.docId}>
                        <CardHeader>
                            <CardTitle>{vendor.name || 'Unnamed Vendor'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <strong>Document ID:</strong> {vendor.docId}
                                </div>
                                <div>
                                    <strong>ID field:</strong> {vendor.id || '❌ Missing'}
                                </div>
                                <div>
                                    <strong>User ID:</strong> {vendor.userId || '❌ Missing'}
                                </div>
                                <div>
                                    <strong>Category:</strong> {vendor.category || '❌ Missing'}
                                </div>
                                <div>
                                    <strong>Image:</strong> {vendor.image ? '✅ Yes' : '❌ Missing'}
                                </div>
                                <div>
                                    <strong>Rating:</strong> {vendor.rating !== undefined ? vendor.rating : '❌ Missing'}
                                </div>
                                <div>
                                    <strong>Review Count:</strong> {vendor.reviewCount !== undefined ? vendor.reviewCount : '❌ Missing'}
                                </div>
                                <div>
                                    <strong>Description:</strong> {vendor.description ? '✅ Yes' : '❌ Missing'}
                                </div>
                            </div>

                            <div className="bg-muted p-3 rounded text-xs overflow-auto">
                                <pre>{JSON.stringify(vendor, null, 2)}</pre>
                            </div>

                            <Button
                                onClick={() => fixVendor(vendor.docId, vendor)}
                                disabled={loading}
                            >
                                Fix This Vendor
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {vendors.length === 0 && !loading && (
                <p className="text-center text-muted-foreground">No vendors found</p>
            )}
        </div>
    );
}
