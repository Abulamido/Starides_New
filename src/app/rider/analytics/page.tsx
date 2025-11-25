'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Loader2, TrendingUp, Bike, DollarSign, Clock, Target } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import type { Order } from '@/lib/data';

export default function RiderAnalyticsPage() {
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

  if (isUserLoading || isOrdersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate analytics
  const now = new Date();

  const completedDeliveries = orders?.filter(o => o.status === 'Delivered') || [];
  const totalDeliveries = orders?.length || 0;

  const totalEarnings = completedDeliveries.reduce((acc, order) => {
    return acc + (order.deliveryFee || 500);
  }, 0);

  const averageEarnings = completedDeliveries.length > 0
    ? totalEarnings / completedDeliveries.length
    : 0;

  const successRate = totalDeliveries > 0
    ? Math.round((completedDeliveries.length / totalDeliveries) * 100)
    : 0;

  // Earnings by day (last 7 days)
  const earningsByDay = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(now, 6 - i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const dayEarnings = completedDeliveries.reduce((acc, order) => {
      if (order.orderDate?.toDate) {
        const orderDate = order.orderDate.toDate();
        if (orderDate >= dayStart && orderDate <= dayEnd) {
          return acc + (order.deliveryFee || 500);
        }
      }
      return acc;
    }, 0);

    const dayDeliveries = completedDeliveries.filter(order => {
      if (order.orderDate?.toDate) {
        const orderDate = order.orderDate.toDate();
        return orderDate >= dayStart && orderDate <= dayEnd;
      }
      return false;
    }).length;

    return {
      date: format(date, 'EEE'),
      earnings: dayEarnings,
      deliveries: dayDeliveries,
    };
  });

  const maxEarnings = Math.max(...earningsByDay.map(d => d.earnings), 1);

  // Recent performance (last 10 deliveries)
  const recentDeliveries = completedDeliveries.slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Track your delivery performance and earnings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From {completedDeliveries.length} deliveries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Deliveries</CardTitle>
            <Bike className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedDeliveries.length}</div>
            <p className="text-xs text-muted-foreground">
              {totalDeliveries} total assigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average per Delivery</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{averageEarnings.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              Per completed delivery
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">
              Deliveries completed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Earnings Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Earnings Trend</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {earningsByDay.map((day, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 text-sm text-muted-foreground">{day.date}</div>
                  <div className="flex-1">
                    <div className="h-8 bg-muted rounded-md overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(day.earnings / maxEarnings) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-32 text-sm font-medium text-right">
                    ₦{day.earnings.toLocaleString()} ({day.deliveries})
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Deliveries</CardTitle>
            <CardDescription>Last 10 completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDeliveries.length > 0 ? (
                recentDeliveries.map((delivery, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 font-bold text-sm">
                        <Bike className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Order #{delivery.id.slice(0, 6)}</p>
                        <p className="text-xs text-muted-foreground">
                          {delivery.orderDate?.toDate ? format(delivery.orderDate.toDate(), 'MMM d, p') : 'Date N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">+₦{(delivery.deliveryFee || 500).toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">Delivered</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No completed deliveries yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
