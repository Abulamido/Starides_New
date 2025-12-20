'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { VendorCard } from '@/components/vendor-card';
import { Button } from '@/components/ui/button';
import {
  Store,
  Utensils,
  Coffee,
  Pizza,
  IceCream,
  Salad,
  Globe,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Vendor } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';


const categories = [
  { name: 'All', icon: Store },
  { name: 'African', icon: Utensils },
  { name: 'Fast Food', icon: Pizza },
  { name: 'Continental', icon: Globe },
  { name: 'Desserts', icon: IceCream },
  { name: 'Drinks', icon: Coffee },
  { name: 'Healthy', icon: Salad },
  { name: 'Restaurants', icon: Store } // Added Restaurants back as it was requested before
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

function VendorList() {
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Sync with URL params if they change
  useEffect(() => {
    const querySearch = searchParams.get('search');
    if (querySearch) {
      setSearchTerm(querySearch);
    }
  }, [searchParams]);

  const vendorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;

    const constraints: any[] = [
      where('activeStatus', '==', 'Active'),
      where('approvalStatus', '==', 'Approved')
    ];

    // Note: We are NOT filtering by category in Firestore if a search term exists, 
    // to allow searching across all categories.
    // However, if NO search term, we respect the category filter.
    if (selectedCategory !== 'All' && !searchTerm) {
      constraints.push(where('cuisine', 'array-contains', selectedCategory));
    }

    return query(
      collection(firestore, 'vendors'),
      ...constraints
    );
  }, [firestore, selectedCategory, searchTerm]); // Add searchTerm to dependency to re-fetch if logic changes

  const { data: vendors, isLoading } = useCollection<Vendor>(vendorsQuery);

  // Client-side filtering for search term
  const filteredVendors = vendors?.filter(vendor => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchesName = vendor.name?.toLowerCase().includes(term);
    const matchesCuisine = vendor.cuisine?.some(c => c.toLowerCase().includes(term));
    return matchesName || matchesCuisine;
  }) || [];

  const showLoading = isLoading;
  const displayVendors = filteredVendors;

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {searchTerm ? `Results for "${searchTerm}"` : 'Discover Vendors'}
          </h1>
          <p className="mt-2 text-base md:text-lg text-muted-foreground">
            {searchTerm ? 'Best matches for your craving.' : 'Find your favorite restaurants and products near you.'}
          </p>
        </div>

        {/* In-page search bar to clear/change search */}
        <div className="relative w-full md:w-72">
          <div className="absolute left-2 top-2.5 text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <Input
            placeholder="Search vendors..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex overflow-x-auto pb-4 md:pb-0 md:flex-wrap items-center gap-3 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {categories.map((category, index) => (
          <Button
            key={category.name}
            variant={selectedCategory === category.name && !searchTerm ? 'default' : 'outline'}
            onClick={() => {
              setSelectedCategory(category.name);
              setSearchTerm(''); // Clear search when picking a category
            }}
            className={cn(
              "h-10 px-6 rounded-full transition-all duration-300 shrink-0",
              selectedCategory === category.name && !searchTerm
                ? "shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
                : "hover:bg-secondary hover:text-secondary-foreground hover:border-secondary-foreground/10 hover:-translate-y-0.5 bg-background/50 backdrop-blur-sm"
            )}
          >
            <category.icon className="mr-2 h-4 w-4" />
            {category.name}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            {searchTerm ? 'Search Results' : 'Featured Restaurants'}
          </h2>
          <Button variant="link" className="text-primary">View all</Button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {showLoading && [...Array(8)].map((_, i) => <VendorCardSkeleton key={i} />)}
          {!showLoading && displayVendors.length > 0 && displayVendors.map((vendor) => (
            <Link key={vendor.id} href={`/customer/vendor/${vendor.id}`} className="block h-full">
              <VendorCard vendor={vendor} />
            </Link>
          ))}
        </div>
        {!showLoading && displayVendors.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground bg-card/30 rounded-lg border border-dashed">
            <Store className="h-16 w-16 mb-4 opacity-20" />
            <h3 className="text-lg font-semibold">No vendors found</h3>
            <p>Try adjusting your search or filters.</p>
            {searchTerm && (
              <Button variant="link" onClick={() => setSearchTerm('')} className="mt-2">
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

export default function CustomerDashboard() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading marketplace...</div>}>
      <VendorList />
    </Suspense>
  );
}
