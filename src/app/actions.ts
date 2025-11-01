
'use server';

import { getPersonalizedRecommendations } from '@/ai/flows/personalized-product-recommendations';
import { mockProducts, type Product } from '@/lib/data';
import { revalidatePath } from 'next/cache';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

// In a real app, customerId, browsingHistory, and purchaseHistory would come from your database
const MOCK_CUSTOMER_DATA = {
  customerId: 'customer-123',
  browsingHistory: ['prod-004', 'prod-002'],
  purchaseHistory: ['prod-007'],
};

// All available product IDs for the AI to choose from, excluding ones the user has interacted with
const availableProductIds = mockProducts
  .map((p) => p.id)
  .filter(
    (id) =>
      !MOCK_CUSTOMER_DATA.browsingHistory.includes(id) &&
      !MOCK_CUSTOMER_DATA.purchaseHistory.includes(id)
  );

export async function fetchRecommendations(): Promise<{
  recommendedProducts: Product[];
  error?: string;
}> {
  try {
    const aiResult = await getPersonalizedRecommendations(MOCK_CUSTOMER_DATA);

    // In a real scenario, the AI would return IDs. For this demo, since the AI
    // might hallucinate IDs, we'll pick some random available products to simulate the output.
    const randomRecommendations: Product[] = [];
    const recommendationsToTake = Math.min(4, availableProductIds.length);
    while (randomRecommendations.length < recommendationsToTake) {
        const randomIndex = Math.floor(Math.random() * availableProductIds.length);
        const randomProductId = availableProductIds[randomIndex];
        if (!randomRecommendations.some(p => p.id === randomProductId)) {
            const product = mockProducts.find(p => p.id === randomProductId);
            if (product) {
                randomRecommendations.push(product);
            }
        }
    }

    // This is how you would use the actual AI output:
    // const recommendedProducts = mockProducts.filter((product) =>
    //   aiResult.productRecommendations.includes(product.id)
    // );
    
    // We use the simulated output for robustness in this demo.
    return { recommendedProducts: randomRecommendations };

  } catch (error) {
    console.error('Error fetching AI recommendations:', error);
    return {
      recommendedProducts: [],
      error: 'Failed to fetch recommendations.',
    };
  }
}


// In a real app, you'd get the actual logged-in user ID.
const MOCK_USER_ID = 'customer-123';
const MOCK_VENDOR_ID = 'vendor-007'; // Assuming the order is for ABU EATS

export async function placeOrder(order: {
  items: { id: string; quantity: number; name: string, price: number }[];
  total: number;
}) {
  try {
    const { firestore } = initializeFirebase();

    // This is a simplified version. A real app would handle items from multiple vendors.
    const orderData = {
      customerId: MOCK_USER_ID,
      vendorId: MOCK_VENDOR_ID,
      products: order.items,
      totalAmount: order.total,
      status: 'Processing',
      orderDate: serverTimestamp(),
      deliveryAddress: '123 Main St, Lagos, Nigeria', // Mock address
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
