'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import type { Order } from '@/lib/data';
import { format } from 'date-fns';

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

function OrderRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-5 w-20" /></TableCell>
    </TableRow>
  )
}

export default function AdminOrdersPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // The query is now conditional on the user being loaded and present
  const ordersQuery = useMemoFirebase(() => {
    if (isUserLoading || !user) return null;
    return query(collection(firestore, 'orders'), orderBy('orderDate', 'desc'), limit(20));
  }, [firestore, user, isUserLoading]);

  const { data: orders, isLoading: isLoadingOrders, error } = useCollection<Order>(ordersQuery);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    // Firebase timestamps can be seconds/nanoseconds objects
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'PPP');
  };

  // The loading state now explicitly includes the user loading check
  const showLoading = isLoadingOrders || isUserLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Orders</h1>
        <p className="text-muted-foreground">
          View and manage recent orders on the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>A real-time list of the last 20 orders placed on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error Fetching Orders</AlertTitle>
              <AlertDescription>
                There was a problem loading the orders. Please try again later.
              </AlertDescription>
            </Alert>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {showLoading && (
                <>
                  <OrderRowSkeleton />
                  <OrderRowSkeleton />
                  <OrderRowSkeleton />
                </>
              )}
              {!isUserLoading && orders && orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium truncate max-w-20">{order.id}</TableCell>
                  <TableCell>{formatDate(order.orderDate)}</TableCell>
                  <TableCell className="truncate max-w-24">{order.customerId}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>{order.products.reduce((acc, p) => acc + p.quantity, 0)}</TableCell>
                  <TableCell className="text-right">₦{order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Order Details</DialogTitle>
                          <DialogDescription>Order ID: {order.id}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Products</h4>
                            <ul className="space-y-2">
                              {order.products.map((p, i) => (
                                <li key={i} className="flex justify-between text-sm">
                                  <span>{p.quantity}x {p.name}</span>
                                  <span>₦{p.price * p.quantity}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex justify-between font-bold pt-2 border-t">
                            <span>Total</span>
                            <span>₦{order.totalAmount.toFixed(2)}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">Delivery Address</h4>
                            <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!showLoading && orders?.length === 0 && (
            <div className="text-center text-muted-foreground py-10">
              <p>No orders have been placed yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
