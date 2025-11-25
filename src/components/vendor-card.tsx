
'use client';

import Image from 'next/image';
import type { Vendor } from '@/lib/data';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter
} from '@/components/ui/card';
import { Star, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';


type VendorCardProps = {
  vendor: Vendor;
};

export function VendorCard({ vendor }: VendorCardProps) {
  if (!vendor || !vendor.image) {
    return (
      <Card className="group flex h-full flex-col overflow-hidden">
        <CardHeader className="relative p-0">
          <Skeleton className="aspect-video w-full" />
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-between p-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between p-4 pt-0">
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-10" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-12" />
          </div>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-all duration-300 border-none shadow-lg hover:shadow-2xl hover:-translate-y-1 bg-card/50 backdrop-blur-sm">
      <CardHeader className="relative p-0">
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
          <Image
            src={vendor.image}
            alt={vendor.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            data-ai-hint={vendor.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between p-5">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">{vendor.name}</h3>
            <div className="flex items-center gap-1 bg-background/80 backdrop-blur px-2 py-1 rounded-full shadow-sm">
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-bold">{vendor.rating}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{vendor.description}</p>
        </div>
        <div className="mt-5 pt-4 border-t flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-medium">{vendor.category}</span>
          </div>
          <span className="text-xs text-muted-foreground font-medium px-2 py-1 bg-secondary rounded-md">
            {vendor.reviewCount} reviews
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
