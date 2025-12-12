'use server';

import { initializeServerFirebase } from '@/firebase/server-sdk';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export interface PlatformSettings {
    platformFee: string;
    deliveryFee: string;
    minOrderAmount: string;
    maxDeliveryRadius: string;
    autoApproveVendors: boolean;
    autoApproveRiders: boolean;
    enableNotifications: boolean;
}

export async function getPlatformSettings() {
    try {
        const { firestore } = initializeServerFirebase();
        const settingsRef = doc(firestore, 'settings', 'platform');
        const settingsDoc = await getDoc(settingsRef);

        if (!settingsDoc.exists()) {
            // Return defaults if not found
            return {
                success: true,
                data: {
                    platformFee: '10',
                    deliveryFee: '500',
                    minOrderAmount: '1000',
                    maxDeliveryRadius: '15',
                    autoApproveVendors: false,
                    autoApproveRiders: false,
                    enableNotifications: true,
                } as PlatformSettings
            };
        }

        return { success: true, data: settingsDoc.data() as PlatformSettings };
    } catch (error: any) {
        console.error('Error getting platform settings:', error);
        return { success: false, error: error.message };
    }
}

export async function updatePlatformSettings(settings: PlatformSettings) {
    try {
        const { firestore } = initializeServerFirebase();
        const settingsRef = doc(firestore, 'settings', 'platform');

        await setDoc(settingsRef, {
            ...settings,
            updatedAt: serverTimestamp(),
        }, { merge: true });

        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating platform settings:', error);
        return { success: false, error: error.message };
    }
}
