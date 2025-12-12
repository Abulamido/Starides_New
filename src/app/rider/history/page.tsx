'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, MapPin, Clock, DollarSign } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import type { Order } from '@/lib/data';
import { Badge } from '@/components/ui/badge';

export default function RiderHistoryPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  // Fetch completed deliveries
  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'orders'),
      where('riderId', '==', user.uid),
      where('status', '==', 'Delivered'),
      orderBy('orderDate', 'desc')
    );
  }, [firestore, user]);

  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  const totalDeliveries = orders?.length || 0;
  const totalEarnings = orders?.reduce((sum, order) => sum + (order.deliveryFee || 0), 0) || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Delivery History</h1>
        <p className="text-muted-foreground">
          Review your past deliveries and earnings.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeliveries}</div>
            <p className="text-xs text-muted-foreground">
              Completed orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From delivery fees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Fee</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{totalDeliveries > 0 ? (totalEarnings / totalDeliveries).toFixed(0) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per delivery
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Delivery History */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Deliveries</CardTitle>
          <CardDescription>Your delivery history</CardDescription>
        </CardHeader>
        <CardContent>
          {orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">Order #{order.id.substring(0, 8)}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {order.orderDate?.toDate ? format(order.orderDate.toDate(), 'PPP p') : 'Date N/A'}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Delivered
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{order.deliveryAddress || 'Address not available'}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">Delivery Fee</span>
                      <span className="font-semibold text-green-600">₦{order.deliveryFee?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground py-12">
              <Package className="h-16 w-16 opacity-20" />
              <div>
                <p className="text-lg font-semibold">No Deliveries Yet</p>
                <p className="text-sm">Your completed deliveries will appear here.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
