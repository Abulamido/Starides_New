'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Loader2, TrendingUp, Package, DollarSign, ShoppingCart } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import type { Order } from '@/lib/data';

export default function VendorAnalyticsPage() {
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

  if (isUserLoading || isOrdersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate analytics
  const now = new Date();

  const totalRevenue = orders?.reduce((acc, order) => {
    if (order.status === 'Delivered') {
      return acc + order.totalAmount;
    }
    return acc;
  }, 0) || 0;

  const totalOrders = orders?.length || 0;
  const completedOrders = orders?.filter(o => o.status === 'Delivered').length || 0;
  const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

  // Revenue by day (last 7 days)
  const revenueByDay = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(now, 6 - i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const dayRevenue = orders?.reduce((acc, order) => {
      if (order.status === 'Delivered' && order.orderDate?.toDate) {
        const orderDate = order.orderDate.toDate();
        if (orderDate >= dayStart && orderDate <= dayEnd) {
          return acc + order.totalAmount;
        }
      }
      return acc;
    }, 0) || 0;

    return {
      date: format(date, 'EEE'),
      revenue: dayRevenue,
    };
  });

  const maxRevenue = Math.max(...revenueByDay.map(d => d.revenue), 1);

  // Top products by quantity sold
  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();

  orders?.forEach(order => {
    if (order.status === 'Delivered' && order.products && Array.isArray(order.products)) {
      order.products.forEach(item => {
        const existing = productSales.get(item.id) || { name: item.name, quantity: 0, revenue: 0 };
        productSales.set(item.id, {
          name: item.name,
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + (item.price * item.quantity),
        });
      });
    }
  });

  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Track your sales performance and insights</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From {completedOrders} completed orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {completedOrders} delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{averageOrderValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              Per completed order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Orders successfully delivered
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {revenueByDay.map((day, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 text-sm text-muted-foreground">{day.date}</div>
                  <div className="flex-1">
                    <div className="h-8 bg-muted rounded-md overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-24 text-sm font-medium text-right">
                    ₦{day.revenue.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>By revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.quantity} sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₦{product.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No sales data yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
