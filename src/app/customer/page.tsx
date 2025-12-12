
'use client';

import { VendorCard } from '@/components/vendor-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Store,
  Utensils,
  Carrot,
  Pill,
  Laptop,
  Shirt,
} from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Vendor } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';


const categories = [
  { name: 'All', icon: Store },
  { name: 'Restaurants', icon: Utensils },
  // Future categories - will be enabled after pilot phase
  // { name: 'Groceries', icon: Carrot },
  // { name: 'Pharmacy', icon: Pill },
  // { name: 'Electronics', icon: Laptop },
  // { name: 'Fashion', icon: Shirt },
];

function VendorCardSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="aspect-video w-full" />
      <div className="space-y-1">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  )
}

export default function CustomerDashboard() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const vendorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'vendors')
  }, [firestore]);
  const { data: vendors, isLoading } = useCollection<Vendor>(vendorsQuery);

  const showLoading = isLoading;

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Discover Vendors
          </h1>
          <p className="mt-2 text-base md:text-lg text-muted-foreground">
            Find your favorite restaurants and products near you.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for restaurants and food..."
            className="w-full pl-12 h-12 text-base md:text-lg shadow-sm transition-shadow focus-visible:shadow-md rounded-full bg-background/50 backdrop-blur-sm border-muted/40"
          />
        </div>

        <div className="flex overflow-x-auto pb-4 md:pb-0 md:flex-wrap items-center gap-3 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {categories.map((category, index) => (
            <Button
              key={category.name}
              variant={(index === 0 ? 'default' : 'outline') as "default" | "outline"}
              className={cn(
                "h-10 px-6 rounded-full transition-all duration-300 shrink-0",
                index === 0
                  ? "shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
                  : "hover:bg-secondary hover:text-secondary-foreground hover:border-secondary-foreground/10 hover:-translate-y-0.5 bg-background/50 backdrop-blur-sm"
              )}
            >
              <category.icon className="mr-2 h-4 w-4" />
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Featured Restaurants</h2>
          <Button variant="link" className="text-primary">View all</Button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {showLoading && [...Array(8)].map((_, i) => <VendorCardSkeleton key={i} />)}
          {!showLoading && vendors && vendors.length > 0 && vendors.map((vendor) => (
            <Link key={vendor.id} href={`/customer/vendor/${vendor.id}`} className="block h-full">
              <VendorCard vendor={vendor} />
            </Link>
          ))}
        </div>
        {!showLoading && vendors?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground bg-card/30 rounded-lg border border-dashed">
            <Store className="h-16 w-16 mb-4 opacity-20" />
            <h3 className="text-lg font-semibold">No vendors found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
