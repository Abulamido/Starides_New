'use server';

import { initializeServerFirebase } from '@/firebase/server-sdk';
import { doc, setDoc, collection, addDoc, deleteDoc, updateDoc, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export interface CustomerProfile {
    displayName?: string;
    phone?: string;
    email?: string;
    photoURL?: string;
    notificationPreferences?: {
        orderUpdates?: boolean;
        promotions?: boolean;
        soundEnabled?: boolean;
    };
}

export interface DeliveryAddress {
    id?: string;
    label: string;
    address: string;
    city: string;
    state: string;
    isDefault: boolean;
    lat?: number;
    lng?: number;
}

export async function updateCustomerProfile(userId: string, data: CustomerProfile) {
    try {
        const { adminDb } = await import('@/firebase/admin');
        const userRef = adminDb.collection('users').doc(userId);

        const updateData: any = {
            updatedAt: new Date(),
        };

        if (data.displayName !== undefined) updateData.displayName = data.displayName;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.email !== undefined) updateData.email = data.email;
        if (data.photoURL !== undefined) updateData.photoURL = data.photoURL;
        if (data.notificationPreferences !== undefined) updateData.notificationPreferences = data.notificationPreferences;

        await userRef.set(updateData, { merge: true });

        revalidatePath('/customer/settings');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating customer profile:', error);
        return { success: false, error: error.message };
    }
}

export async function addDeliveryAddress(userId: string, address: Omit<DeliveryAddress, 'id'>) {
    try {
        const { adminDb } = await import('@/firebase/admin');

        // If this is set as default, unset all other defaults first
        if (address.isDefault) {
            const addressesRef = adminDb.collection('users').doc(userId).collection('addresses');
            const addressesSnapshot = await addressesRef.get();
            const batch = adminDb.batch();

            addressesSnapshot.docs.forEach(doc => {
                batch.update(doc.ref, { isDefault: false });
            });

            if (!addressesSnapshot.empty) {
                await batch.commit();
            }
        }

        await adminDb.collection('users').doc(userId).collection('addresses').add({
            ...address,
            createdAt: new Date(),
        });

        revalidatePath('/customer/settings');
        return { success: true };
    } catch (error: any) {
        console.error('Error adding delivery address:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteDeliveryAddress(userId: string, addressId: string) {
    try {
        const { adminDb } = await import('@/firebase/admin');
        await adminDb.collection('users').doc(userId).collection('addresses').doc(addressId).delete();

        revalidatePath('/customer/settings');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting delivery address:', error);
        return { success: false, error: error.message };
    }
}

export async function setDefaultAddress(userId: string, addressId: string) {
    try {
        const { adminDb } = await import('@/firebase/admin');
        const addressesRef = adminDb.collection('users').doc(userId).collection('addresses');
        const addressesSnapshot = await addressesRef.get();
        const batch = adminDb.batch();

        addressesSnapshot.docs.forEach(doc => {
            batch.update(doc.ref, { isDefault: doc.id === addressId });
        });

        if (!addressesSnapshot.empty) {
            await batch.commit();
        }

        revalidatePath('/customer/settings');
        return { success: true };
    } catch (error: any) {
        console.error('Error setting default address:', error);
        return { success: false, error: error.message };
    }
}
