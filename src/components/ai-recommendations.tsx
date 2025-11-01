
'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import type { Product } from '@/lib/data';
import { fetchRecommendations } from '@/app/actions';
import { ProductCard } from './product-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';

type AiRecommendationsProps = {
    customerId: string;
    browsingHistory: string[];
    purchaseHistory: string[];
}

export function AiRecommendations({ customerId, browsingHistory, purchaseHistory }: AiRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRecommendations() {
      try {
        setLoading(true);
        const result = await fetchRecommendations(customerId, browsingHistory, purchaseHistory);
        if (result.error) {
          setError(result.error);
        } else {
          setRecommendations(result.recommendedProducts);
        }
      } catch (e) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }
    loadRecommendations();
  }, [customerId, browsingHistory, purchaseHistory]);

  if (loading) {
    return (
      <div>
        <h2 className="mb-4 flex items-center text-2xl font-semibold tracking-tight">
          <Star className="mr-2 h-6 w-6 text-yellow-400" />
          Just For You
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (recommendations.length === 0) {
    return (
         <div>
            <h2 className="mb-4 flex items-center text-2xl font-semibold tracking-tight">
                <Star className="mr-2 h-6 w-6 text-yellow-400" />
                Just For You
            </h2>
            <p className="text-muted-foreground">No recommendations available at this time.</p>
        </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 flex items-center text-2xl font-semibold tracking-tight">
        <Star className="mr-2 h-6 w-6 text-yellow-400" />
        Just For You
      </h2>
      <Carousel
        opts={{
          align: 'start',
          loop: recommendations.length > 1,
        }}
        className="w-full"
      >
        <CarouselContent>
          {recommendations.map((product) => (
            <CarouselItem
              key={product.id}
              className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <div className="p-1">
                <ProductCard product={product} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="ml-12" />
        <CarouselNext className="mr-12" />
      </Carousel>
    </div>
  );
}
