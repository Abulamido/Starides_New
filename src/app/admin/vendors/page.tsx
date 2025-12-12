'use client';

import { AdminVendorCard } from '@/components/admin-vendor-card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { AdminVendor } from '@/lib/data';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearch } from '@/contexts/search-context';

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
  const { user } = useUser();
  const { searchQuery, setSearchQuery } = useSearch();
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  console.log('AdminVendorsPage: searchQuery:', searchQuery);

  const vendorsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'vendors');
  }, [firestore, user]);
  const { data: vendors, isLoading } = useCollection<AdminVendor>(vendorsQuery);

  // Debug logging
  console.log('AdminVendorsPage Render. SearchQuery:', searchQuery);
  console.log('Vendors count:', vendors?.length);

  // Filter vendors based on search and status
  const filteredVendors = vendors?.filter(vendor => {
    // Debug individual vendor match
    /*
    const matchesSearch = !searchQuery ||
      vendor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.id?.toLowerCase().includes(searchQuery.toLowerCase());
    */
    const matchesSearch = !searchQuery ||
      (vendor.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.id || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' ||
      (vendor.approvalStatus || 'Pending') === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  const pendingCount = vendors?.filter(v => (v.approvalStatus || 'Pending') === 'Pending').length || 0;
  const approvedCount = vendors?.filter(v => v.approvalStatus === 'Approved').length || 0;
  const rejectedCount = vendors?.filter(v => v.approvalStatus === 'Rejected').length || 0;

  return (
    <div className="space-y-6">


      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">Manage vendor accounts and approvals</p>
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
          All ({vendors?.length || 0})
        </Button>
        <Button
          variant={statusFilter === 'Pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('Pending')}
          className="shrink-0"
        >
          Pending ({pendingCount})
        </Button>
        <Button
          variant={statusFilter === 'Approved' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('Approved')}
          className="shrink-0"
        >
          Approved ({approvedCount})
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
            placeholder="Search by name, category, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && [...Array(6)].map((_, i) => <VendorCardSkeleton key={i} />)}
        {!isLoading && filteredVendors.map((vendor) => (
          <AdminVendorCard key={vendor.id} vendor={vendor} />
        ))}
      </div>

      {!isLoading && filteredVendors.length === 0 && (
        <div className="text-center text-muted-foreground py-10">
          <p>{searchQuery || statusFilter !== 'All' ? 'No vendors found matching your filters.' : 'No vendors found.'}</p>
        </div>
      )}
    </div>
  );
}
