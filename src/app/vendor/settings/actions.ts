'use server';

import { adminDb } from '@/firebase/admin';
import { revalidatePath } from 'next/cache';

export interface VendorSettings {
    businessName: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    deliveryRadius: number;
    location?: {
        lat: number;
        lng: number;
    };
    operatingHours: {
        opening: string;
        closing: string;
    };
}

export async function updateVendorSettings(vendorId: string, data: VendorSettings) {
    try {
        const vendorRef = adminDb.collection('vendors').doc(vendorId);

        const updateData: any = {
            businessName: data.businessName,
            description: data.description,
            phone: data.phone,
            email: data.email,
            address: data.address,
            city: data.city,
            state: data.state,
            deliveryRadius: data.deliveryRadius,
            operatingHours: data.operatingHours,
            updatedAt: new Date(), // Admin SDK uses native Date or Timestamp
        };

        // Add location if provided
        if (data.location) {
            updateData.location = data.location;
        }

        await vendorRef.set(updateData, { merge: true });

        revalidatePath('/vendor/settings');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating vendor settings:', error);
        return { success: false, error: error.message };
    }
}

export async function getVendorSettings(vendorId: string) {
    try {
        const vendorRef = adminDb.collection('vendors').doc(vendorId);
        const vendorDoc = await vendorRef.get();

        if (!vendorDoc.exists) {
            return { success: false, error: 'Vendor not found' };
        }

        return { success: true, data: vendorDoc.data() as VendorSettings };
    } catch (error: any) {
        console.error('Error getting vendor settings:', error);
        return { success: false, error: error.message };
    }
}
