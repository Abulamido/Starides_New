'use client';

import { use } from 'react';
import { ProductCard } from '@/components/product-card';
import Image from 'next/image';
import { Star, MapPin } from 'lucide-react';
import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import type { Vendor, Product } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

function VendorPageSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="relative h-48 w-full rounded-lg md:h-64" />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      <div>
        <Skeleton className="h-8 w-40 mb-6" />
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
    </div>
  );
}

export default function VendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const firestore = useFirestore();

  const vendorRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'vendors', id);
  }, [firestore, id]);
  const { data: vendor, isLoading: isLoadingVendor } = useDoc<Vendor>(vendorRef);

  const productsQuery = useMemoFirebase(() => {
    if (!firestore || !vendor?.userId) return null;
    return query(collection(firestore, 'products'), where('vendorId', '==', vendor.userId));
  }, [firestore, vendor?.userId]);
  const { data: menu, isLoading: isLoadingMenu } = useCollection<Product>(productsQuery);

  const isLoading = isLoadingVendor || isLoadingMenu;

  if (isLoading) {
    return <VendorPageSkeleton />;
  }

  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h2 className="text-2xl font-bold mb-2">Vendor Not Found</h2>
        <p className="text-muted-foreground">The vendor you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative h-48 w-full overflow-hidden rounded-lg md:h-64">
        <Image
          src={vendor.image}
          alt={vendor.name}
          fill
          className="object-cover"
          data-ai-hint={vendor.imageHint}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{vendor.name}</h1>
          <p className="text-muted-foreground mt-1">{vendor.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <span className="font-bold">{vendor.rating}</span>
            <span className="text-sm text-muted-foreground">({vendor.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-5 w-5" />
            <span>{vendor.category}</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Menu</h2>
        {menu && menu.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {menu.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No products available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
