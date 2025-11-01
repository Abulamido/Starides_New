'use client';

import Image from 'next/image';
import type { Vendor } from '@/lib/data';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Star, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';


type VendorCardProps = {
  vendor: Vendor;
};

export function VendorCard({ vendor }: VendorCardProps) {
  const getCategoryIcon = () => {
    // In a real app, you might have a more robust way to map categories to icons
    return <MapPin className="h-4 w-4" />;
  };

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-all neumorphic-flat hover:shadow-[8px_8px_16px_#c1c8d0,-8px_-8px_16px_#ffffff] dark:hover:shadow-[8px_8px_16px_#11131a,-8px_-8px_16px_#232734]">
       <CardHeader className="relative p-0">
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
          <Image
            src={vendor.image}
            alt={vendor.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            data-ai-hint={vendor.imageHint}
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between p-4">
         <div>
          <h3 className="text-lg font-bold">{vendor.name}</h3>
          <p className="text-sm text-muted-foreground">{vendor.description}</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold">{vendor.rating}</span>
                <span className="text-sm text-muted-foreground">({vendor.reviewCount})</span>
            </div>
             <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{vendor.category}</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
