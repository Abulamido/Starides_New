'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Loader2, Wallet, CreditCard, Plus, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { Order } from '@/lib/data';

export default function CustomerWalletPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  // Query orders to simulate transaction history
  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'orders'),
      where('customerId', '==', user.uid),
      orderBy('orderDate', 'desc')
    );
  }, [firestore, user]);

  const { data: orders, isLoading: isOrdersLoading } = useCollection<Order>(ordersQuery);

  if (isUserLoading || isOrdersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Simulate wallet balance (mock data for now)
  const walletBalance = 15000.00;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Wallet</h1>
        <p className="text-muted-foreground">Manage your payment methods and balance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Balance Card */}
        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-sm font-medium opacity-90">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">₦{walletBalance.toLocaleString()}</div>
            <Button variant="secondary" className="w-full sm:w-auto gap-2">
              <Plus className="h-4 w-4" />
              Top Up Wallet
            </Button>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your saved cards</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Mastercard ending in 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 12/25</p>
                </div>
              </div>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Default</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Visa ending in 1234</p>
                  <p className="text-xs text-muted-foreground">Expires 08/26</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent payments and top-ups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Mock Top-up */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <ArrowDownLeft className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Wallet Top-up</p>
                  <p className="text-xs text-muted-foreground">Nov 23, 2025 • 10:30 AM</p>
                </div>
              </div>
              <p className="font-medium text-green-600">+₦5,000.00</p>
            </div>

            {/* Orders as Transactions */}
            {orders?.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Payment for Order #{order.id.slice(0, 6)}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.orderDate?.toDate ? format(order.orderDate.toDate(), 'PPP p') : 'Date N/A'}
                    </p>
                  </div>
                </div>
                <p className="font-medium text-foreground">-₦{order.totalAmount.toLocaleString()}</p>
              </div>
            ))}

            {(!orders || orders.length === 0) && (
              <p className="text-center text-muted-foreground py-8">No transactions yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
