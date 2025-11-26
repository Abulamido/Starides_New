'use server';

import { initializeServerFirebase } from '@/firebase/server-sdk';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export interface RiderAvailability {
    isOnline: boolean;
    acceptingOrders: boolean;
}

export interface VehicleInfo {
    type: string;
    licensePlate: string;
}

export interface RiderDocuments {
    licenseNumber: string;
    // Document URLs would be stored after upload to Firebase Storage
}

export async function updateRiderAvailability(userId: string, availability: RiderAvailability) {
    try {
        const { firestore } = initializeServerFirebase();
        const userRef = doc(firestore, 'users', userId);

        await updateDoc(userRef, {
            'riderProfile.isOnline': availability.isOnline,
            'riderProfile.acceptingOrders': availability.acceptingOrders,
            'riderProfile.lastOnline': serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        revalidatePath('/rider/profile');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating rider availability:', error);
        return { success: false, error: error.message };
    }
}

export async function updateRiderProfile(userId: string, data: {
    displayName?: string;
    phone?: string;
    address?: string;
}) {
    try {
        const { firestore } = initializeServerFirebase();
        const userRef = doc(firestore, 'users', userId);

        await updateDoc(userRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });

        revalidatePath('/rider/profile');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating rider profile:', error);
        return { success: false, error: error.message };
    }
}

export async function updateRiderVehicle(userId: string, vehicle: VehicleInfo) {
    try {
        const { firestore } = initializeServerFirebase();
        const userRef = doc(firestore, 'users', userId);

        await updateDoc(userRef, {
            'riderProfile.vehicle': vehicle,
            updatedAt: serverTimestamp(),
        });

        revalidatePath('/rider/profile');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating rider vehicle:', error);
        return { success: false, error: error.message };
    }
}

export async function updateRiderDocuments(userId: string, documents: RiderDocuments) {
    try {
        const { firestore } = initializeServerFirebase();
        const userRef = doc(firestore, 'users', userId);

        await updateDoc(userRef, {
            'riderProfile.documents': documents,
            updatedAt: serverTimestamp(),
        });

        revalidatePath('/rider/profile');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating rider documents:', error);
        return { success: false, error: error.message };
    }
}
