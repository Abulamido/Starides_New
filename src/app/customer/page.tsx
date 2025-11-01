
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


const categories = [
  { name: 'All', icon: Store },
  { name: 'Restaurants', icon: Utensils },
  { name: 'Groceries', icon: Carrot },
  { name: 'Pharmacy', icon: Pill },
  { name: 'Electronics', icon: Laptop },
  { name: 'Fashion', icon: Shirt },
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
        if (!firestore || !user) return null;
        return collection(firestore, 'vendors')
    }, [firestore, user]);
    const { data: vendors, isLoading } = useCollection<Vendor>(vendorsQuery);

    const showLoading = isLoading || isUserLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Discover Vendors
        </h1>
        <p className="text-muted-foreground">
          Find your favorite stores and products
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search vendors..."
          className="w-full pl-10"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {categories.map((category, index) => (
          <Button
            key={category.name}
            variant={index === 0 ? 'default' : 'secondary'}
            className={index !== 0 ? 'neumorphic-flat' : ''}
          >
            <category.icon className="mr-2 h-5 w-5" />
            {category.name}
          </Button>
        ))}
      </div>

      <div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {showLoading && [...Array(6)].map((_, i) => <VendorCardSkeleton key={i} />)}
          {!showLoading && vendors && vendors.length > 0 && vendors.map((vendor) => (
            <Link key={vendor.id} href={`/customer/vendor/${vendor.id}`}>
              <VendorCard vendor={vendor} />
            </Link>
          ))}
        </div>
        {!showLoading && vendors?.length === 0 && (
            <div className="text-center text-muted-foreground py-10 col-span-full">
                <p>No vendors found.</p>
            </div>
        )}
      </div>
    </div>
  );
}
