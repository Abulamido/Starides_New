
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
      deliveryAddress: '123 Main St, Lagos, Nigeria', // TODO: Get from user profile
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
