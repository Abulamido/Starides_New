
'use client';

import Image from 'next/image';
import type { Product } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  if (!product) {
    return (
      <Card className="group flex h-full flex-col overflow-hidden">
        <CardHeader className="relative p-0">
          <Skeleton className="aspect-square w-full" />
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-between p-4">
          <Skeleton className="h-5 w-3/4" />
        </CardContent>
        <CardFooter className="flex items-center justify-between p-4 pt-0">
          <Skeleton className="h-6 w-1/4" />
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="group flex flex-row md:flex-col h-28 md:h-full overflow-hidden transition-all hover:shadow-[8px_8px_16px_#c1c8d0,-8px_-8px_16px_#ffffff] dark:hover:shadow-[8px_8px_16px_#11131a,-8px_-8px_16px_#232734]">
      <CardHeader className="relative p-0 w-28 md:w-full shrink-0">
        <div className="relative h-full w-full md:aspect-square overflow-hidden rounded-l-lg md:rounded-l-none md:rounded-t-lg">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 120px, (max-width: 1024px) 33vw, 25vw"
            data-ai-hint={product.imageHint}
          />
        </div>
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-1 right-1 md:top-3 md:right-3 z-10 h-6 w-6 md:h-8 md:w-8 rounded-full bg-background/50 text-foreground backdrop-blur-sm transition-all hover:bg-primary hover:text-primary-foreground opacity-100 md:opacity-0 group-hover:opacity-100"
          onClick={handleAddToCart}
        >
          <Plus className="h-3 w-3 md:h-4 md:w-4" />
          <span className="sr-only">Add to cart</span>
        </Button>
      </CardHeader>
      <div className="flex flex-col flex-1 justify-between">
        <CardContent className="flex-1 p-3 md:p-4">
          <div>
            <p className="text-[10px] md:text-xs text-muted-foreground mb-1">{product.category}</p>
            <h3 className="text-sm md:text-base font-semibold line-clamp-2 leading-tight">{product.name}</h3>
          </div>
        </CardContent>
        <CardFooter className="p-3 md:p-4 pt-0">
          <p className="text-sm md:text-lg font-bold text-primary">
            ₦{product.price.toFixed(2)}
          </p>
        </CardFooter>
      </div>
    </Card>
  );
}
