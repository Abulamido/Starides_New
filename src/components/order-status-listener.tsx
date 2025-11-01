
'use client';

import { useEffect, useRef } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Order } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { PackageCheck, Truck } from 'lucide-react';

type OrderStatusListenerProps = {
  customerId: string;
};

export function OrderStatusListener({ customerId }: OrderStatusListenerProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  // Ref to store the previous state of orders
  const previousOrdersRef = useRef<Order[]>([]);

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'orders'), where('customerId', '==', customerId));
  }, [firestore, customerId]);

  const { data: orders } = useCollection<Order>(ordersQuery);

  useEffect(() => {
    if (orders) {
      const previousOrders = previousOrdersRef.current;
      
      // Compare current orders with previous orders to find changes
      orders.forEach(currentOrder => {
        const previousOrder = previousOrders.find(o => o.id === currentOrder.id);
        
        // Check if the order is new or if the status has changed
        if (previousOrder && previousOrder.status !== currentOrder.status) {
            if (currentOrder.status === 'Shipped') {
                toast({
                    title: 'Your order is on the way!',
                    description: `Order #${currentOrder.id.substring(0, 7)} has been shipped.`,
                    action: <Truck className="h-5 w-5 text-blue-500" />
                });
            } else if (currentOrder.status === 'Delivered') {
                toast({
                    title: 'Your order has arrived!',
                    description: `Order #${currentOrder.id.substring(0, 7)} has been delivered.`,
                     action: <PackageCheck className="h-5 w-5 text-green-500" />
                });
            }
        }
      });

      // Update the previous orders ref for the next render
      previousOrdersRef.current = orders;
    }
  }, [orders, toast]);

  // This component doesn't render anything
  return null;
}
