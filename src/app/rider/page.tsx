'use client';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Bike,
    Package,
    DollarSign,
    ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

  
  const stats = [
    {
      title: 'Active',
      value: '0',
      icon: Package,
    },
    {
      title: 'Completed',
      value: '2',
      icon: Bike,
    },
    {
      title: 'Earnings',
      value: '$10.00',
      icon: DollarSign,
    },
  ];
    
  const recentDeliveries = [
    {
      deliveryId: '#68fdd589',
      fee: 5.00,
      status: 'delivered',
    },
    {
      deliveryId: '#68fc9b23',
      fee: 5.00,
      status: 'delivered',
    },
  ];
  
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'en route':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  
  export default function RiderDashboard() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Rider Dashboard</h1>
            <p className="text-muted-foreground">Abu</p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="online-status" />
            <Label htmlFor="online-status" className="text-green-600 font-medium">Online</Label>
          </div>
        </div>
  
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

        <Card>
            <CardHeader>
                <CardTitle>View Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/rider/deliveries" className="flex items-center justify-between text-sm text-muted-foreground hover:text-primary">
                <span>0 active deliveries waiting</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

         <Card>
            <CardHeader>
              <CardTitle>Recent Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {recentDeliveries.map((delivery) => (
                    <TableRow key={delivery.deliveryId} className='border-b-border/20'>
                      <TableCell>
                        <div className="font-medium">Delivery {delivery.deliveryId}</div>
                        <div className="text-sm text-muted-foreground">
                          ${delivery.fee.toFixed(2)} fee
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={`border-none capitalize ${getStatusBadgeColor(delivery.status)}`}>
                          {delivery.status}
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
