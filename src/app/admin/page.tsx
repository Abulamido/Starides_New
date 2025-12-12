
'use client';

import { AdminVendorCard } from '@/components/admin-vendor-card';
import { AdminRiderCard } from '@/components/admin-rider-card';
import Link from 'next/link';
import { ArrowRight, Users, Store, Bike, Package, CheckCircle, DollarSign, MapPin, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, getCountFromServer, query, where, getDocs } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import type { AdminVendor, AdminRider } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearch } from '@/contexts/search-context';

const stats = [
  { title: 'Users', value: '0', icon: Users },
  { title: 'Active Restaurants', value: '0', icon: Store },
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
  const { searchQuery } = useSearch();
  const [statsData, setStatsData] = useState({
    users: 0,
    activeVendors: 0,
    activeRiders: 0,
    totalOrders: 0,
    completedOrders: 0,
    revenue: 0,
  });

  useEffect(() => {
    if (!firestore || !user) return;

    const fetchStats = async () => {
      try {
        // Users
        const usersColl = collection(firestore, 'users');
        const usersSnapshot = await getCountFromServer(usersColl);
        const usersCount = usersSnapshot.data().count;

        // Active Vendors
        const vendorsColl = collection(firestore, 'vendors');
        const activeVendorsQuery = query(vendorsColl, where('activeStatus', '==', 'Active'));
        const activeVendorsSnapshot = await getCountFromServer(activeVendorsQuery);
        const activeVendorsCount = activeVendorsSnapshot.data().count;

        // Active Riders
        const ridersColl = collection(firestore, 'riders');
        const activeRidersQuery = query(ridersColl, where('onlineStatus', '==', 'Online'));
        const activeRidersSnapshot = await getCountFromServer(activeRidersQuery);
        const activeRidersCount = activeRidersSnapshot.data().count;

        // Orders
        const ordersColl = collection(firestore, 'orders');
        const totalOrdersSnapshot = await getCountFromServer(ordersColl);
        const totalOrdersCount = totalOrdersSnapshot.data().count;

        // Completed Orders
        const completedOrdersQuery = query(ordersColl, where('status', '==', 'Delivered'));
        const completedOrdersSnapshot = await getCountFromServer(completedOrdersQuery);
        const completedOrdersCount = completedOrdersSnapshot.data().count;

        // Revenue (Sum of totalAmount for delivered orders)
        // Note: getAggregateFromServer might not be available in all environments/versions, 
        // but it is standard in v9+. If it fails, we fallback or handle error.
        // For now, we'll try to use it if available, otherwise fetch docs.
        // To be safe and simple for this environment without checking SDK version deeply, 
        // let's fetch the documents for revenue. It might be expensive if many orders, 
        // but for a start it's fine. 
        // actually, let's try getAggregateFromServer first if we can import it.
        // If not, we'll just fetch.

        // Let's use getDocs for revenue for now to be safe against SDK version issues in this environment
        // unless I see it imported. I'll stick to getDocs for revenue for now.
        const revenueSnapshot = await getDocs(completedOrdersQuery);
        const revenue = revenueSnapshot.docs.reduce((acc, doc) => acc + (doc.data().totalAmount || 0), 0);

        setStatsData({
          users: usersCount,
          activeVendors: activeVendorsCount,
          activeRiders: activeRidersCount,
          totalOrders: totalOrdersCount,
          completedOrders: completedOrdersCount,
          revenue: revenue,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [firestore, user]);

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

  // Filter vendors and riders based on search query
  const filteredVendors = vendors?.filter(vendor =>
    !searchQuery ||
    vendor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.id?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredRiders = riders?.filter(rider =>
    !searchQuery ||
    rider.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rider.vehicle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rider.id?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const stats = [
    { title: 'Users', value: statsData.users.toString(), icon: Users },
    { title: 'Active Restaurants', value: statsData.activeVendors.toString(), icon: Store },
    { title: 'Active Riders', value: statsData.activeRiders.toString(), icon: Bike },
    { title: 'Total Orders', value: statsData.totalOrders.toString(), icon: Package },
    { title: 'Completed', value: statsData.completedOrders.toString(), icon: CheckCircle },
    { title: 'Revenue', value: `₦${statsData.revenue.toLocaleString()}`, icon: DollarSign },
  ];

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
          {filteredVendors?.slice(0, 3).map((vendor) => (
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
          {filteredRiders?.slice(0, 3).map((rider) => (
            <AdminRiderCard key={rider.id} rider={rider} />
          ))}
        </div>
      </section>
    </div>
  );
}
