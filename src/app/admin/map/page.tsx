'use client';

import { GoogleMap, Marker } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { AdminRider } from '@/lib/data';
import { MapsProvider } from '@/components/maps/maps-provider';
import { MapPin, Bike } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

const defaultCenter = {
  lat: 6.5244, // Lagos, Nigeria
  lng: 3.3792,
};

function LiveMapContent() {
  const firestore = useFirestore();
  const { user } = useUser();

  const ridersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'riders');
  }, [firestore, user]);

  const { data: riders } = useCollection<AdminRider>(ridersQuery);

  // Filter only online riders with location
  const onlineRiders = riders?.filter(r =>
    r.onlineStatus === 'Online' && (r as any).location
  ) || [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Live Map</h1>
        <p className="text-muted-foreground">
          Track active riders and deliveries in real-time.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Riders</CardTitle>
            <Bike className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onlineRiders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Riders</CardTitle>
            <Bike className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riders?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Live Delivery Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={defaultCenter}
            zoom={12}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
            }}
          >
            {/* Render online riders */}
            {onlineRiders.map((rider) => {
              const riderWithLocation = rider as any;
              return (
                <Marker
                  key={rider.id}
                  position={{ lat: riderWithLocation.location.lat, lng: riderWithLocation.location.lng }}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 12,
                    fillColor: '#3b82f6',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 3,
                  }}
                  label={{
                    text: '🏍️',
                    fontSize: '24px',
                  }}
                  title={rider.name}
                />
              );
            })}
          </GoogleMap>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Bike className="h-4 w-4 text-blue-600" />
              <span>Online Rider</span>
              <Badge variant="outline">{onlineRiders.length}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminMapPage() {
  return (
    <MapsProvider>
      <LiveMapContent />
    </MapsProvider>
  );
}
