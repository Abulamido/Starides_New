
'use client';

import { AdminVendorCard } from '@/components/admin-vendor-card';
import { AdminRiderCard } from '@/components/admin-rider-card';
import Link from 'next/link';
import { ArrowRight, Users, Store, Bike, Package, CheckCircle, DollarSign, MapPin, BarChart, Search, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, getCountFromServer, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import type { AdminVendor, AdminRider, Order } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearch } from '@/contexts/search-context';
import { Badge } from '@/components/ui/badge';

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
    pendingOrders: 0,
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

        // Pending Orders (Approximation: active statuses)
        // Firestore 'in' query supports up to 10 values
        const pendingOrdersQuery = query(ordersColl, where('status', 'in', ['New Order', 'Pending Acceptance', 'Preparing', 'Ready for Pickup']));
        const pendingOrdersSnapshot = await getCountFromServer(pendingOrdersQuery);
        const pendingOrdersCount = pendingOrdersSnapshot.data().count;

        // Completed Orders
        const completedOrdersQuery = query(ordersColl, where('status', '==', 'Delivered'));
        const completedOrdersSnapshot = await getCountFromServer(completedOrdersQuery);
        const completedOrdersCount = completedOrdersSnapshot.data().count;

        // Revenue
        const revenueSnapshot = await getDocs(completedOrdersQuery);
        const revenue = revenueSnapshot.docs.reduce((acc, doc) => acc + (doc.data().totalAmount || 0), 0);

        setStatsData({
          users: usersCount,
          activeVendors: activeVendorsCount,
          activeRiders: activeRidersCount,
          totalOrders: totalOrdersCount,
          pendingOrders: pendingOrdersCount,
          completedOrders: completedOrdersCount,
          revenue: revenue,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [firestore, user]);

  // Fetch Vendors
  const vendorsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'vendors');
  }, [firestore, user]);
  const { data: vendors, isLoading: isLoadingVendors } = useCollection<AdminVendor>(vendorsQuery);

  // Fetch Riders
  const ridersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'riders');
  }, [firestore, user]);
  const { data: riders, isLoading: isLoadingRiders } = useCollection<AdminRider>(ridersQuery);

  // Fetch Orders
  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'orders'), orderBy('orderDate', 'desc'));
  }, [firestore, user]);
  const { data: orders, isLoading: isLoadingOrders } = useCollection<Order>(ordersQuery);

  // Fetch Users
  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users');
  }, [firestore, user]);
  const { data: users, isLoading: isLoadingUsers } = useCollection<any>(usersQuery);


  const showLoading = isLoadingVendors || isLoadingRiders || isLoadingOrders || isLoadingUsers || isUserLoading;

  // Search Logic
  const isSearchActive = searchQuery.length > 0;

  const filteredVendors = vendors?.filter(vendor =>
    !searchQuery ||
    vendor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredRiders = riders?.filter(rider =>
    !searchQuery ||
    rider.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rider.vehicle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rider.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rider.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredOrders = orders?.filter(order =>
    !searchQuery ||
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.totalAmount.toString().includes(searchQuery)
  ) || [];

  const filteredUsers = users?.filter((u: any) =>
    !searchQuery ||
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id?.toLowerCase().includes(searchQuery.toLowerCase()) // assuming useCollection adds id
  ) || [];


  const statsDisplay = [
    { title: 'Users', value: statsData.users.toString(), icon: Users },
    { title: 'Active Restaurants', value: statsData.activeVendors.toString(), icon: Store },
    { title: 'Active Riders', value: statsData.activeRiders.toString(), icon: Bike },
    { title: 'Total Orders', value: statsData.totalOrders.toString(), icon: Package },
    { title: 'Pending Orders', value: statsData.pendingOrders.toString(), icon: CheckCircle }, // Using CheckCircle temporarily or change icon
    { title: 'Completed', value: statsData.completedOrders.toString(), icon: CheckCircle },
    { title: 'Revenue', value: `₦${statsData.revenue.toLocaleString()}`, icon: DollarSign },
  ];

  if (isSearchActive) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
        <p className="text-muted-foreground">
          Showing results for "<span className="font-semibold">{searchQuery}</span>"
        </p>

        {/* Orders Results */}
        {(filteredOrders.length > 0) && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" /> Matching Orders ({filteredOrders.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map(order => (
                <Card key={order.id} className="hover:bg-accent/5 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-sm">Order #{order.id.substring(0, 8)}...</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.orderDate?.seconds * 1000).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium">₦{order.totalAmount.toLocaleString()}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Users Results */}
        {(filteredUsers.length > 0) && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" /> Matching Users ({filteredUsers.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((u: any) => (
                <Card key={u.id || Math.random()} className="hover:bg-accent/5 transition-colors">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-semibold truncate">{u.displayName || 'Unnamed User'}</div>
                      <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                      <div className="text-xs text-muted-foreground capitalize">{u.role}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Vendors Results */}
        {(filteredVendors.length > 0) && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Store className="h-5 w-5" /> Matching Vendors ({filteredVendors.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map((vendor) => (
                <AdminVendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          </section>
        )}

        {/* Riders Results */}
        {(filteredRiders.length > 0) && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Bike className="h-5 w-5" /> Matching Riders ({filteredRiders.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRiders.map((rider) => (
                <AdminRiderCard key={rider.id} rider={rider} />
              ))}
            </div>
          </section>
        )}

        {filteredOrders.length === 0 && filteredUsers.length === 0 && filteredVendors.length === 0 && filteredRiders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Search className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">No results found</p>
            <p>Try searching for a name, ID, email, or usage type.</p>
          </div>
        )}
      </div>
    );
  }

  // DEFAULT DASHBOARD VIEW
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>

      <section>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {statsDisplay.map((stat) => (
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
