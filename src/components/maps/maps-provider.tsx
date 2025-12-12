'use client';

import { useJsApiLoader } from '@react-google-maps/api';
import { ReactNode } from 'react';

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places", "geometry"];

export function MapsProvider({ children }: { children: ReactNode }) {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        libraries,
    });

    if (loadError) {
        return <div>Error loading maps</div>;
    }

    if (!isLoaded) {
        return <div>Loading maps...</div>;
    }

    return <>{children}</>;
}
