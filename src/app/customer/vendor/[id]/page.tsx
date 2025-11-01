
'use client';
import { ProductCard } from '@/components/product-card';
import Image from 'next/image';
import { Star, MapPin } from 'lucide-react';
import { notFound } from 'next/navigation';
import { useDoc, useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
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


export default function VendorPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  
  const vendorRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'vendors', params.id);
  }, [firestore, user, params.id]);
  const { data: vendor, isLoading: isLoadingVendor } = useDoc<Vendor>(vendorRef);

  const productsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'products'), where('vendorId', '==', params.id));
  }, [firestore, user, params.id]);
  const { data: menu, isLoading: isLoadingMenu } = useCollection<Product>(productsQuery);

  const isLoading = isUserLoading || isLoadingVendor || isLoadingMenu;

  if (isLoading) {
      return <VendorPageSkeleton />;
  }

  if (!vendor) {
    notFound();
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <h1 className="text-3xl font-bold md:text-5xl">{vendor.name}</h1>
          <p className="max-w-xl text-sm md:text-base">
            {vendor.description}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <span className="font-bold">{vendor.rating}</span>
            <span className="text-sm text-muted-foreground">
              ({vendor.reviewCount} reviews)
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-5 w-5" />
            <span>{vendor.category}</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight">Menu</h2>
        {menu && menu.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {menu.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-muted-foreground">
            This vendor has not added any products yet.
          </p>
        )}
      </div>
    </div>
  );
}
