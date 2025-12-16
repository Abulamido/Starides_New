'use server';

import { revalidatePath } from 'next/cache';

/**
 * Updates the rider's online status in the 'riders' collection.
 */
export async function updateRiderStatus(riderId: string, status: 'Online' | 'Offline') {
    try {
        const { adminDb } = await import('@/firebase/admin');
        await adminDb.collection('riders').doc(riderId).update({
            onlineStatus: status,
            updatedAt: new Date()
        });

        revalidatePath('/rider');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating rider status:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Assigns an order to a rider.
 */
export async function acceptOrder(orderId: string, riderId: string) {
    try {
        const { adminDb } = await import('@/firebase/admin');
        await adminDb.collection('orders').doc(orderId).update({
            riderId: riderId,
            status: 'Ready for Pickup', // Set status when rider accepts
            updatedAt: new Date()
        });

        revalidatePath('/rider/deliveries');
        return { success: true };
    } catch (error: any) {
        console.error('Error accepting order:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Updates order status (e.g., In Transit, Delivered).
 */
export async function updateOrderStatus(orderId: string, status: string) {
    try {
        const { adminDb } = await import('@/firebase/admin');
        const updateData: any = {
            status: status,
            updatedAt: new Date()
        };

        if (status === 'Delivered') {
            updateData.deliveredAt = new Date();
        }

        await adminDb.collection('orders').doc(orderId).update(updateData);

        revalidatePath('/rider/deliveries');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating order status:', error);
        return { success: false, error: error.message };
    }
}
