'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, or, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { Order } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, MapPin, Phone, CheckCircle, Bike, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useLocationTracker } from '@/hooks/use-location-tracker';

function DeliveryCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  );
}

export default function RiderDeliveriesPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [activeDeliveryId, setActiveDeliveryId] = useState<string | null>(null);

  // Track location for active delivery
  const { isTracking } = useLocationTracker({
    orderId: activeDeliveryId || '',
    enabled: !!activeDeliveryId,
  });

  // Available deliveries (New Order, Pending Acceptance, Preparing, Ready for Pickup, no rider assigned)
  const availableQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'orders'),
      where('status', 'in', ['New Order', 'Pending Acceptance', 'Preparing', 'Ready for Pickup'])
    );
  }, [firestore, user]);

  // Active deliveries (assigned to this rider, not delivered)
  const activeQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'orders'),
      where('riderId', '==', user.uid),
      where('status', 'in', ['Preparing', 'Ready for Pickup', 'In Transit'])
    );
  }, [firestore, user]);

  // Completed deliveries
  const completedQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'orders'),
      where('riderId', '==', user.uid),
      where('status', '==', 'Delivered')
    );
  }, [firestore, user]);

  const { data: availableDeliveries, isLoading: loadingAvailable } = useCollection<Order>(availableQuery);
  const { data: activeDeliveries, isLoading: loadingActive } = useCollection<Order>(activeQuery);
  const { data: completedDeliveries, isLoading: loadingCompleted } = useCollection<Order>(completedQuery);

  const showLoading = isUserLoading || loadingAvailable || loadingActive || loadingCompleted;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'PPP p');
  };

  const handleAcceptDelivery = async (orderId: string) => {
    if (!user) return;
    setLoadingStates(prev => ({ ...prev, [orderId]: true }));
    try {
      const { acceptOrder } = await import('../actions');
      const result = await acceptOrder(orderId, user.uid);

      if (result.success) {
        toast({
          title: 'Delivery accepted',
          description: 'You can now pick up this order.',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Accept error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to accept delivery.',
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    setLoadingStates(prev => ({ ...prev, [orderId]: true }));
    try {
      const { updateOrderStatus } = await import('../actions');
      const result = await updateOrderStatus(orderId, status);

      if (result.success) {
        // Start location tracking when marking as "In Transit"
        if (status === 'In Transit') {
          setActiveDeliveryId(orderId);
        }

        toast({
          title: 'Status updated',
          description: `Order marked as ${status}.`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Update error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update status.',
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleCompleteDelivery = async (orderId: string) => {
    setLoadingStates(prev => ({ ...prev, [orderId]: true }));
    try {
      const { updateOrderStatus } = await import('../actions');
      const result = await updateOrderStatus(orderId, 'Delivered');

      if (result.success) {
        // Stop location tracking
        setActiveDeliveryId(null);

        toast({
          title: 'Delivery completed',
          description: 'Great job! The order has been delivered.',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Complete error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to complete delivery.',
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const DeliveryCard = ({ order, type }: { order: Order; type: 'available' | 'active' | 'completed' }) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Order #{order.id.slice(0, 8)}</CardTitle>
          <Badge variant={(type === 'completed' ? 'default' : 'secondary') as "default" | "secondary"}>
            {order.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">Delivery Address</p>
              <p className="text-muted-foreground">{order.deliveryAddress || 'No address'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {order.products.reduce((acc, p) => acc + p.quantity, 0)} items
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground text-xs">{formatDate(order.orderDate)}</span>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="font-semibold">Delivery Fee</span>
          <span className="font-bold">₦{(order.deliveryFee || 500).toFixed(2)}</span>
        </div>

        {type === 'available' && (
          <Button
            className="w-full"
            onClick={() => handleAcceptDelivery(order.id)}
            disabled={loadingStates[order.id]}
          >
            <Bike className="mr-2 h-4 w-4" />
            Accept Delivery
          </Button>
        )}

        {type === 'active' && (
          <div className="space-y-2">
            <Button
              variant={"outline" as "outline"}
              className="w-full"
              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.deliveryAddress)}`, '_blank')}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Navigate to Customer
            </Button>
            {order.status === 'Ready for Pickup' && (
              <Button
                className="w-full"
                onClick={() => handleUpdateStatus(order.id, 'In Transit')}
                disabled={loadingStates[order.id]}
              >
                Mark as In Transit
              </Button>
            )}
            {order.status === 'In Transit' && (
              <Button
                className="w-full"
                onClick={() => handleCompleteDelivery(order.id)}
                disabled={loadingStates[order.id]}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete Delivery
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Filter available deliveries to exclude those already assigned
  const filteredAvailable = availableDeliveries?.filter(order => !order.riderId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Deliveries</h1>
        <p className="text-muted-foreground">Manage your delivery assignments</p>
      </div>

      <Tabs defaultValue="available">
        <TabsList>
          <TabsTrigger value="available">
            Available ({filteredAvailable?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({activeDeliveries?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedDeliveries?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {showLoading && [...Array(3)].map((_, i) => <DeliveryCardSkeleton key={i} />)}
            {!showLoading && filteredAvailable?.map(order => (
              <DeliveryCard key={order.id} order={order} type="available" />
            ))}
            {!showLoading && filteredAvailable?.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4" />
                <p>No available deliveries at the moment.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {showLoading && [...Array(3)].map((_, i) => <DeliveryCardSkeleton key={i} />)}
            {!showLoading && activeDeliveries?.map(order => (
              <DeliveryCard key={order.id} order={order} type="active" />
            ))}
            {!showLoading && activeDeliveries?.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Bike className="h-12 w-12 mx-auto mb-4" />
                <p>No active deliveries.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {showLoading && [...Array(3)].map((_, i) => <DeliveryCardSkeleton key={i} />)}
            {!showLoading && completedDeliveries?.map(order => (
              <DeliveryCard key={order.id} order={order} type="completed" />
            ))}
            {!showLoading && completedDeliveries?.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                <p>No completed deliveries yet.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
