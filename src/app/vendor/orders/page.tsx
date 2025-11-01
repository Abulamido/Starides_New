
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
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Package, Terminal } from 'lucide-react';
import type { Order } from '@/lib/data';
import { format } from 'date-fns';

type StatusVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const getStatusVariant = (status: string): StatusVariant => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'default';
      case 'shipped':
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
        </TableRow>
    )
}

export default function VendorOrdersPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
        collection(firestore, 'orders'), 
        where('vendorId', '==', user.uid), // Assuming vendor's user.uid is their vendor ID
        orderBy('orderDate', 'desc')
    );
  }, [firestore, user]);

  const { data: orders, isLoading, error } = useCollection<Order>(ordersQuery);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'PPP');
  };

  const showLoading = isLoading || isUserLoading;
  
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {showLoading && (
                <>
                  <OrderRowSkeleton />
                  <OrderRowSkeleton />
                </>
              )}
              {orders && orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium truncate max-w-24">{order.id}</TableCell>
                  <TableCell>{formatDate(order.orderDate)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>{order.products.reduce((acc, p) => acc + p.quantity, 0)}</TableCell>
                  <TableCell className="text-right">₦{order.totalAmount.toFixed(2)}</TableCell>
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
