'use server';

import { initializeServerFirebase } from '@/firebase/server-sdk';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
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
    operatingHours: {
        opening: string;
        closing: string;
    };
    logoUrl?: string;
    bannerUrl?: string;
    location?: {
        lat: number;
        lng: number;
    };
}

export async function updateVendorSettings(vendorId: string, data: Partial<VendorSettings>) {
    try {
        // Use Admin SDK to bypass security rules for server-side updates
        const { adminDb } = await import('@/firebase/admin');
        const vendorRef = adminDb.collection('vendors').doc(vendorId);

        // Build update object with only provided fields
        const updateData: any = {
            updatedAt: new Date(), // Use JS Date for Admin SDK
        };

        if (data.businessName !== undefined) updateData.businessName = data.businessName;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.email !== undefined) updateData.email = data.email;
        if (data.address !== undefined) updateData.address = data.address;
        if (data.city !== undefined) updateData.city = data.city;
        if (data.state !== undefined) updateData.state = data.state;
        if (data.deliveryRadius !== undefined) updateData.deliveryRadius = data.deliveryRadius;
        if (data.operatingHours !== undefined) updateData.operatingHours = data.operatingHours;
        if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
        if (data.bannerUrl !== undefined) updateData.bannerUrl = data.bannerUrl;
        if (data.location !== undefined) updateData.location = data.location;

        await vendorRef.update(updateData);

        revalidatePath('/vendor/settings');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating vendor settings:', error);
        return { success: false, error: error.message };
    }
}

export async function getVendorSettings(vendorId: string) {
    try {
        const { firestore } = initializeServerFirebase();
        const vendorRef = doc(firestore, 'vendors', vendorId);
        const vendorDoc = await getDoc(vendorRef);

        if (!vendorDoc.exists()) {
            return { success: false, error: 'Vendor not found' };
        }

        return { success: true, data: vendorDoc.data() as VendorSettings };
    } catch (error: any) {
        console.error('Error getting vendor settings:', error);
        return { success: false, error: error.message };
    }
}
