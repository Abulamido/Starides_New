
'use server';

import { getPersonalizedRecommendations } from '@/ai/flows/personalized-product-recommendations';
import { type Product } from '@/lib/data';
import { revalidatePath } from 'next/cache';
import { collection, addDoc, serverTimestamp, getDocs, doc, updateDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

export async function fetchRecommendations(
  customerId: string,
  browsingHistory: string[],
  purchaseHistory: string[]
): Promise<{
  recommendedProducts: Product[];
  error?: string;
}> {
  try {
    const { firestore } = initializeFirebase();
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
}) {
  try {
    const { firestore } = initializeFirebase();

    const orderData = {
      customerId: order.customerId,
      vendorId: order.vendorId,
      products: order.items,
      totalAmount: order.total,
      status: 'Processing',
      orderDate: serverTimestamp(),
      deliveryAddress: '123 Main St, Lagos, Nigeria', // Mock address - should be from user profile
    };
    
    const ordersCollection = collection(firestore, 'orders');
    await addDoc(ordersCollection, orderData);

    revalidatePath('/customer/orders');
    revalidatePath('/admin/orders');
    revalidatePath('/vendor/orders');
    revalidatePath('/rider/deliveries');

  } catch (error) {
    console.error("Error placing order:", error);
    // This could be re-thrown to be caught by the client
    throw new Error("Could not place order.");
  }
}

export async function updateOrderStatus(orderId: string, status: 'Processing' | 'Shipped' | 'Delivered' | 'Canceled', riderId?: string) {
    try {
        const { firestore } = initializeFirebase();
        const orderRef = doc(firestore, 'orders', orderId);

        const updateData: { status: string; riderId?: string } = { status };
        if (riderId) {
            updateData.riderId = riderId;
        }

        await updateDoc(orderRef, updateData);

        revalidatePath('/customer/orders');
        revalidatePath('/admin/orders');
        revalidatePath('/vendor/orders');
        revalidatePath('/rider/deliveries');

    } catch (error) {
        console.error("Error updating order status:", error);
        throw new Error("Could not update order status.");
    }
}
