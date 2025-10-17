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

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-border/20 transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10">
       <CardHeader className="relative p-0">
        <div className="relative aspect-square w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            data-ai-hint={product.imageHint}
          />
        </div>
         <Button
          size="icon"
          className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-background/50 text-foreground backdrop-blur-sm transition-all hover:bg-primary hover:text-primary-foreground group-hover:opacity-100 md:opacity-0"
          onClick={handleAddToCart}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add to cart</span>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between p-4">
         <div>
          <p className="text-xs text-muted-foreground">{product.category}</p>
          <h3 className="text-base font-semibold">{product.name}</h3>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <p className="text-lg font-bold">
          ${product.price.toFixed(2)}
        </p>
      </CardFooter>
    </Card>
  );
}
