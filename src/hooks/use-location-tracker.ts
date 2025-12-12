'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface LocationTrackerOptions {
    orderId: string;
    enabled: boolean;
    updateInterval?: number; // milliseconds, default 15000 (15 seconds)
}

interface LocationData {
    lat: number;
    lng: number;
    timestamp: any;
}

export function useLocationTracker({ orderId, enabled, updateInterval = 15000 }: LocationTrackerOptions) {
    const firestore = useFirestore();
    const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isTracking, setIsTracking] = useState(false);

    const updateLocation = useCallback(async (position: GeolocationPosition) => {
        if (!firestore || !orderId) return;

        const locationData: LocationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: serverTimestamp(),
        };

        setCurrentLocation(locationData);

        try {
            // Update order document with rider location
            const orderRef = doc(firestore, 'orders', orderId);
            await updateDoc(orderRef, {
                riderLocation: {
                    lat: locationData.lat,
                    lng: locationData.lng,
                    timestamp: serverTimestamp(),
                },
            });
        } catch (err) {
            // Silently fail - location update is not critical
            console.log('Location update skipped');
        }
    }, [firestore, orderId]);

    const handleError = useCallback((err: GeolocationPositionError) => {
        // Only log meaningful errors, not permission denials during inactive tracking
        if (err.code === err.PERMISSION_DENIED) {
            console.log('Location permission denied - tracking disabled');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
            console.log('Location unavailable');
        } else if (err.code === err.TIMEOUT) {
            console.log('Location request timeout');
        }
        setError(err.message);
        setIsTracking(false);
    }, []);

    useEffect(() => {
        if (!enabled || !orderId) {
            setIsTracking(false);
            return;
        }

        // Check if geolocation is supported
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setIsTracking(true);
        setError(null);

        // Get initial position
        navigator.geolocation.getCurrentPosition(updateLocation, handleError, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        });

        // Watch position and update periodically
        const watchId = navigator.geolocation.watchPosition(
            updateLocation,
            handleError,
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );

        // Set up interval for periodic updates (in case watchPosition doesn't trigger often enough)
        const intervalId = setInterval(() => {
            navigator.geolocation.getCurrentPosition(updateLocation, handleError, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            });
        }, updateInterval);

        // Cleanup
        return () => {
            navigator.geolocation.clearWatch(watchId);
            clearInterval(intervalId);
            setIsTracking(false);
        };
    }, [enabled, orderId, updateInterval, updateLocation, handleError]);

    return {
        currentLocation,
        isTracking,
        error,
    };
}
