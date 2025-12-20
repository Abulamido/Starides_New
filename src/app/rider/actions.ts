'use server';

import { revalidatePath } from 'next/cache';
import { sendPushNotification } from '@/app/actions/push';

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
        const orderRef = adminDb.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();
        const orderData = orderDoc.data();

        await orderRef.update({
            riderId: riderId,
            status: 'Ready for Pickup', // Set status when rider accepts
            updatedAt: new Date()
        });

        // Send push to customer
        if (orderData?.customerId) {
            await sendPushNotification({
                userId: orderData.customerId,
                title: 'Rider Assigned! 🏍️',
                body: `A rider has accepted your order #${orderId.slice(0, 8)} and is heading to the restaurant.`,
                data: { orderId, type: 'rider_assigned' }
            });
        }

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
        const orderRef = adminDb.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();
        const orderData = orderDoc.data();

        const updateData: any = {
            status: status,
            updatedAt: new Date()
        };

        if (status === 'Delivered') {
            updateData.deliveredAt = new Date();
        }

        await orderRef.update(updateData);

        // Send push to customer
        if (orderData?.customerId) {
            let title = 'Order Update';
            let body = `Your order #${orderId.slice(0, 8)} is now ${status}.`;

            if (status === 'In Transit') {
                title = 'On the way! 🚀';
                body = `Your order #${orderId.slice(0, 8)} is in transit and will arrive soon.`;
            } else if (status === 'Delivered') {
                title = 'Order Delivered! ✅';
                body = `Your order #${orderId.slice(0, 8)} has been delivered. Enjoy!`;
            }

            await sendPushNotification({
                userId: orderData.customerId,
                title,
                body,
                data: { orderId, type: `order_${status.toLowerCase().replace(/ /g, '_')}` }
            });
        }

        revalidatePath('/rider/deliveries');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating order status:', error);
        return { success: false, error: error.message };
    }
}
