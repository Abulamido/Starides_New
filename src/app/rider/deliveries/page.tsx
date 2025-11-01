
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Bike, Terminal } from 'lucide-react';
import type { Order } from '@/lib/data';
import { Button } from '@/components/ui/button';

function DeliveryRowSkeleton() {
    return (
        <TableRow>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-8 w-24" /></TableCell>
        </TableRow>
    )
}

export default function RiderDeliveriesPage() {
  const firestore = useFirestore();

  // Query for orders that are ready for pickup
  const deliveriesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // In a real app, you might query for 'Shipped' or a similar status
    return query(collection(firestore, 'orders'), where('status', '==', 'Processing'));
  }, [firestore]);

  const { data: deliveries, isLoading, error } = useCollection<Order>(deliveriesQuery);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Available Deliveries</h1>
        <p className="text-muted-foreground">
          View and accept new delivery tasks.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Delivery Queue</CardTitle>
          <CardDescription>A real-time list of orders ready for pickup.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error Fetching Deliveries</AlertTitle>
              <AlertDescription>
                There was a problem loading available deliveries. Please try again later.
              </AlertDescription>
            </Alert>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Pickup Location</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <>
                  <DeliveryRowSkeleton />
                  <DeliveryRowSkeleton />
                </>
              )}
              {deliveries && deliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell className="font-medium truncate max-w-24">{delivery.id}</TableCell>
                  {/* Mock data for locations */}
                  <TableCell>ABU EATS</TableCell>
                  <TableCell>{delivery.deliveryAddress}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm">Accept</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!isLoading && deliveries?.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center text-muted-foreground">
                <Bike className="h-16 w-16" />
                <p className="font-semibold">No deliveries available right now.</p>
                <p className="text-sm">Check back soon for new tasks.</p>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
