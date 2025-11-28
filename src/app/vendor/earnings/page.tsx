'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Loader2, DollarSign, TrendingUp, Clock, CheckCircle, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import type { Order } from '@/lib/data';
import { PayoutRequestDialog } from '@/components/payouts/payout-request-dialog';
import { PayoutRequest } from '@/app/actions/payouts';

export default function VendorEarningsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  // Query all orders for this vendor
  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'orders'),
      where('vendorId', '==', user.uid),
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
  const totalEarnings = orders?.reduce((acc, order) => {
    if (order.status === 'Delivered') {
      return acc + order.totalAmount;
    }
    return acc;
  }, 0) || 0;

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
  const completedOrdersCount = orders?.filter(o => o.status === 'Delivered').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
          <p className="text-muted-foreground">Track your revenue and payouts</p>
        </div>
        {user && (
          <PayoutRequestDialog
            userId={user.uid}
            userType="vendor"
            availableBalance={availableBalance}
            // In a real app, we'd fetch bank details from vendor profile
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
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings
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
            <CardTitle className="text-sm font-medium">Orders Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrdersCount}</div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
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

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders?.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.orderDate?.toDate ? format(order.orderDate.toDate(), 'PPP') : 'Date N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₦{order.totalAmount.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'Delivered'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
              {(!orders || orders.length === 0) && (
                <p className="text-center text-muted-foreground py-8">No transactions yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
