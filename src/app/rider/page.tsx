'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Bike,
  Package,
  DollarSign,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import type { Order } from '@/lib/data';

const getStatusBadgeColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'in transit':
      return 'bg-blue-100 text-blue-800';
    case 'ready for pickup':
      return 'bg-yellow-100 text-yellow-800';
    case 'canceled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function RiderDashboard() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  // Query all orders for this rider
  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'orders'),
      where('riderId', '==', user.uid),
      orderBy('orderDate', 'desc')
    );
  }, [firestore, user]);

  const { data: orders, isLoading: isOrdersLoading } = useCollection<Order>(ordersQuery);

  // Query rider profile to get online status - MOVED BEFORE EARLY RETURN
  const riderProfileQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'riders'),
      where('userId', '==', user.uid),
      limit(1)
    );
  }, [firestore, user]);

  const { data: riderProfiles } = useCollection<any>(riderProfileQuery);
  const riderProfile = riderProfiles?.[0];

  // NOW we can have early return - all hooks have been called
  if (isUserLoading || isOrdersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate stats from real data
  const activeDeliveries = orders?.filter(o =>
    o.status === 'In Transit' || o.status === 'Ready for Pickup'
  ).length || 0;

  const completedDeliveries = orders?.filter(o => o.status === 'Delivered').length || 0;

  const totalEarnings = orders?.reduce((acc, order) => {
    if (order.status === 'Delivered') {
      return acc + (order.deliveryFee || 500);
    }
    return acc;
  }, 0) || 0;

  const recentDeliveries = orders?.slice(0, 5) || [];

  const stats = [
    {
      title: 'Active',
      value: activeDeliveries.toString(),
      icon: Package,
    },
    {
      title: 'Completed',
      value: completedDeliveries.toString(),
      icon: Bike,
    },
    {
      title: 'Earnings',
      value: `₦${totalEarnings.toLocaleString()}`,
      icon: DollarSign,
    },
  ];

  const handleStatusToggle = async (checked: boolean) => {
    if (!riderProfile) return;
    try {
      const newStatus = checked ? 'Online' : 'Offline';
      const { updateRiderStatus } = await import('./actions');
      const result = await updateRiderStatus(riderProfile.id, newStatus);

      if (!result.success) {
        console.error('Failed to update status:', result.error);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rider Dashboard</h1>
          <p className="text-muted-foreground">{user?.displayName || 'Rider'}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="online-status"
            checked={riderProfile?.onlineStatus === 'Online'}
            onCheckedChange={handleStatusToggle}
            disabled={!riderProfile}
          />
          <Label htmlFor="online-status" className={`${riderProfile?.onlineStatus === 'Online' ? 'text-green-600' : 'text-muted-foreground'} font-medium`}>
            {riderProfile?.onlineStatus === 'Online' ? 'Online' : 'Offline'}
          </Label>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>View Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href="/rider/deliveries" className="flex items-center justify-between text-sm text-muted-foreground hover:text-primary">
            <span>{activeDeliveries} active deliveries waiting</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          {recentDeliveries.length > 0 ? (
            <Table>
              <TableBody>
                {recentDeliveries.map((delivery) => (
                  <TableRow key={delivery.id} className='border-b-border/20'>
                    <TableCell>
                      <div className="font-medium">Delivery #{delivery.id.slice(0, 8)}</div>
                      <div className="text-sm text-muted-foreground">
                        ₦{(delivery.deliveryFee || 500).toFixed(2)} fee
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className={`border-none capitalize ${getStatusBadgeColor(delivery.status)}`}>
                        {delivery.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No deliveries yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
