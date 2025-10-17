
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
  } from 'lucide-react';
  import {
    Line,
    LineChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
  } from 'recharts';
  
  const stats = [
    {
      title: 'Total Revenue',
      value: '$12,345.67',
      change: '+12.5% this month',
      icon: DollarSign,
    },
    {
      title: 'Total Orders',
      value: '542',
      change: '+8.2% this month',
      icon: Package,
    },
    {
      title: 'Pending Orders',
      value: '12',
      change: 'Needs attention',
      icon: Activity,
    },
    {
      title: 'New Customers',
      value: '38',
      change: '+5 this week',
      icon: Users,
    },
  ];
  
  const salesData = [
    { date: '2023-10-01', sales: 240 },
    { date: '2023-10-02', sales: 138 },
    { date: '2023-10-03', sales: 980 },
    { date: '2023-10-04', sales: 398 },
    { date: '2023-10-05', sales: 480 },
    { date: '2023-10-06', sales: 380 },
    { date: '2023-10-07', sales: 430 },
  ];
  
  const recentOrders = [
    {
      orderId: 'ORD-V001',
      customer: 'Alice Johnson',
      amount: 89.99,
      status: 'Processing',
    },
    {
      orderId: 'ORD-V002',
      customer: 'Bob Williams',
      amount: 45.0,
      status: 'Shipped',
    },
    {
      orderId: 'ORD-V003',
      customer: 'Charlie Brown',
      amount: 199.5,
      status: 'Shipped',
    },
    {
      orderId: 'ORD-V004',
      customer: 'Diana Prince',
      amount: 32.75,
      status: 'Processing',
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
  
  export default function VendorDashboard() {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendor Dashboard</h1>
          <p className="text-muted-foreground">
            Here's an overview of your store's performance.
          </p>
        </div>
  
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>
  
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Sales This Week</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={salesData}>
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    }
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    strokeWidth={2}
                    stroke="hsl(var(--primary))"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Your most recent orders that need attention.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.orderId}>
                      <TableCell>
                        <div className="font-medium">{order.customer}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.orderId}
                        </div>
                      </TableCell>
                       <TableCell className="text-center">
                        <Badge variant={getStatusVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ${order.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
