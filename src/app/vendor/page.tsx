
'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowRight,
  Store,
} from 'lucide-react';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import type { Order } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';


type StatusVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const getStatusVariant = (status: string): StatusVariant => {
  switch (status) {
    case 'Delivered':
      return 'default';
    case 'Ready for Pickup':
    case 'In Transit':
      return 'outline';
    case 'New Order':
    case 'Pending Acceptance':
    case 'Preparing':
      return 'secondary';
    case 'Canceled':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'Delivered':
      return 'bg-green-100 text-green-800';
    case 'Ready for Pickup':
    case 'In Transit':
      return 'bg-blue-100 text-blue-800';
    case 'New Order':
    case 'Pending Acceptance':
    case 'Preparing':
      return 'bg-yellow-100 text-yellow-800';
    case 'Canceled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};


export default function VendorDashboard() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'orders'),
      where('vendorId', '==', user.uid), // Assuming vendor's user.uid is their vendor ID
    );
  }, [firestore, user]);

  const recentOrdersQuery = useMemoFirebase(() => {
    if (!ordersQuery) return null;
    return query(ordersQuery, orderBy('orderDate', 'desc'), limit(5));
  }, [ordersQuery]);


  const { data: allOrders, isLoading: isLoadingAll } = useCollection<Order>(ordersQuery);
  const { data: recentOrders, isLoading: isLoadingRecent } = useCollection<Order>(recentOrdersQuery);

  const stats = useMemo(() => {
    if (!allOrders) return { total: 0, pending: 0, completed: 0, revenue: 0 };
    return {
      total: allOrders.length,
      pending: allOrders.filter(o => ['New Order', 'Pending Acceptance', 'Preparing'].includes(o.status)).length,
      completed: allOrders.filter(o => o.status === 'Delivered').length,
      revenue: allOrders.reduce((acc, o) => acc + o.totalAmount, 0)
    }
  }, [allOrders]);

  const statCards = [
    { title: 'Total Orders', value: stats.total, icon: Package },
    { title: 'Pending', value: stats.pending, icon: Clock },
    { title: 'Completed', value: stats.completed, icon: CheckCircle },
    { title: 'Revenue', value: `₦${stats.revenue.toFixed(2)}`, icon: DollarSign },
  ];


  const showLoading = isUserLoading || isLoadingAll || isLoadingRecent;

  // Query vendor profile to get active status
  const vendorProfileQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'vendors'),
      where('userId', '==', user.uid),
      limit(1)
    );
  }, [firestore, user]);

  const { data: vendorProfiles } = useCollection<any>(vendorProfileQuery);
  const vendorProfile = vendorProfiles?.[0];

  const handleStatusToggle = async (checked: boolean) => {
    if (!firestore || !vendorProfile) return;
    try {
      const newStatus = checked ? 'Active' : 'Inactive';
      await updateDoc(doc(firestore, 'vendors', vendorProfile.id), {
        activeStatus: newStatus
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{user?.displayName || 'Vendor'}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">Approved</Badge>
            <div className="flex items-center space-x-2 ml-4">
              <Switch
                id="vendor-status"
                checked={vendorProfile?.activeStatus === 'Active'}
                onCheckedChange={handleStatusToggle}
                disabled={!vendorProfile}
              />
              <Label htmlFor="vendor-status" className={`${vendorProfile?.activeStatus === 'Active' ? 'text-blue-700' : 'text-muted-foreground'} font-medium`}>
                {vendorProfile?.activeStatus === 'Active' ? 'Active' : 'Inactive'}
              </Label>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {showLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-3xl font-bold">{stat.value}</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Manage Products
            </CardTitle>
            <CardDescription>View your active products</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/vendor/products" className="flex items-center text-sm font-medium text-primary hover:underline">
              View Products <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              View Orders
            </CardTitle>
            <CardDescription>{stats.pending} pending orders to process</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/vendor/orders" className="flex items-center text-sm font-medium text-primary hover:underline">
              View Orders <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {showLoading && (
                <TableRow><TableCell><Skeleton className="h-10 w-full" /></TableCell></TableRow>
              )}
              {recentOrders?.map((order) => (
                <TableRow key={order.id} className='border-b-border/20'>
                  <TableCell>
                    <div className="font-medium">Order {order.id.substring(0, 7)}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.products.reduce((acc, p) => acc + p.quantity, 0)} items &bull; ₦{order.totalAmount.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className={`border-none ${getStatusBadgeColor(order.status)}`}>
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {!showLoading && recentOrders?.length === 0 && (
                <TableRow>
                  <TableCell className="text-center text-muted-foreground py-10">
                    No recent orders.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
