'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddressAutocompleteProps {
    onAddressSelect: (address: {
        fullAddress: string;
        city: string;
        state: string;
        lat: number;
        lng: number;
    }) => void;
    label?: string;
    placeholder?: string;
    defaultValue?: string;
}

export function AddressAutocomplete({
    onAddressSelect,
    label = "Address",
    placeholder = "Start typing your address...",
    defaultValue = ""
}: AddressAutocompleteProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        if (!inputRef.current || !window.google) return;

        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
            componentRestrictions: { country: 'ng' }, // Restrict to Nigeria
            fields: ['address_components', 'formatted_address', 'geometry'],
            types: ['address']
        });

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();

            if (!place.geometry || !place.geometry.location) {
                return;
            }

            // Extract city and state from address components
            let city = '';
            let state = '';

            place.address_components?.forEach((component) => {
                if (component.types.includes('locality')) {
                    city = component.long_name;
                }
                if (component.types.includes('administrative_area_level_1')) {
                    state = component.long_name;
                }
            });

            const addressData = {
                fullAddress: place.formatted_address || '',
                city: city,
                state: state,
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            };

            setValue(place.formatted_address || '');
            onAddressSelect(addressData);
        });

        return () => {
            google.maps.event.clearInstanceListeners(autocomplete);
        };
    }, [onAddressSelect]);

    return (
        <div className="space-y-2">
            <Label htmlFor="address-autocomplete">{label}</Label>
            <Input
                ref={inputRef}
                id="address-autocomplete"
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full"
            />
            <p className="text-xs text-muted-foreground">
                Start typing and select from the suggestions
            </p>
        </div>
    );
}
