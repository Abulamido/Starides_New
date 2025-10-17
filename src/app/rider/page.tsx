
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from '@/components/ui/card';
  import { Button } from '@/components/ui/button';
  import {
    Bike,
    DollarSign,
    Star,
    Clock,
    MapPin,
    ArrowRight,
  } from 'lucide-react';
  
  const stats = [
    {
      title: 'Total Earnings',
      value: '$2,150.50',
      change: '+$120.00 this week',
      icon: DollarSign,
    },
    {
      title: 'Completed Deliveries',
      value: '142',
      change: '+15 this week',
      icon: Bike,
    },
    {
      title: 'Your Rating',
      value: '4.9',
      change: 'Based on 88 reviews',
      icon: Star,
    },
    {
      title: 'Active Time',
      value: '32h 15m',
      change: 'this week',
      icon: Clock,
    },
  ];
  
  const availableDeliveries = [
    {
      id: 'DEL001',
      pickup: '123 Main St, Downtown',
      dropoff: '456 Oak Ave, Suburbia',
      payout: 15.5,
      distance: 5.2,
    },
    {
      id: 'DEL002',
      pickup: '789 Pine Ln, City Center',
      dropoff: '101 Maple Dr, Uptown',
      payout: 12.0,
      distance: 3.1,
    },
  ];
  
  const ongoingDelivery = {
    id: 'DEL003',
    status: 'En route to customer',
    pickup: '234 Elm St, Industrial Park',
    dropoff: '567 Birch Rd, Lakeside',
    eta: '12 minutes',
  };
  
  export default function RiderDashboard() {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rider Dashboard</h1>
          <p className="text-muted-foreground">
            Accept new deliveries and track your progress.
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
  
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Available Deliveries</CardTitle>
              <CardDescription>
                New delivery jobs available for you to accept.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex flex-col items-start gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">
                      {delivery.pickup} <ArrowRight className="mx-2 inline h-4 w-4" /> {delivery.dropoff}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-1 h-3 w-3" /> {delivery.distance} miles
                      <DollarSign className="ml-4 mr-1 h-3 w-3" /> Payout: ${delivery.payout.toFixed(2)}
                    </div>
                  </div>
                  <Button>Accept</Button>
                </div>
              ))}
            </CardContent>
          </Card>
  
          <Card>
            <CardHeader>
              <CardTitle>Ongoing Delivery</CardTitle>
              <CardDescription>Your current active job.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {ongoingDelivery.status}
                </p>
                <p className="text-sm text-muted-foreground">
                  ETA: {ongoingDelivery.eta}
                </p>
              </div>
              <div className="space-y-2">
                 <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary mt-1" />
                    <div>
                        <p className="text-xs text-muted-foreground">From</p>
                        <p className="font-medium">{ongoingDelivery.pickup}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-green-400 mt-1" />
                    <div>
                        <p className="text-xs text-muted-foreground">To</p>
                        <p className="font-medium">{ongoingDelivery.dropoff}</p>
                    </div>
                 </div>
              </div>
              <Button className="w-full">View Details on Map</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
