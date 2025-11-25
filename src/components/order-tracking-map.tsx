'use client';

import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Store, Home, Bike, Clock } from 'lucide-react';
import type { Order } from '@/lib/data';

interface OrderTrackingMapProps {
    order: Order;
}

const mapContainerStyle = {
    width: '100%',
    height: '400px',
};

const defaultCenter = {
    lat: 6.5244, // Lagos, Nigeria
    lng: 3.3792,
};

export function OrderTrackingMap({ order }: OrderTrackingMapProps) {
    const [center, setCenter] = useState(defaultCenter);
    const [zoom, setZoom] = useState(13);

    // Extract locations
    const deliveryLocation = order.deliveryLocation;
    const riderLocation = order.riderLocation;

    useEffect(() => {
        // Center map on delivery location or rider location
        if (riderLocation) {
            setCenter({ lat: riderLocation.lat, lng: riderLocation.lng });
            setZoom(15);
        } else if (deliveryLocation) {
            setCenter({ lat: deliveryLocation.lat, lng: deliveryLocation.lng });
            setZoom(14);
        }
    }, [riderLocation, deliveryLocation]);

    // Calculate ETA (simplified - in real app use Google Distance Matrix API)
    const calculateETA = () => {
        if (!riderLocation || !deliveryLocation) return null;

        const R = 6371; // Earth's radius in km
        const dLat = (deliveryLocation.lat - riderLocation.lat) * (Math.PI / 180);
        const dLon = (deliveryLocation.lng - riderLocation.lng) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(riderLocation.lat * (Math.PI / 180)) *
            Math.cos(deliveryLocation.lat * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km

        // Assume average speed of 30 km/h
        const eta = Math.round((distance / 30) * 60); // Convert to minutes
        return eta;
    };

    const eta = calculateETA();

    return (
        <div className="space-y-4">
            {/* ETA Display */}
            {riderLocation && eta !== null && (
                <Card>
                    <CardContent className="flex items-center gap-3 py-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Estimated Arrival</p>
                            <p className="text-lg font-semibold">
                                {eta < 1 ? 'Arriving soon!' : `${eta} minutes`}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Map */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Live Tracking
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={center}
                        zoom={zoom}
                        options={{
                            zoomControl: true,
                            streetViewControl: false,
                            mapTypeControl: false,
                            fullscreenControl: true,
                        }}
                    >
                        {/* Delivery Location Marker */}
                        {deliveryLocation && (
                            <Marker
                                position={{ lat: deliveryLocation.lat, lng: deliveryLocation.lng }}
                                icon={{
                                    path: google.maps.SymbolPath.CIRCLE,
                                    scale: 10,
                                    fillColor: '#22c55e',
                                    fillOpacity: 1,
                                    strokeColor: '#ffffff',
                                    strokeWeight: 2,
                                }}
                                label={{
                                    text: '🏠',
                                    fontSize: '20px',
                                }}
                                title="Delivery Location"
                            />
                        )}

                        {/* Rider Location Marker */}
                        {riderLocation && (
                            <Marker
                                position={{ lat: riderLocation.lat, lng: riderLocation.lng }}
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
                                title="Rider Location"
                                animation={google.maps.Animation.BOUNCE}
                            />
                        )}

                        {/* Route Line */}
                        {riderLocation && deliveryLocation && (
                            <Polyline
                                path={[
                                    { lat: riderLocation.lat, lng: riderLocation.lng },
                                    { lat: deliveryLocation.lat, lng: deliveryLocation.lng },
                                ]}
                                options={{
                                    strokeColor: '#3b82f6',
                                    strokeOpacity: 0.8,
                                    strokeWeight: 4,
                                    geodesic: true,
                                }}
                            />
                        )}
                    </GoogleMap>

                    {/* Legend */}
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-green-600" />
                            <span>Your Location</span>
                        </div>
                        {riderLocation && (
                            <div className="flex items-center gap-2">
                                <Bike className="h-4 w-4 text-blue-600" />
                                <span>Rider Location</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
