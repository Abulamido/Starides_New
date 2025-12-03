'use server';

import { adminDb } from '@/firebase/admin';
import { revalidatePath } from 'next/cache';

export interface VendorSettings {
    businessName?: string;
    description?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    deliveryRadius?: number;
    logoUrl?: string;
    bannerUrl?: string;
    location?: {
        lat: number;
        lng: number;
    };
    operatingHours?: {
        opening: string;
        closing: string;
    };
}

export async function updateVendorSettings(vendorId: string, data: VendorSettings) {
    try {
        const vendorRef = adminDb.collection('vendors').doc(vendorId);

        const updateData: any = {
            updatedAt: new Date(),
        };

        // Only update fields that are provided
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
