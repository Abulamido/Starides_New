'use client';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from '@/components/ui/card';
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
  import { Badge } from '@/components/ui/badge';
  import {
    Users,
    Store,
    CreditCard,
    Package,
    DollarSign,
    Activity,
    Bike,
    CheckCircle,
    ArrowRight,
  } from 'lucide-react';
import Link from 'next/link';
  
  const stats = [
    {
      title: 'Total Users',
      value: '1,250',
      icon: Users,
    },
    {
        title: 'Active Vendors',
        value: '231',
        icon: Store,
    },
    {
        title: 'Active Riders',
        value: '89',
        icon: Bike,
    },
    {
      title: 'Total Orders',
      value: '2,350',
      icon: Package,
    },
    {
      title: 'Completed',
      value: '2,150',
      icon: CheckCircle,
    },
    {
        title: 'Revenue',
        value: '$45,231',
        icon: DollarSign,
    },
  ];
  
  const recentOrders = [
    {
      orderId: 'ORD001',
      customer: 'John Doe',
      amount: 250.0,
      status: 'Delivered',
    },
    {
      orderId: 'ORD002',
      customer: 'Jane Smith',
      amount: 150.75,
      status: 'Processing',
    },
    {
      orderId: 'ORD003',
      customer: 'Alex Ray',
      amount: 75.0,
      status: 'Shipped',
    },
    {
      orderId: 'ORD004',
      customer: 'Liam Chen',
      amount: 300.5,
      status: 'Delivered',
    },
    {
      orderId: 'ORD005',
      customer: 'Olivia Green',
      amount: 99.99,
      status: 'Canceled',
    },
  ];
  
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  export default function AdminDashboard() {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Oversee and manage all platform activities.
          </p>
        </div>
  
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
  
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Platform Analytics
                </CardTitle>
                <CardDescription>View platform insights and reports</CardDescription>
                </CardHeader>
                <CardContent>
                <Link href="/admin/analytics" className="flex items-center text-sm font-medium text-primary hover:underline">
                    View Analytics <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Manage Orders
                </CardTitle>
                <CardDescription>25 new orders to process</CardDescription>
                </CardHeader>
                <CardContent>
                <Link href="/admin/orders" className="flex items-center text-sm font-medium text-primary hover:underline">
                    View Orders <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
                </CardContent>
            </Card>
        </div>
        
        <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>A list of the latest platform orders.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.orderId} className='border-b-border/20'>
                      <TableCell className="font-medium">{order.orderId}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell className="text-right">${order.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={'outline'} className={`border-none capitalize ${getStatusBadgeColor(order.status)}`}>{order.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      </div>
    );
  }
