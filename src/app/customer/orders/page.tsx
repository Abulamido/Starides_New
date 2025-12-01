'use client';

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, ShoppingCart } from 'lucide-react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Order } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { OrderDetailDialog } from './order-detail-dialog';

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
      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-5 w-20" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
    </TableRow>
  );
}

export default function MyOrdersPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const ordersQuery = useMemoFirebase(() => {
    if (isUserLoading || !user) return null;
    return query(
      collection(firestore, 'orders'),
      where('customerId', '==', user.uid),
      orderBy('orderDate', 'desc')
    );
  }, [firestore, user, isUserLoading]);

  const { data: orders, isLoading: isLoadingOrders } = useCollection<Order>(ordersQuery);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'PPP');
  };

  const showLoading = isLoadingOrders || isUserLoading;

  // Filter orders by status
  const filteredOrders = orders?.filter(order => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') {
      return ['New Order', 'Pending Acceptance', 'Preparing', 'Ready for Pickup', 'In Transit'].includes(order.status);
    }
    if (statusFilter === 'completed') {
      return ['Delivered', 'Canceled'].includes(order.status);
    }
    return true;
  });

  // Count orders by status
  const statusCounts = {
    all: orders?.length || 0,
    active: orders?.filter(o => ['New Order', 'Pending Acceptance', 'Preparing', 'Ready for Pickup', 'In Transit'].includes(o.status)).length || 0,
    completed: orders?.filter(o => ['Delivered', 'Canceled'].includes(o.status)).length || 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground">Track and manage your orders</p>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
          <TabsTrigger value="active">Active ({statusCounts.active})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({statusCounts.completed})</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>View and manage your orders</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {showLoading && (
                      <>
                        <OrderRowSkeleton />
                        <OrderRowSkeleton />
                      </>
                    )}
                    {!showLoading && filteredOrders && filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium truncate max-w-20">
                          {order.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>{formatDate(order.orderDate)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.products.reduce((acc, p) => acc + p.quantity, 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          ₦{order.totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="space-y-4 md:hidden">
                {showLoading && (
                  <>
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                  </>
                )}
                {!showLoading && filteredOrders && filteredOrders.map((order) => (
                  <div key={order.id} className="flex flex-col gap-3 rounded-lg border p-4 shadow-sm bg-card text-card-foreground">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">#{order.id.slice(0, 8)}</span>
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{formatDate(order.orderDate)}</span>
                      <span>{order.products.reduce((acc, p) => acc + p.quantity, 0)} Items</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t mt-1">
                      <span className="font-bold text-lg">₦{order.totalAmount.toFixed(2)}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {!showLoading && filteredOrders?.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-4 py-16 text-center text-muted-foreground">
                  <ShoppingCart className="h-16 w-16" />
                  <p className="font-semibold">
                    {statusFilter === 'all'
                      ? "You haven't placed any orders yet."
                      : `No ${statusFilter} orders found.`}
                  </p>
                  <p className="text-sm">Start shopping to see your orders here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <OrderDetailDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      />
    </div>
  );
}
