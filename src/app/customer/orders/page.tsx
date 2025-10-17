'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, FileText } from 'lucide-react';

const orders = [
    {
      id: 'ORD001',
      date: '2023-10-26',
      status: 'Delivered',
      total: 129.98,
      items: 2,
    },
    {
      id: 'ORD002',
      date: '2023-10-24',
      status: 'Shipped',
      total: 85.00,
      items: 1,
    },
    {
      id: 'ORD003',
      date: '2023-10-20',
      status: 'Processing',
      total: 499.00,
      items: 1,
    },
    {
      id: 'ORD004',
      date: '2023-10-15',
      status: 'Delivered',
      total: 270.50,
      items: 3,
    },
    {
      id: 'ORD005',
      date: '2023-09-30',
      status: 'Canceled',
      total: 99.99,
      items: 1,
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

export default function MyOrdersPage() {
  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
            <p className="text-muted-foreground">Review your past orders and their statuses.</p>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>A list of your recent orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>{order.items}</TableCell>
                  <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                        </Button>
                         <Button variant="ghost" size="icon" className="h-8 w-8">
                            <FileText className="h-4 w-4" />
                             <span className="sr-only">View Invoice</span>
                        </Button>
                    </div>
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
