
'use server';

import { getPersonalizedRecommendations } from '@/ai/flows/personalized-product-recommendations';
import { type Product } from '@/lib/data';
import { revalidatePath } from 'next/cache';
import { collection, addDoc, serverTimestamp, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { initializeServerFirebase } from '@/firebase/server-sdk';

export async function fetchRecommendations(
  customerId: string,
  browsingHistory: string[],
  purchaseHistory: string[]
): Promise<{
  recommendedProducts: Product[];
  error?: string;
}> {
  try {
    const { firestore } = initializeServerFirebase();
    const productsSnapshot = await getDocs(collection(firestore, 'products'));
    const allProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

    const aiResult = await getPersonalizedRecommendations({
      customerId,
      browsingHistory,
      purchaseHistory,
    });

    const recommendedProducts = allProducts.filter((product) =>
      aiResult.productRecommendations.includes(product.id)
    );

    return { recommendedProducts };

  } catch (error) {
    console.error('Error fetching AI recommendations:', error);
    return {
      recommendedProducts: [],
      error: 'Failed to fetch recommendations.',
    };
  }
}


export async function placeOrder(order: {
  items: { id: string; quantity: number; name: string, price: number }[];
  total: number;
  customerId: string;
  vendorId: string;
  deliveryAddress: string;
}) {
  try {
    const { firestore } = initializeServerFirebase();

    // SERVER-SIDE VALIDATION: Verify all products belong to the specified vendor
    const productIds = order.items.map(item => item.id);

    if (productIds.length === 0) {
      throw new Error('Order must contain at least one product');
    }

    // Fetch all products in the order
    const productsSnapshot = await getDocs(
      query(
        collection(firestore, 'products'),
        where('__name__', 'in', productIds.slice(0, 10)) // Firestore 'in' limit is 10
      )
    );

    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Array<{ id: string; vendorId: string; price: number; name: string }>;

    // Validate each product
    for (const orderItem of order.items) {
      const product = products.find(p => p.id === orderItem.id);

      if (!product) {
        throw new Error(`Product ${orderItem.id} not found`);
      }

      // Ensure product belongs to the specified vendor
      if (product.vendorId !== order.vendorId) {
        throw new Error(`Product ${orderItem.id} does not belong to vendor ${order.vendorId}`);
      }

      // Validate price hasn't been tampered with
      if (Math.abs(product.price - orderItem.price) > 0.01) {
        throw new Error(`Price mismatch for product ${orderItem.id}`);
      }
    }

    // Recalculate total on server to prevent tampering
    const serverTotal = order.items.reduce(
      (sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + (product!.price * item.quantity);
      },
      0
    );

    if (Math.abs(serverTotal - order.total) > 0.01) {
      throw new Error('Order total mismatch');
    }

    const orderData = {
      customerId: order.customerId,
      vendorId: order.vendorId,
      products: order.items,
      totalAmount: serverTotal, // Use server-calculated total
      status: 'Processing' as const,
      orderDate: serverTimestamp(),
      deliveryAddress: order.deliveryAddress,
    };

    const ordersCollection = collection(firestore, 'orders');
    await addDoc(ordersCollection, orderData);

    revalidatePath('/customer/orders');
    revalidatePath('/admin/orders');
    revalidatePath('/vendor/orders');
    revalidatePath('/rider/deliveries');

  } catch (error) {
    console.error("Error placing order:", error);
    throw new Error(error instanceof Error ? error.message : "Could not place order.");
  }
}

export async function updateOrderStatus(orderId: string, status: 'New Order' | 'Pending Acceptance' | 'Preparing' | 'Ready for Pickup' | 'In Transit' | 'Delivered' | 'Canceled', riderId?: string) {
  try {
    const { firestore } = initializeServerFirebase();
    const orderRef = doc(firestore, 'orders', orderId);

    // Fetch order to get user IDs for notifications
    const orderSnap = await getDocs(query(collection(firestore, 'orders'), where('__name__', '==', orderId)));
    const orderDoc = orderSnap.docs[0];

    if (!orderDoc) {
      throw new Error('Order not found');
    }

    const order = orderDoc.data();

    const updateData: { status: string; riderId?: string } = { status };
    if (riderId) {
      updateData.riderId = riderId;
    }

    await updateDoc(orderRef, updateData);

    // CRITICAL FIX: Send notifications based on status changes
    const { createNotification, NotificationTemplates } = await import('@/lib/notifications');
    const { sendPushNotification } = await import('@/app/actions/push');

    // Notify customer about order status changes
    if (order.customerId) {
      if (status === 'Preparing') {
        await createNotification({
          userId: order.customerId,
          ...NotificationTemplates.orderAccepted(orderId)
        });
        await sendPushNotification({
          userId: order.customerId,
          title: "Order Accepted! 🍳",
          body: `Your order #${orderId.slice(0, 8)} is being prepared.`,
          data: { orderId, type: 'order_accepted' }
        });
      }

      if (status === 'Ready for Pickup') {
        await createNotification({
          userId: order.customerId,
          ...NotificationTemplates.orderReady(orderId)
        });
        await sendPushNotification({
          userId: order.customerId,
          title: "Order Ready! 🛍️",
          body: `Your order #${orderId.slice(0, 8)} is ready for pickup.`,
          data: { orderId, type: 'order_ready' }
        });
      }

      if (status === 'In Transit') {
        await createNotification({
          userId: order.customerId,
          ...NotificationTemplates.orderInTransit(orderId)
        });
        await sendPushNotification({
          userId: order.customerId,
          title: "In Transit! 🚀",
          body: `Your order #${orderId.slice(0, 8)} is on the way.`,
          data: { orderId, type: 'order_in_transit' }
        });
      }

      if (status === 'Delivered') {
        await createNotification({
          userId: order.customerId,
          ...NotificationTemplates.orderDelivered(orderId)
        });
        await sendPushNotification({
          userId: order.customerId,
          title: "Order Delivered! ✅",
          body: `Your order #${orderId.slice(0, 8)} has been delivered. Enjoy!`,
          data: { orderId, type: 'order_delivered' }
        });
      }

      if (status === 'Canceled') {
        await createNotification({
          userId: order.customerId,
          title: 'Order Canceled',
          message: `Your order #${orderId.slice(0, 8)} has been canceled`,
          type: 'error',
          data: { orderId, eventType: 'order_canceled' }
        });
        await sendPushNotification({
          userId: order.customerId,
          title: "Order Canceled",
          body: `Your order #${orderId.slice(0, 8)} has been canceled.`,
          data: { orderId, type: 'order_canceled' }
        });
      }
    }

    // Notify rider if assigned and order is ready
    if (status === 'Ready for Pickup' && (riderId || order.riderId)) {
      const rId = riderId || order.riderId;
      await sendPushNotification({
        userId: rId,
        title: "Order Ready for Pickup! 🏍️",
        body: `Order #${orderId.slice(0, 8)} is ready for pickup.`,
        data: { orderId, type: 'order_ready' }
      });
    }

    // Notify vendor if canceled
    if (status === 'Canceled' && order.vendorId) {
      await createNotification({
        userId: order.vendorId,
        title: 'Order Canceled',
        message: `Order #${orderId.slice(0, 8)} has been canceled`,
        type: 'warning',
        data: { orderId, eventType: 'order_canceled' }
      });
      await sendPushNotification({
        userId: order.vendorId,
        title: "Order Canceled",
        body: `Order #${orderId.slice(0, 8)} has been canceled.`,
        data: { orderId, type: 'order_canceled' }
      });
    }

    revalidatePath('/customer/orders');
    revalidatePath('/admin/orders');
    revalidatePath('/vendor/orders');
    revalidatePath('/rider/deliveries');

    return { success: true };

  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: "Could not update order status." };
  }
}
