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
    Package,
    DollarSign,
    Activity,
    CreditCard,
    Clock,
    CheckCircle,
    ArrowRight,
    Store,
  } from 'lucide-react';
  import Link from 'next/link';

  
  const stats = [
    {
      title: 'Total Orders',
      value: '2',
      icon: Package,
    },
    {
      title: 'Pending',
      value: '0',
      icon: Clock,
    },
    {
      title: 'Completed',
      value: '2',
      icon: CheckCircle,
    },
    {
      title: 'Revenue',
      value: '$13,510',
      icon: DollarSign,
    },
  ];
    
  const recentOrders = [
    {
      orderId: '#68fdd589',
      items: 1,
      amount: 9005.00,
      status: 'Delivered',
    },
    {
      orderId: '#68fdd590',
      items: 2,
      amount: 4505.00,
      status: 'Delivered',
    },
  ];
  
  type StatusVariant = 'default' | 'secondary' | 'destructive' | 'outline';
  
  const getStatusVariant = (status: string): StatusVariant => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'default';
      case 'shipped':
        return 'outline';
      case 'processing':
        return 'secondary';
      case 'canceled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  
  export default function VendorDashboard() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">ABU EATS</h1>
            <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">Approved</Badge>
                <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700">Active</Badge>
            </div>
          </div>
        </div>
  
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
  
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Manage Products
              </CardTitle>
              <CardDescription>1 of 1 products active</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/vendor/products" className="flex items-center text-sm font-medium text-primary hover:underline">
                View Products <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                View Orders
              </CardTitle>
              <CardDescription>0 pending orders to process</CardDescription>
            </CardHeader>
            <CardContent>
               <Link href="/vendor/orders" className="flex items-center text-sm font-medium text-primary hover:underline">
                View Orders <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>

         <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.orderId} className='border-b-border/20'>
                      <TableCell>
                        <div className="font-medium">Order {order.orderId}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.items} items &bull; ${order.amount.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={`border-none ${getStatusBadgeColor(order.status)}`}>
                          {order.status}
                        </Badge>
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
