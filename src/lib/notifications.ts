import { collection, addDoc, serverTimestamp, getFirestore } from 'firebase/firestore';

interface CreateNotificationParams {
    userId: string;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    data?: Record<string, any>;
}

/**
 * Create a notification in Firestore for a user
 * This writes directly to the users/{userId}/notifications subcollection
 */
export async function createNotification(params: CreateNotificationParams) {
    try {
        const { userId, title, message, type = 'info', data = {} } = params;
        const firestore = getFirestore();

        const notificationData = {
            title,
            message,
            type,
            read: false,
            createdAt: serverTimestamp(),
            data,
        };

        await addDoc(
            collection(firestore, `users/${userId}/notifications`),
            notificationData
        );

        console.log('Notification created for user:', userId, title);
        return { success: true };
    } catch (error) {
        console.error('Error creating notification:', error);
        return { success: false, error };
    }
}

/**
 * Notification templates for different order events
 */
export const NotificationTemplates = {
    orderPlaced: (orderId: string) => ({
        title: 'New Order! 🎉',
        message: `You have a new order #${orderId.slice(0, 8)}`,
        type: 'success' as const,
        data: { orderId, eventType: 'order_placed' },
    }),

    orderAccepted: (orderId: string) => ({
        title: 'Order Accepted! 🍳',
        message: `Your order #${orderId.slice(0, 8)} is being prepared`,
        type: 'success' as const,
        data: { orderId, eventType: 'order_accepted' },
    }),

    orderRejected: (orderId: string, reason?: string) => ({
        title: 'Order Rejected',
        message: reason || `Your order #${orderId.slice(0, 8)} was rejected`,
        type: 'error' as const,
        data: { orderId, eventType: 'order_rejected' },
    }),

    orderReady: (orderId: string) => ({
        title: 'Order Ready! 🛍️',
        message: `Your order #${orderId.slice(0, 8)} is ready for pickup`,
        type: 'success' as const,
        data: { orderId, eventType: 'order_ready' },
    }),

    riderAssigned: (orderId: string, riderName: string) => ({
        title: 'Rider Assigned! 🏍️',
        message: `${riderName} is on the way to pick up your order`,
        type: 'info' as const,
        data: { orderId, eventType: 'rider_assigned' },
    }),

    orderInTransit: (orderId: string) => ({
        title: 'In Transit! 🚀',
        message: `Your order #${orderId.slice(0, 8)} is on the way`,
        type: 'info' as const,
        data: { orderId, eventType: 'order_in_transit' },
    }),

    orderDelivered: (orderId: string) => ({
        title: 'Order Delivered! ✅',
        message: `Your order #${orderId.slice(0, 8)} has been delivered`,
        type: 'success' as const,
        data: { orderId, eventType: 'order_delivered' },
    }),

    vendorApproved: () => ({
        title: 'Vendor Approved! 🎉',
        message: 'Your vendor account has been approved. You can now start selling!',
        type: 'success' as const,
        data: { eventType: 'vendor_approved' },
    }),

    vendorRejected: (reason?: string) => ({
        title: 'Vendor Application Rejected',
        message: reason || 'Your vendor application was not approved.',
        type: 'error' as const,
        data: { eventType: 'vendor_rejected' },
    }),

    riderApproved: () => ({
        title: 'Rider Approved! 🎉',
        message: 'Your rider account has been approved. You can now start delivering!',
        type: 'success' as const,
        data: { eventType: 'rider_approved' },
    }),

    riderRejected: (reason?: string) => ({
        title: 'Rider Application Rejected',
        message: reason || 'Your rider application was not approved.',
        type: 'error' as const,
        data: { eventType: 'rider_rejected' },
    }),
};

/**
 * Helper function to send order notifications to relevant users
 */
export async function notifyOrderEvent(
    eventType: keyof typeof NotificationTemplates,
    orderId: string,
    userIds: { customerId?: string; vendorId?: string; riderId?: string },
    extraData?: any
) {
    const promises: Promise<any>[] = [];

    // Notify customer
    if (userIds.customerId) {
        const template = NotificationTemplates[eventType] as any;
        const notification = template(orderId, extraData);
        promises.push(
            createNotification({
                userId: userIds.customerId,
                ...notification,
            })
        );
    }

    // Notify vendor
    if (userIds.vendorId && eventType === 'orderPlaced') {
        promises.push(
            createNotification({
                userId: userIds.vendorId,
                ...NotificationTemplates.orderPlaced(orderId),
            })
        );
    }

    // Notify rider
    if (userIds.riderId && (eventType === 'orderReady' || eventType === 'riderAssigned')) {
        const template = NotificationTemplates[eventType] as any;
        const notification = template(orderId, extraData);
        promises.push(
            createNotification({
                userId: userIds.riderId,
                ...notification,
            })
        );
    }

    await Promise.all(promises);
}
