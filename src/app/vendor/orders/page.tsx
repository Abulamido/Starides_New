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
import { Package, Terminal, Loader2, Eye } from 'lucide-react';
import type { Order } from '@/lib/data';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { sendPushNotification } from '@/app/actions/push';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type StatusVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const getStatusVariant = (status: string): StatusVariant => {
  switch (status) {
    case 'Delivered':
      return 'default';
    case 'Ready for Pickup':
    case 'Preparing':
    case 'Shipped':
    case 'Accepted':
    case 'In Transit':
      return 'outline';
    case 'New Order':
    case 'Pending Acceptance':
    case 'Processing':
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
      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-5 w-20" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-8 w-32" /></TableCell>
    </TableRow>
  )
}

export default function VendorOrdersPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
        status: 'Preparing',
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Order Accepted",
        description: `Order #${orderId.substring(0, 7)} is now being prepared.`,
      });

      // Send push notification to customer
      const order = orders?.find(o => o.id === orderId);
      if (order?.customerId) {
        sendPushNotification({
          userId: order.customerId,
          title: "Order Accepted! 🍳",
          body: `Your order #${orderId.substring(0, 7)} is being prepared.`,
          data: { orderId, type: 'order_accepted' }
        });
      }
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

  const handleMarkAsReady = async (orderId: string) => {
    if (!firestore) return;
    setLoadingStates(prev => ({ ...prev, [orderId]: true }));
    try {
      await updateDoc(doc(firestore, 'orders', orderId), {
        status: 'Ready for Pickup',
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Order Updated",
        description: `Order #${orderId.substring(0, 7)} is ready for pickup.`,
      });

      // Send push notification to customer
      const order = orders?.find(o => o.id === orderId);
      if (order?.customerId) {
        sendPushNotification({
          userId: order.customerId,
          title: "Order Ready! 🛍️",
          body: `Your order #${orderId.substring(0, 7)} is ready for pickup.`,
          data: { orderId, type: 'order_ready' }
        });
      }
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

  const handleCancelOrder = async (orderId: string) => {
    if (!firestore) return;
    setLoadingStates(prev => ({ ...prev, [orderId]: true }));
    try {
      await updateDoc(doc(firestore, 'orders', orderId), {
        status: 'Canceled',
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Order Canceled",
        description: `Order #${orderId.substring(0, 7)} has been canceled.`,
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not cancel order.",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const showLoading = isLoadingOrders || isUserLoading;

  // Helper function to determine which buttons to show
  const canAccept = (status: string) => ['New Order', 'Pending Acceptance', 'Processing'].includes(status);
  const canMarkReady = (status: string) => ['Preparing', 'Accepted'].includes(status);
  const isCompleted = (status: string) => ['Ready for Pickup', 'In Transit', 'Delivered', 'Canceled'].includes(status);

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
          <CardDescription>A real-time list of orders for your restaurant.</CardDescription>
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
                  <TableCell className="font-medium truncate max-w-24">{order.id.substring(0, 8)}</TableCell>
                  <TableCell>{formatDate(order.orderDate)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>{order.products.reduce((acc, p) => acc + p.quantity, 0)}</TableCell>
                  <TableCell className="text-right">₦{order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end flex-wrap">
                      {canAccept(order.status) && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptOrder(order.id)}
                            disabled={loadingStates[order.id]}
                          >
                            {loadingStates[order.id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={loadingStates[order.id]}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      {canMarkReady(order.status) && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleMarkAsReady(order.id)}
                            disabled={loadingStates[order.id]}
                          >
                            {loadingStates[order.id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Ready
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {isCompleted(order.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Details
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!showLoading && orders?.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center text-muted-foreground">
              <Package className="h-16 w-16" />
              <p className="font-semibold">No orders yet.</p>
              <p className="text-sm">New orders for your restaurant will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Order ID: {selectedOrder?.id}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">Status</h4>
                  <Badge variant={getStatusVariant(selectedOrder.status)}>{selectedOrder.status}</Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Order Date</h4>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedOrder.orderDate)}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Products</h4>
                <ul className="space-y-2">
                  {selectedOrder.products.map((p, i) => (
                    <li key={i} className="flex justify-between text-sm">
                      <span>{p.quantity}x {p.name}</span>
                      <span>₦{(p.price * p.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total</span>
                <span>₦{selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Delivery Address</h4>
                <p className="text-sm text-muted-foreground">{selectedOrder.deliveryAddress}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
