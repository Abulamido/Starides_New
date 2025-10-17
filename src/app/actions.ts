'use server';

import { getPersonalizedRecommendations } from '@/ai/flows/personalized-product-recommendations';
import { mockProducts, type Product } from '@/lib/data';

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
