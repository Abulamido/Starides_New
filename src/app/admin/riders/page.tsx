'use client';
import { AdminRiderCard } from '@/components/admin-rider-card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { AdminRider } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useMemo } from 'react';

function RiderCardSkeleton() {
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

export default function AdminRidersPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

  const ridersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'riders');
  }, [firestore, user]);

  const { data: riders, isLoading: isLoadingRiders } = useCollection<AdminRider>(ridersQuery);

  // Filter riders based on search query
  const filteredRiders = useMemo(() => {
    if (!riders) return [];
    if (!searchQuery.trim()) return riders;

    const query = searchQuery.toLowerCase();
    return riders.filter(rider =>
      rider.fullName?.toLowerCase().includes(query) ||
      rider.email?.toLowerCase().includes(query) ||
      rider.phone?.toLowerCase().includes(query) ||
      rider.vehicleType?.toLowerCase().includes(query) ||
      rider.id?.toLowerCase().includes(query)
    );
  }, [riders, searchQuery]);

  const showLoading = isLoadingRiders || isUserLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Riders</h1>
        <p className="text-muted-foreground">
          View, manage, and onboard all riders on the platform.
        </p>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search riders by name, email, phone, or vehicle type..."
          className="w-full pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {showLoading && [...Array(6)].map((_, i) => <RiderCardSkeleton key={i} />)}
        {!showLoading && filteredRiders.map((rider) => (
          <AdminRiderCard key={rider.id} rider={rider} />
        ))}
      </div>
      {!showLoading && filteredRiders.length === 0 && (
        <div className="text-center text-muted-foreground py-10 col-span-full">
          <p>{searchQuery ? `No riders found matching "${searchQuery}"` : 'No riders found.'}</p>
        </div>
      )}
    </div>
  );
}
