'use client';

import { AdminRiderCard } from '@/components/admin-rider-card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { AdminRider } from '@/lib/data';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearch } from '@/contexts/search-context';

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
  const { user } = useUser();
  const { searchQuery, setSearchQuery } = useSearch();
  const [statusFilter, setStatusFilter] = useState<'All' | 'Unverified' | 'Verified' | 'Rejected'>('All');

  const ridersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'riders');
  }, [firestore, user]);
  const { data: riders, isLoading } = useCollection<AdminRider>(ridersQuery);

  // Filter riders based on search and status
  const filteredRiders = riders?.filter(rider => {
    const matchesSearch = !searchQuery ||
      rider.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rider.vehicle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rider.id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' ||
      (rider.verificationStatus || 'Unverified') === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  const unverifiedCount = riders?.filter(r => (r.verificationStatus || 'Unverified') === 'Unverified').length || 0;
  const verifiedCount = riders?.filter(r => r.verificationStatus === 'Verified').length || 0;
  const rejectedCount = riders?.filter(r => r.verificationStatus === 'Rejected').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Riders</h1>
          <p className="text-muted-foreground">Manage rider accounts and verifications</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={statusFilter === 'All' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('All')}
          className="shrink-0"
        >
          All ({riders?.length || 0})
        </Button>
        <Button
          variant={statusFilter === 'Unverified' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('Unverified')}
          className="shrink-0"
        >
          Unverified ({unverifiedCount})
        </Button>
        <Button
          variant={statusFilter === 'Verified' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('Verified')}
          className="shrink-0"
        >
          Verified ({verifiedCount})
        </Button>
        <Button
          variant={statusFilter === 'Rejected' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('Rejected')}
          className="shrink-0"
        >
          Rejected ({rejectedCount})
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, vehicle type, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Riders Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && [...Array(6)].map((_, i) => <RiderCardSkeleton key={i} />)}
        {!isLoading && filteredRiders.map((rider) => (
          <AdminRiderCard key={rider.id} rider={rider} />
        ))}
      </div>

      {!isLoading && filteredRiders.length === 0 && (
        <div className="text-center text-muted-foreground py-10">
          <p>{searchQuery || statusFilter !== 'All' ? 'No riders found matching your filters.' : 'No riders found.'}</p>
        </div>
      )}
    </div>
  );
}
