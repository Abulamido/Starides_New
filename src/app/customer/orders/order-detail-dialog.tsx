'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, MapPin, Calendar, Package } from 'lucide-react';
import type { Order } from '@/lib/data';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { OrderTrackingMap } from '@/components/order-tracking-map';
import { MapsProvider } from '@/components/maps/maps-provider';

interface OrderDetailDialogProps {
    order: Order | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Delivered':
            return 'default';
        case 'Ready for Pickup':
        case 'In Transit':
        case 'Shipped':
        case 'Out for Delivery':
            return 'outline';
        case 'New Order':
        case 'Pending Acceptance':
        case 'Preparing':
        case 'Processing':
        case 'Accepted':
            return 'secondary';
        case 'Canceled':
            return 'destructive';
        default:
            return 'secondary';
    }
};

export function OrderDetailDialog({ order, open, onOpenChange }: OrderDetailDialogProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isReordering, setIsReordering] = useState(false);

    if (!order) return null;

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return format(date, 'PPP p');
    };

    const handleReorder = () => {
        setIsReordering(true);
        toast({
            title: 'Items added to cart',
            description: 'Your previous order items have been added to your cart.',
        });
        router.push('/customer/checkout');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Order Details</DialogTitle>
                    <DialogDescription>Order ID: {order.id}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                {formatDate(order.orderDate)}
                            </span>
                        </div>
                        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                    </div>

                    <Separator />

                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4" />
                            <h3 className="font-semibold">Delivery Address</h3>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                            {order.deliveryAddress || 'No address provided'}
                        </p>
                    </div>

                    {order.status === 'In Transit' && order.deliveryLocation && (
                        <>
                            <Separator />
                            <MapsProvider>
                                <OrderTrackingMap order={order} />
                            </MapsProvider>
                        </>
                    )}

                    <Separator />

                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="h-4 w-4" />
                            <h3 className="font-semibold">Items ({order.products.length})</h3>
                        </div>
                        <div className="space-y-3">
                            {order.products.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Qty: {item.quantity} × ₦{item.price.toFixed(2)}
                                        </p>
                                    </div>
                                    <p className="font-semibold">
                                        ₦{(item.quantity * item.price).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>₦{order.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Delivery Fee</span>
                            <span>₦{(order.deliveryFee || 0).toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>₦{(order.totalAmount + (order.deliveryFee || 0)).toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Order Tracking Map for In Transit Orders */}
                    {order.status === 'In Transit' && (
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Live Tracking
                            </h3>
                            <MapsProvider>
                                <OrderTrackingMap order={order} />
                            </MapsProvider>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleReorder}
                            disabled={isReordering}
                        >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Reorder
                        </Button>
                        {(order.status === 'New Order' || order.status === 'Pending Acceptance') && (
                            <Button variant="destructive" className="flex-1">
                                Cancel Order
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
