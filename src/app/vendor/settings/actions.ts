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
}

export async function updateVendorSettings(vendorId: string, data: VendorSettings) {
    try {
        const { firestore } = initializeServerFirebase();
        const vendorRef = doc(firestore, 'vendors', vendorId);

        await updateDoc(vendorRef, {
            businessName: data.businessName,
            description: data.description,
            phone: data.phone,
            email: data.email,
            address: data.address,
            city: data.city,
            state: data.state,
            deliveryRadius: data.deliveryRadius,
            operatingHours: data.operatingHours,
            updatedAt: serverTimestamp(),
        });

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
