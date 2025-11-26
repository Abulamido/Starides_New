'use server';

import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp, collection, addDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export interface CustomerProfile {
    displayName: string;
    phone: string;
    email: string;
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
        const { firestore } = initializeFirebase();
        const userRef = doc(firestore, 'users', userId);

        await updateDoc(userRef, {
            displayName: data.displayName,
            phone: data.phone,
            email: data.email,
            updatedAt: serverTimestamp(),
        });

        revalidatePath('/customer/settings');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating customer profile:', error);
        return { success: false, error: error.message };
    }
}

export async function addDeliveryAddress(userId: string, address: Omit<DeliveryAddress, 'id'>) {
    try {
        const { firestore } = initializeFirebase();

        // If this is set as default, unset all other defaults first
        if (address.isDefault) {
            const addressesRef = collection(firestore, `users/${userId}/addresses`);
            const addressesSnapshot = await getDocs(addressesRef);

            const updatePromises = addressesSnapshot.docs.map(doc =>
                updateDoc(doc.ref, { isDefault: false })
            );
            await Promise.all(updatePromises);
        }

        const addressesRef = collection(firestore, `users/${userId}/addresses`);
        await addDoc(addressesRef, {
            ...address,
            createdAt: serverTimestamp(),
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
        const { firestore } = initializeFirebase();
        const addressRef = doc(firestore, `users/${userId}/addresses`, addressId);

        await deleteDoc(addressRef);

        revalidatePath('/customer/settings');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting delivery address:', error);
        return { success: false, error: error.message };
    }
}

export async function setDefaultAddress(userId: string, addressId: string) {
    try {
        const { firestore } = initializeFirebase();

        // Unset all defaults
        const addressesRef = collection(firestore, `users/${userId}/addresses`);
        const addressesSnapshot = await getDocs(addressesRef);

        const updatePromises = addressesSnapshot.docs.map(doc =>
            updateDoc(doc.ref, { isDefault: doc.id === addressId })
        );
        await Promise.all(updatePromises);

        revalidatePath('/customer/settings');
        return { success: true };
    } catch (error: any) {
        console.error('Error setting default address:', error);
        return { success: false, error: error.message };
    }
}
