
'use client';

import { useCart } from '@/context/cart-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Banknote,
  CreditCard,
  Loader2,
  ShoppingCart,
  CheckCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { placeOrder } from '@/app/actions';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would pass order details to the action
      await placeOrder({
        items: cartItems.map(item => ({ id: item.product.id, quantity: item.quantity })),
        total: cartTotal,
        customer: 'John Doe'
      });
      
      toast({
        title: 'Order Placed!',
        description: 'Your order has been successfully placed.',
        action: (
           <div className="p-1 rounded-full bg-green-500">
             <CheckCircle className="h-5 w-5 text-white" />
           </div>
        )
      });
      clearCart();
      router.push('/customer/orders');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem placing your order.',
      });
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0 && !isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <ShoppingCart className="h-20 w-20 text-muted-foreground/30" />
        <h3 className="text-xl font-semibold">Your cart is empty</h3>
        <p className="text-muted-foreground">
          There's nothing to check out. Add some products first!
        </p>
        <Button onClick={() => router.push('/customer')}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="text-muted-foreground">
          Confirm your order and complete the payment.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    ₦{(product.price * quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Choose how you'd like to pay.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                defaultValue="cash"
                className="grid grid-cols-1 gap-4 md:grid-cols-2"
                onValueChange={setPaymentMethod}
              >
                <Label htmlFor="cash" className="flex items-center gap-4 rounded-md border p-4 hover:bg-accent has-[:checked]:border-primary">
                   <RadioGroupItem value="cash" id="cash" />
                   <div className='flex items-center gap-2'>
                     <Banknote className="h-6 w-6" />
                     <span className="font-medium">Cash on Delivery</span>
                   </div>
                </Label>
                <Label htmlFor="card" className="flex items-center gap-4 rounded-md border p-4 text-muted-foreground hover:bg-accent has-[:checked]:border-primary has-[:checked]:text-foreground">
                    <RadioGroupItem value="card" id="card" disabled />
                    <div className='flex items-center gap-2'>
                        <CreditCard className="h-6 w-6" />
                        <span className="font-medium">Credit Card (Coming Soon)</span>
                    </div>
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Total</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₦{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₦0.00</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes</span>
                <span>₦0.00</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Order Total</span>
                <span>₦{cartTotal.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Place Order
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
