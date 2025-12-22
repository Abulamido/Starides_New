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
    licenseUrl?: string;
}

export async function updateRiderAvailability(userId: string, availability: RiderAvailability) {
    try {
        const { adminDb } = await import('@/firebase/admin');
        const userRef = adminDb.collection('users').doc(userId);

        await userRef.update({
            'riderProfile.isOnline': availability.isOnline,
            'riderProfile.acceptingOrders': availability.acceptingOrders,
            'riderProfile.lastOnline': new Date(),
            updatedAt: new Date(),
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
    photoURL?: string;
    notificationPreferences?: {
        orderUpdates?: boolean;
        promotions?: boolean;
        soundEnabled?: boolean;
    };
}) {
    try {
        const { adminDb } = await import('@/firebase/admin');
        const userRef = adminDb.collection('users').doc(userId);

        await userRef.update({
            ...data,
            updatedAt: new Date(),
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
        const { adminDb } = await import('@/firebase/admin');
        const userRef = adminDb.collection('users').doc(userId);

        await userRef.update({
            'riderProfile.vehicle': vehicle,
            updatedAt: new Date(),
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
        const { adminDb } = await import('@/firebase/admin');
        const userRef = adminDb.collection('users').doc(userId);

        await userRef.update({
            'riderProfile.documents': documents,
            updatedAt: new Date(),
        });

        revalidatePath('/rider/profile');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating rider documents:', error);
        return { success: false, error: error.message };
    }
}
