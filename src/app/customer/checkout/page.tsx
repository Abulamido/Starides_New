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
  Wallet,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { createNotification, NotificationTemplates } from '@/lib/notifications';
import { sendPushNotification } from '@/app/actions/push';

import { MapsProvider } from '@/components/maps/maps-provider';
import { AddressAutocomplete } from '@/components/maps/address-autocomplete';
import { processWalletPayment, verifyTopUp } from '@/app/actions/wallet';
import { PaystackButton } from 'react-paystack';
import type { Wallet as WalletType } from '@/lib/data';

import { PAYSTACK_PUBLIC_KEY } from '@/config/paystack';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryLat, setDeliveryLat] = useState<number | null>(null);
  const [deliveryLng, setDeliveryLng] = useState<number | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(500);
  const [distance, setDistance] = useState<string | null>(null);
  const { user } = useUser();
  const firestore = useFirestore();

  // Fetch Wallet Balance
  const walletRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'wallets', user.uid);
  }, [firestore, user]);

  const { data: wallet, isLoading: isWalletLoading } = useDoc<WalletType>(walletRef);
  const walletBalance = wallet?.balance || 0;

  // Calculate delivery fee when address changes
  useEffect(() => {
    const calculateFee = async () => {
      if (!deliveryLat || !deliveryLng || !cartItems.length || !firestore) return;

      try {
        const vendorId = cartItems[0].product.vendorId;
        const vendorDoc = await getDoc(doc(firestore, 'vendors', vendorId));

        if (vendorDoc.exists()) {
          const vendorData = vendorDoc.data();
          if (vendorData.location) {
            const vendorLat = vendorData.location.lat;
            const vendorLng = vendorData.location.lng;

            if (window.google && window.google.maps && window.google.maps.geometry) {
              const from = new window.google.maps.LatLng(vendorLat, vendorLng);
              const to = new window.google.maps.LatLng(deliveryLat, deliveryLng);
              const distanceInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(from, to);
              const distanceInKm = distanceInMeters / 1000;

              const calculatedFee = 500 + (Math.round(distanceInKm) * 100);
              setDeliveryFee(calculatedFee);
              setDistance(`${distanceInKm.toFixed(1)} km`);
            } else {
              // Fallback Haversine
              const R = 6371;
              const dLat = deg2rad(deliveryLat - vendorLat);
              const dLon = deg2rad(deliveryLng - vendorLng);
              const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(deg2rad(vendorLat)) * Math.cos(deg2rad(deliveryLat)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              const d = R * c;

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

  const createOrder = async (status: 'Processing' | 'Pending Payment' = 'Processing') => {
    if (!user || !firestore) return;

    const vendorId = cartItems[0].product.vendorId;

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
      status: status,
      orderDate: serverTimestamp(),
      updatedAt: serverTimestamp(),
      paymentMethod: paymentMethod,
    };

    const docRef = await addDoc(collection(firestore, 'orders'), orderData);

    // Notify Vendor about new order
    await createNotification({
      userId: vendorId,
      ...NotificationTemplates.orderPlaced(docRef.id)
    });

    // Also send actual push notification to Vendor
    sendPushNotification({
      userId: vendorId,
      title: 'New Order! 🎉',
      body: `You have a new order #${docRef.id.slice(0, 8)}`,
      data: { orderId: docRef.id, type: 'order_placed' }
    });

    return docRef.id;
  };

  const handlePlaceOrder = async () => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in.' });
      return;
    }
    if (cartItems.length === 0) return;
    if (!deliveryAddress) {
      toast({ variant: 'destructive', title: 'Missing Address', description: 'Please provide a delivery address.' });
      return;
    }

    setIsLoading(true);
    try {
      const totalAmount = cartTotal + deliveryFee;

      if (paymentMethod === 'wallet') {
        if (walletBalance < totalAmount) {
          toast({ variant: 'destructive', title: 'Insufficient Balance', description: 'Please top up your wallet or choose another payment method.' });
          setIsLoading(false);
          return;
        }

        const orderId = await createOrder('Processing');
        if (!orderId) throw new Error('Failed to create order');

        const result = await processWalletPayment(user.uid, totalAmount, orderId);

        if (!result.success) {
          throw new Error(result.message);
        }

        toast({
          title: 'Order Placed!',
          description: 'Paid successfully with wallet.',
          action: <div className="p-1 rounded-full bg-green-500"><CheckCircle className="h-5 w-5 text-white" /></div>
        });
        clearCart();
        router.push('/customer/orders');

      } else if (paymentMethod === 'cash') {
        await createOrder('Processing');
        toast({
          title: 'Order Placed!',
          description: 'Order placed successfully (Cash on Delivery).',
          action: <div className="p-1 rounded-full bg-green-500"><CheckCircle className="h-5 w-5 text-white" /></div>
        });
        clearCart();
        router.push('/customer/orders');
      }

    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'There was a problem placing your order.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaystackSuccess = async (reference: any) => {
    setIsLoading(true);
    try {
      // CRITICAL FIX: Verify payment with Paystack before creating order
      const verifyResponse = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: reference.reference }),
      });

      const verificationResult = await verifyResponse.json();

      if (!verificationResult.success || verificationResult.data?.status !== 'success') {
        throw new Error('Payment verification failed. Please contact support.');
      }

      // Only create order after successful verification
      const orderId = await createOrder('Processing');

      toast({
        title: 'Order Placed!',
        description: 'Payment successful.',
        action: <div className="p-1 rounded-full bg-green-500"><CheckCircle className="h-5 w-5 text-white" /></div>
      });
      clearCart();
      router.push('/customer/orders');

    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Payment verification failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  const paystackConfig = {
    reference: (new Date()).getTime().toString(),
    email: user?.email || '',
    amount: (cartTotal + deliveryFee) * 100,
    publicKey: PAYSTACK_PUBLIC_KEY,
    channels: ['card'], // Force only card channel to be active
  };

  if (cartItems.length === 0 && !isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <ShoppingCart className="h-20 w-20 text-muted-foreground/30" />
        <h3 className="text-xl font-semibold">Your cart is empty</h3>
        <p className="text-muted-foreground">There's nothing to check out. Add some products first!</p>
        <Button onClick={() => router.push('/customer')}>Continue Shopping</Button>
      </div>
    );
  }

  const totalAmount = cartTotal + deliveryFee;

  return (
    <MapsProvider>
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
          <p className="text-muted-foreground">Confirm your order and complete the payment.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Details</CardTitle>
                <CardDescription>Where should we send your order?</CardDescription>
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
                      <Image src={product.image} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">Quantity: {quantity}</p>
                    </div>
                    <p className="font-medium">₦{(product.price * quantity).toFixed(2)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Choose how you'd like to pay.</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup defaultValue="wallet" className="grid grid-cols-1 gap-4 md:grid-cols-3" onValueChange={setPaymentMethod}>

                  {/* Wallet Option */}
                  <Label htmlFor="wallet" className={`flex flex-row md:flex-col items-center justify-between gap-4 rounded-md border p-4 hover:bg-accent has-[:checked]:border-primary ${walletBalance < totalAmount ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <RadioGroupItem value="wallet" id="wallet" disabled={walletBalance < totalAmount} className="sr-only" />
                    <div className="flex items-center gap-2 md:flex-col">
                      <Wallet className="h-6 w-6 md:mb-2" />
                      <span className="font-medium">Wallet</span>
                    </div>
                    <div className="flex flex-col items-end md:items-center">
                      <span className="text-xs text-muted-foreground">Bal: ₦{walletBalance.toLocaleString()}</span>
                      {walletBalance < totalAmount && <span className="text-xs text-red-500 font-bold">Insufficient</span>}
                    </div>
                  </Label>

                  {/* Cash Option */}
                  <Label htmlFor="cash" className="flex flex-row md:flex-col items-center justify-between gap-4 rounded-md border p-4 hover:bg-accent has-[:checked]:border-primary">
                    <RadioGroupItem value="cash" id="cash" className="sr-only" />
                    <div className="flex items-center gap-2 md:flex-col">
                      <Banknote className="h-6 w-6 md:mb-2" />
                      <span className="font-medium">Cash</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Pay on Delivery</span>
                  </Label>

                  {/* Card Option */}
                  <Label htmlFor="card" className="flex flex-row md:flex-col items-center justify-between gap-4 rounded-md border p-4 hover:bg-accent has-[:checked]:border-primary">
                    <RadioGroupItem value="card" id="card" className="sr-only" />
                    <div className="flex items-center gap-2 md:flex-col">
                      <CreditCard className="h-6 w-6 md:mb-2" />
                      <span className="font-medium">Card</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Paystack</span>
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
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Order Total</span>
                  <span>₦{totalAmount.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                {paymentMethod === 'card' ? (
                  <PaystackButton
                    {...paystackConfig}
                    text={isLoading ? "Processing..." : "Pay Now"}
                    onSuccess={handlePaystackSuccess}
                    onClose={() => { }}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium disabled:opacity-50"
                    disabled={isLoading || !user || !deliveryAddress}
                  />
                ) : (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={isLoading || !user}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Place Order
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MapsProvider>
  );
}
