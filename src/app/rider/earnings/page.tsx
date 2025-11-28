'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Loader2, DollarSign, Bike, Calendar, Clock, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import type { Order } from '@/lib/data';
import { PayoutRequestDialog } from '@/components/payouts/payout-request-dialog';
import { PayoutRequest } from '@/app/actions/payouts';

export default function RiderEarningsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  // Query all orders for this rider
  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'orders'),
      where('riderId', '==', user.uid),
      orderBy('orderDate', 'desc')
    );
  }, [firestore, user]);

  const { data: orders, isLoading: isOrdersLoading } = useCollection<Order>(ordersQuery);

  // Query payout history
  const payoutsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'payouts'),
      where('userId', '==', user.uid),
      orderBy('requestedAt', 'desc')
    );
  }, [firestore, user]);

  const { data: payouts, isLoading: isPayoutsLoading } = useCollection<PayoutRequest>(payoutsQuery);

  if (isUserLoading || isOrdersLoading || isPayoutsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate stats
  const completedOrders = orders?.filter(o => o.status === 'Delivered') || [];

  const totalEarnings = completedOrders.reduce((acc, order) => {
    return acc + (order.deliveryFee || 500); // Default to 500 if undefined
  }, 0);

  const totalWithdrawn = payouts?.reduce((acc, payout) => {
    if (payout.status === 'processed') {
      return acc + payout.amount;
    }
    return acc;
  }, 0) || 0;

  const pendingPayoutsAmount = payouts?.reduce((acc, payout) => {
    if (payout.status === 'pending') {
      return acc + payout.amount;
    }
    return acc;
  }, 0) || 0;

  const availableBalance = totalEarnings - totalWithdrawn - pendingPayoutsAmount;
  const deliveriesCount = completedOrders.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
          <p className="text-muted-foreground">Track your delivery income</p>
        </div>
        {user && (
          <PayoutRequestDialog
            userId={user.uid}
            userType="rider"
            availableBalance={availableBalance}
            // In a real app, we'd fetch bank details from rider profile
            bankDetails={{ bankName: '', accountNumber: '', accountName: '' }}
          />
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₦{availableBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Ready for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {deliveriesCount} completed deliveries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{pendingPayoutsAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Processing requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deliveries Completed</CardTitle>
            <Bike className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveriesCount}</div>
            <p className="text-xs text-muted-foreground">
              Successful drop-offs
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Payout History */}
        <Card>
          <CardHeader>
            <CardTitle>Payout History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payouts?.slice(0, 5).map((payout) => (
                <div key={payout.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Payout Request</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${payout.status === 'processed' ? 'bg-green-100 text-green-800' :
                        payout.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                        {payout.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {payout.requestedAt?.toDate ? format(payout.requestedAt.toDate(), 'PPP') : 'Date N/A'}
                    </p>
                  </div>
                  <div className="text-right font-medium">
                    ₦{payout.amount.toFixed(2)}
                  </div>
                </div>
              ))}
              {(!payouts || payouts.length === 0) && (
                <p className="text-center text-muted-foreground py-8">No payout requests yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Deliveries */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedOrders.slice(0, 10).map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {order.orderDate?.toDate ? format(order.orderDate.toDate(), 'PPP p') : 'Date N/A'}
                    </div>
                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {order.deliveryAddress}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">+₦{(order.deliveryFee || 500).toFixed(2)}</p>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Paid
                    </span>
                  </div>
                </div>
              ))}
              {completedOrders.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No completed deliveries yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
function TrendingUp({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}
