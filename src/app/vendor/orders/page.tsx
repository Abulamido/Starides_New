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
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Package, Terminal, Loader2 } from 'lucide-react';
import type { Order } from '@/lib/data';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type StatusVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const getStatusVariant = (status: string): StatusVariant => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return 'default';
    case 'shipped':
    case 'accepted':
      return 'outline';
    case 'processing':
      return 'secondary';
    case 'canceled':
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
      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-5 w-20" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-8 w-24" /></TableCell>
    </TableRow>
  )
}

export default function VendorOrdersPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const ordersQuery = useMemoFirebase(() => {
    if (isUserLoading || !user) return null;
    return query(
      collection(firestore, 'orders'),
      where('vendorId', '==', user.uid),
      orderBy('orderDate', 'desc')
    );
  }, [firestore, user, isUserLoading]);

  const { data: orders, isLoading: isLoadingOrders, error } = useCollection<Order>(ordersQuery);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'PPP');
  };

  const handleAcceptOrder = async (orderId: string) => {
    if (!firestore) return;
    setLoadingStates(prev => ({ ...prev, [orderId]: true }));
    try {
      await updateDoc(doc(firestore, 'orders', orderId), {
        status: 'Accepted',
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Order Accepted",
        description: `Order #${orderId.substring(0, 7)} has been accepted.`,
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not accept order.",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleMarkAsShipped = async (orderId: string) => {
    if (!firestore) return;
    setLoadingStates(prev => ({ ...prev, [orderId]: true }));
    try {
      await updateDoc(doc(firestore, 'orders', orderId), {
        status: 'Shipped',
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Order Updated",
        description: `Order #${orderId.substring(0, 7)} marked as shipped.`,
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update order status.",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const showLoading = isLoadingOrders || isUserLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Orders</h1>
        <p className="text-muted-foreground">
          Process new orders and view your order history.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Incoming Orders</CardTitle>
          <CardDescription>A real-time list of orders for your store.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error Fetching Orders</AlertTitle>
              <AlertDescription>
                There was a problem loading your orders. Please try again later.
              </AlertDescription>
            </Alert>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Action</TableHead>
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
                  <TableCell className="font-medium truncate max-w-24">{order.id}</TableCell>
                  <TableCell>{formatDate(order.orderDate)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>{order.products.reduce((acc, p) => acc + p.quantity, 0)}</TableCell>
                  <TableCell className="text-right">₦{order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    {order.status === 'Processing' && (
                      <Button
                        size="sm"
                        onClick={() => handleAcceptOrder(order.id)}
                        disabled={loadingStates[order.id]}
                      >
                        {loadingStates[order.id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Accept Order
                      </Button>
                    )}
                    {order.status === 'Accepted' && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkAsShipped(order.id)}
                        disabled={loadingStates[order.id]}
                      >
                        {loadingStates[order.id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Mark as Shipped
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!showLoading && orders?.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center text-muted-foreground">
              <Package className="h-16 w-16" />
              <p className="font-semibold">No orders yet.</p>
              <p className="text-sm">New orders for your store will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
