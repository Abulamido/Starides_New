
'use client';

import { AdminVendorCard } from '@/components/admin-vendor-card';
import { AdminRiderCard } from '@/components/admin-rider-card';
import Link from 'next/link';
import { ArrowRight, Users, Store, Bike, Package, CheckCircle, DollarSign, MapPin, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { AdminVendor, AdminRider } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

const stats = [
    { title: 'Users', value: '0', icon: Users },
    { title: 'Active Vendors', value: '0', icon: Store },
    { title: 'Active Riders', value: '0', icon: Bike },
    { title: 'Total Orders', value: '0', icon: Package },
    { title: 'Completed', value: '0', icon: CheckCircle },
    { title: 'Revenue', value: '₦0', icon: DollarSign },
];

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


export default function AdminDashboard() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();

    const vendorsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, 'vendors');
    }, [firestore, user]);
    const { data: vendors, isLoading: isLoadingVendors } = useCollection<AdminVendor>(vendorsQuery);

    const ridersQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, 'riders');
    }, [firestore, user]);
    const { data: riders, isLoading: isLoadingRiders } = useCollection<AdminRider>(ridersQuery);

    const showLoading = isLoadingVendors || isLoadingRiders || isUserLoading;

  return (
    <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>

        <section>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
                {stats.map((stat) => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                </Card>
                ))}
            </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="flex flex-col justify-between">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Live Map
                    </CardTitle>
                    <CardDescription>Track riders and deliveries in real-time</CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/admin/map" className="flex items-center text-sm font-medium text-primary hover:underline">
                        View Live Map <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                </CardContent>
            </Card>
            <Card className="flex flex-col justify-between">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart className="h-5 w-5" />
                        Analytics
                    </CardTitle>
                    <CardDescription>View platform insights and reports</CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/admin/analytics" className="flex items-center text-sm font-medium text-primary hover:underline">
                        View Analytics <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                </CardContent>
            </Card>
        </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Recent Vendors
          </h2>
          <Link
            href="/admin/vendors"
            className="flex items-center text-sm font-medium text-primary hover:underline"
          >
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {showLoading && [...Array(3)].map((_, i) => <VendorCardSkeleton key={i} />)}
          {vendors?.map((vendor) => (
            <AdminVendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Recent Riders
          </h2>
          <Link
            href="/admin/riders"
            className="flex items-center text-sm font-medium text-primary hover:underline"
          >
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {showLoading && [...Array(3)].map((_, i) => <RiderCardSkeleton key={i} />)}
          {riders?.map((rider) => (
            <AdminRiderCard key={rider.id} rider={rider} />
          ))}
        </div>
      </section>
    </div>
  );
}
