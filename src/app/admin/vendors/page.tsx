
'use client';
import { AdminVendorCard } from '@/components/admin-vendor-card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { AdminVendor } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

function VendorCardSkeleton() {
     return (
        <div className="p-4 border rounded-lg space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
            </div>
        </div>
    )
}

export default function AdminVendorsPage() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const vendorsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, 'vendors');
    }, [firestore, user]);
    const { data: vendors, isLoading: isLoadingVendors } = useCollection<AdminVendor>(vendorsQuery);

    const showLoading = isLoadingVendors || isUserLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Vendors</h1>
        <p className="text-muted-foreground">
          View, manage, and approve all vendor accounts on the platform.
        </p>
      </div>
       <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search vendors by name or category..."
          className="w-full pl-10"
        />
      </div>
       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {showLoading && [...Array(6)].map((_, i) => <VendorCardSkeleton key={i} />)}
          {vendors?.map((vendor) => (
            <AdminVendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
        {!showLoading && vendors?.length === 0 && (
            <div className="text-center text-muted-foreground py-10 col-span-full">
                <p>No vendors found.</p>
            </div>
        )}
    </div>
  );
}
