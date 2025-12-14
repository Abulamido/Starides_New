'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { Loader2, Star, TrendingUp, Heart, ShoppingCart } from 'lucide-react';
import type { Order, Product } from '@/lib/data';
import Image from 'next/image';
import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';

export default function CustomerRecommendationsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Query customer's orders
  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'orders'),
      where('customerId', '==', user.uid),
      orderBy('orderDate', 'desc'),
      limit(10)
    );
  }, [firestore, user]);

  // Query all products
  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'products'),
      where('available', '==', true),
      limit(20)
    );
  }, [firestore]);

  const { data: orders, isLoading: isOrdersLoading } = useCollection<Order>(ordersQuery);
  const { data: allProducts, isLoading: isProductsLoading } = useCollection<Product>(productsQuery);

  if (isUserLoading || isOrdersLoading || isProductsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Analyze order history to get product IDs the user has ordered
  const orderedProductIds = new Set<string>();

  orders?.forEach(order => {
    if (order.products && Array.isArray(order.products)) {
      order.products.forEach(item => {
        orderedProductIds.add(item.id);
      });
    }
  });

  // Get categories from ordered products
  const orderedCategories = new Set<string>();
  allProducts?.forEach(product => {
    if (orderedProductIds.has(product.id)) {
      orderedCategories.add(product.category);
    }
  });

  // Recommendations based on order history (same categories)
  const categoryBasedRecommendations = allProducts?.filter(product =>
    orderedCategories.has(product.category) && !orderedProductIds.has(product.id)
  ).slice(0, 6) || [];

  // Popular products (not yet ordered)
  const popularProducts = allProducts?.filter(product =>
    !orderedProductIds.has(product.id)
  ).slice(0, 6) || [];

  // Recently ordered (for quick reorder)
  const recentlyOrdered = allProducts?.filter(product =>
    orderedProductIds.has(product.id)
  ).slice(0, 4) || [];

  const handleAddToCart = async (product: Product) => {
    setAddingToCart(product.id);

    // Simulate network delay for better UX feel
    await new Promise(resolve => setTimeout(resolve, 500));

    addToCart(product);

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });

    setAddingToCart(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">For You</h1>
        <p className="text-muted-foreground">Personalized recommendations based on your preferences</p>
      </div>

      {/* Based on Your Orders */}
      {categoryBasedRecommendations.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Based on Your Orders</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categoryBasedRecommendations.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-muted">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No image
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                    {product.category}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">₦{product.price.toLocaleString()}</span>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                      disabled={addingToCart === product.id}
                    >
                      {addingToCart === product.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Popular Right Now */}
      {popularProducts.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Popular Right Now</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {popularProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-muted">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No image
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                    {product.category}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">₦{product.price.toLocaleString()}</span>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                      disabled={addingToCart === product.id}
                    >
                      {addingToCart === product.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Quick Reorder */}
      {recentlyOrdered.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Quick Reorder</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {recentlyOrdered.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-32 bg-muted">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      No image
                    </div>
                  )}
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-base line-clamp-1">{product.name}</CardTitle>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold">₦{product.price.toLocaleString()}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddToCart(product)}
                      disabled={addingToCart === product.id}
                    >
                      {addingToCart === product.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        'Reorder'
                      )}
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      )}

      {categoryBasedRecommendations.length === 0 && popularProducts.length === 0 && recentlyOrdered.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No recommendations yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Start ordering to get personalized product recommendations based on your preferences!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
