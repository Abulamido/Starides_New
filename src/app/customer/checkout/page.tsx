
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { MapsProvider } from '@/components/maps/maps-provider';
import { AddressAutocomplete } from '@/components/maps/address-autocomplete';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect } from 'react';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryLat, setDeliveryLat] = useState<number | null>(null);
  const [deliveryLng, setDeliveryLng] = useState<number | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(500);
  const [distance, setDistance] = useState<string | null>(null);
  const { user } = useUser();
  const firestore = useFirestore();

  // Calculate delivery fee when address changes
  useEffect(() => {
    const calculateFee = async () => {
      if (!deliveryLat || !deliveryLng || !cartItems.length || !firestore) return;

      try {
        // Get vendor location
        const vendorId = cartItems[0].product.vendorId;
        // Note: In a real app, we should query the vendor document by ID, not by user.uid if they differ.
        // Assuming vendorId in product matches the document ID in 'vendors' collection.
        // If vendorId is the auth UID, and document ID is also auth UID, then this is correct.
        // Let's verify data.ts: vendorId in Product is "Firebase Auth user.uid".
        // And in VendorSettings, we write to doc(firestore, 'vendors', user.uid).
        // So yes, vendorId is the document ID.

        const vendorDoc = await getDoc(doc(firestore, 'vendors', vendorId));
        if (vendorDoc.exists()) {
          const vendorData = vendorDoc.data();
          if (vendorData.location) {
            const vendorLat = vendorData.location.lat;
            const vendorLng = vendorData.location.lng;

            // Calculate distance using Google Maps Geometry Library
            // We need to access the google namespace. Since we are inside MapsProvider, it should be available if loaded.
            // However, accessing 'google' directly might be tricky if types aren't set up.
            // We can use a simple Haversine formula as a fallback or if the library isn't ready,
            // but since we are using Maps JS API, let's try to use it if available.

            if (window.google && window.google.maps && window.google.maps.geometry) {
              const from = new window.google.maps.LatLng(vendorLat, vendorLng);
              const to = new window.google.maps.LatLng(deliveryLat, deliveryLng);
              const distanceInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(from, to);
              const distanceInKm = distanceInMeters / 1000;

              // Pricing logic: Base 500 + 100 per km
              const calculatedFee = 500 + (Math.round(distanceInKm) * 100);
              setDeliveryFee(calculatedFee);
              setDistance(`${distanceInKm.toFixed(1)} km`);
            } else {
              // Fallback Haversine
              const R = 6371; // Radius of the earth in km
              const dLat = deg2rad(deliveryLat - vendorLat);
              const dLon = deg2rad(deliveryLng - vendorLng);
              const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(deg2rad(vendorLat)) * Math.cos(deg2rad(deliveryLat)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              const d = R * c; // Distance in km

              const calculatedFee = 500 + (Math.round(d) * 100);
              setDeliveryFee(calculatedFee);
              setDistance(`${d.toFixed(1)} km`);
            }
          }
        }
      } catch (error) {
        console.error("Error calculating distance:", error);
      }
    };

    calculateFee();
  }, [deliveryLat, deliveryLng, cartItems, firestore]);

  function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
  }

  const handlePlaceOrder = async () => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to place an order.',
      });
      return;
    }
    if (cartItems.length === 0) return;
    if (!deliveryAddress) {
      toast({
        variant: 'destructive',
        title: 'Missing Address',
        description: 'Please provide a delivery address.',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Assuming all items in cart are from the same vendor for this example
      const vendorId = cartItems[0].product.vendorId;

      // Create order document in Firestore
      const orderData = {
        customerId: user.uid,
        vendorId: vendorId,
        products: cartItems.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        totalAmount: cartTotal,
        deliveryFee: deliveryFee,
        deliveryAddress: deliveryAddress,
        deliveryLocation: deliveryLat && deliveryLng ? { lat: deliveryLat, lng: deliveryLng } : null,
        status: 'Processing',
        orderDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(firestore, 'orders'), orderData);

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
      console.error(error);
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
    <MapsProvider>
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
                <CardTitle>Delivery Details</CardTitle>
                <CardDescription>
                  Where should we send your order?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Delivery Address</Label>
                  <AddressAutocomplete
                    onSelect={(address, lat, lng) => {
                      setDeliveryAddress(address);
                      setDeliveryLat(lat);
                      setDeliveryLng(lng);
                    }}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

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
                  <span>Shipping {distance && <span className="text-xs text-muted-foreground">({distance})</span>}</span>
                  <span>₦{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>₦0.00</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Order Total</span>
                  <span>₦{(cartTotal + deliveryFee).toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={isLoading || !user}
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
    </MapsProvider>
  );
}
