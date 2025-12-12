'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Users,
  Store,
  Bike,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Clock,
  Award
} from "lucide-react";
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
import { useState, useEffect, useMemo } from 'react';
import type { Order } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

type TimeRange = '7d' | '30d' | '90d' | 'all';

interface AnalyticsData {
  totalRevenue: number;
  previousRevenue: number;
  totalOrders: number;
  previousOrders: number;
  avgOrderValue: number;
  activeUsers: number;
  vendorCount: number;
  riderCount: number;
  ordersByStatus: { status: string; count: number; color: string }[];
  revenueByDay: { date: string; revenue: number }[];
  topVendors: { name: string; revenue: number; orders: number }[];
  ordersByHour: { hour: number; count: number }[];
  categoryRevenue: { category: string; revenue: number }[];
}

export default function AdminAnalyticsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalRevenue: 0,
    previousRevenue: 0,
    totalOrders: 0,
    previousOrders: 0,
    avgOrderValue: 0,
    activeUsers: 0,
    vendorCount: 0,
    riderCount: 0,
    ordersByStatus: [],
    revenueByDay: [],
    topVendors: [],
    ordersByHour: [],
    categoryRevenue: [],
  });

  const getDateRange = (range: TimeRange) => {
    const now = new Date();
    const start = new Date();

    switch (range) {
      case '7d':
        start.setDate(now.getDate() - 7);
        break;
      case '30d':
        start.setDate(now.getDate() - 30);
        break;
      case '90d':
        start.setDate(now.getDate() - 90);
        break;
      case 'all':
        start.setFullYear(2020, 0, 1); // Far back date
        break;
    }

    return { start, end: now };
  };

  const getPreviousDateRange = (range: TimeRange) => {
    const { start, end } = getDateRange(range);
    const duration = end.getTime() - start.getTime();
    const previousEnd = new Date(start.getTime());
    const previousStart = new Date(start.getTime() - duration);

    return { start: previousStart, end: previousEnd };
  };

  useEffect(() => {
    if (!firestore || !user) return;

    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const { start, end } = getDateRange(timeRange);
        const { start: prevStart, end: prevEnd } = getPreviousDateRange(timeRange);

        // Fetch orders for current period
        const ordersRef = collection(firestore, 'orders');
        const ordersQuery = query(
          ordersRef,
          where('orderDate', '>=', Timestamp.fromDate(start)),
          where('orderDate', '<=', Timestamp.fromDate(end))
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));

        // Fetch orders for previous period (for comparison)
        const prevOrdersQuery = query(
          ordersRef,
          where('orderDate', '>=', Timestamp.fromDate(prevStart)),
          where('orderDate', '<=', Timestamp.fromDate(prevEnd))
        );
        const prevOrdersSnapshot = await getDocs(prevOrdersQuery);
        const prevOrders = prevOrdersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));

        // Calculate revenue
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const previousRevenue = prevOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        // Calculate orders
        const totalOrders = orders.length;
        const previousOrders = prevOrders.length;

        // Average order value
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Orders by status
        const statusCounts = new Map<string, number>();
        const statusColors: Record<string, string> = {
          'New Order': '#3b82f6',
          'Pending Acceptance': '#f59e0b',
          'Preparing': '#8b5cf6',
          'Ready for Pickup': '#06b6d4',
          'In Transit': '#10b981',
          'Delivered': '#22c55e',
          'Canceled': '#ef4444',
        };

        orders.forEach(order => {
          statusCounts.set(order.status, (statusCounts.get(order.status) || 0) + 1);
        });

        const ordersByStatus = Array.from(statusCounts.entries()).map(([status, count]) => ({
          status,
          count,
          color: statusColors[status] || '#6b7280',
        }));

        // Revenue by day
        const revenueByDayMap = new Map<string, number>();
        orders.forEach(order => {
          const date = order.orderDate?.toDate?.() || new Date();
          const dateKey = date.toISOString().split('T')[0];
          revenueByDayMap.set(dateKey, (revenueByDayMap.get(dateKey) || 0) + (order.totalAmount || 0));
        });

        const revenueByDay = Array.from(revenueByDayMap.entries())
          .map(([date, revenue]) => ({ date, revenue }))
          .sort((a, b) => a.date.localeCompare(b.date));

        // Top vendors by revenue
        const vendorRevenueMap = new Map<string, { revenue: number; orders: number; name: string }>();

        for (const order of orders) {
          if (!order.vendorId) continue;

          const current = vendorRevenueMap.get(order.vendorId) || { revenue: 0, orders: 0, name: '' };
          current.revenue += order.totalAmount || 0;
          current.orders += 1;

          // Fetch vendor name if not already fetched
          if (!current.name) {
            try {
              const vendorDoc = await getDocs(query(collection(firestore, 'vendors'), where('userId', '==', order.vendorId), limit(1)));
              current.name = vendorDoc.docs[0]?.data()?.name || `Vendor ${order.vendorId.slice(0, 6)}`;
            } catch {
              current.name = `Vendor ${order.vendorId.slice(0, 6)}`;
            }
          }

          vendorRevenueMap.set(order.vendorId, current);
        }

        const topVendors = Array.from(vendorRevenueMap.values())
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // Orders by hour
        const hourCounts = new Array(24).fill(0);
        orders.forEach(order => {
          const date = order.orderDate?.toDate?.() || new Date();
          const hour = date.getHours();
          hourCounts[hour]++;
        });

        const ordersByHour = hourCounts.map((count, hour) => ({ hour, count }));

        // Fetch vendor and rider counts
        const vendorsSnapshot = await getDocs(collection(firestore, 'vendors'));
        const ridersSnapshot = await getDocs(collection(firestore, 'riders'));
        const usersSnapshot = await getDocs(collection(firestore, 'users'));

        setAnalyticsData({
          totalRevenue,
          previousRevenue,
          totalOrders,
          previousOrders,
          avgOrderValue,
          activeUsers: usersSnapshot.size,
          vendorCount: vendorsSnapshot.size,
          riderCount: ridersSnapshot.size,
          ordersByStatus,
          revenueByDay,
          topVendors,
          ordersByHour,
          categoryRevenue: [], // Can be implemented if vendor categories are tracked
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [firestore, user, timeRange]);

  const revenueChange = analyticsData.previousRevenue > 0
    ? ((analyticsData.totalRevenue - analyticsData.previousRevenue) / analyticsData.previousRevenue) * 100
    : 0;

  const ordersChange = analyticsData.previousOrders > 0
    ? ((analyticsData.totalOrders - analyticsData.previousOrders) / analyticsData.previousOrders) * 100
    : 0;

  const maxRevenueDay = Math.max(...analyticsData.revenueByDay.map(d => d.revenue), 1);
  const maxOrderHour = Math.max(...analyticsData.ordersByHour.map(h => h.count), 1);
  const maxVendorRevenue = Math.max(...analyticsData.topVendors.map(v => v.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
          <p className="text-muted-foreground">
            Review key metrics and performance indicators for the entire platform.
          </p>
        </div>

        {/* Time Range Filter */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeRange === range
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
            >
              {range === '7d' && '7 Days'}
              {range === '30d' && '30 Days'}
              {range === '90d' && '90 Days'}
              {range === 'all' && 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">₦{analyticsData.totalRevenue.toLocaleString()}</div>
                <div className={`flex items-center text-xs ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(revenueChange).toFixed(1)}% from previous period
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">{analyticsData.totalOrders.toLocaleString()}</div>
                <div className={`flex items-center text-xs ${ordersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {ordersChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(ordersChange).toFixed(1)}% from previous period
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">₦{analyticsData.avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                <p className="text-xs text-muted-foreground">Per order average</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">{analyticsData.activeUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total registered users</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Store className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">{analyticsData.vendorCount.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Riders</CardTitle>
            <Bike className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">{analyticsData.riderCount.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Daily revenue over selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : analyticsData.revenueByDay.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No data available
              </div>
            ) : (
              <div className="h-64 flex items-end gap-1">
                {analyticsData.revenueByDay.map((day, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="relative w-full">
                      <div
                        className="w-full bg-primary rounded-t transition-all hover:opacity-80"
                        style={{ height: `${(day.revenue / maxRevenueDay) * 200}px` }}
                        title={`${day.date}: ₦${day.revenue.toLocaleString()}`}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(day.date).getDate()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>Breakdown of orders by status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : analyticsData.ordersByStatus.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No orders yet
              </div>
            ) : (
              <div className="space-y-3">
                {analyticsData.ordersByStatus.map((item) => (
                  <div key={item.status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.status}</span>
                      <span className="text-muted-foreground">{item.count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(item.count / analyticsData.totalOrders) * 100}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Vendors */}
        <Card>
          <CardHeader>
            <CardTitle>Top Vendors by Revenue</CardTitle>
            <CardDescription>Best performing vendors</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : analyticsData.topVendors.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No vendor data
              </div>
            ) : (
              <div className="space-y-4">
                {analyticsData.topVendors.map((vendor, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{vendor.name}</span>
                      </div>
                      <span className="text-muted-foreground">₦{vendor.revenue.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                        style={{ width: `${(vendor.revenue / maxVendorRevenue) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{vendor.orders} orders</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders by Hour */}
        <Card>
          <CardHeader>
            <CardTitle>Order Volume by Hour</CardTitle>
            <CardDescription>Peak ordering times</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64 flex items-end gap-0.5">
                {analyticsData.ordersByHour.map((hourData) => (
                  <div key={hourData.hour} className="flex-1 flex flex-col items-center gap-1 group">
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                      style={{ height: `${(hourData.count / maxOrderHour) * 200}px` }}
                      title={`${hourData.hour}:00 - ${hourData.count} orders`}
                    />
                    {hourData.hour % 3 === 0 && (
                      <span className="text-[9px] text-muted-foreground">{hourData.hour}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
