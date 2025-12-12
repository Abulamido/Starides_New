'use client';

import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from 'use-places-autocomplete';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { MapPin } from 'lucide-react';

interface AddressAutocompleteProps {
    onSelect: (address: string, lat: number, lng: number) => void;
    defaultValue?: string;
    className?: string;
}

export function AddressAutocomplete({
    onSelect,
    defaultValue = '',
    className,
}: AddressAutocompleteProps) {
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            /* Define search scope here */
        },
        debounce: 300,
        defaultValue,
    });

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (defaultValue) {
            setValue(defaultValue, false);
        }
    }, [defaultValue, setValue]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        setIsOpen(true);
    };

    const handleSelect =
        ({ description }: { description: string }) =>
            () => {
                // When user selects a place, we can replace the keyword without request data from API
                // by setting the second parameter to "false"
                setValue(description, false);
                clearSuggestions();
                setIsOpen(false);

                // Get latitude and longitude via utility functions
                getGeocode({ address: description }).then((results) => {
                    const { lat, lng } = getLatLng(results[0]);
                    onSelect(description, lat, lng);
                });
            };

    return (
        <div className={cn('relative', className)}>
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={value}
                    onChange={handleInput}
                    disabled={!ready}
                    placeholder="Enter delivery address"
                    className="pl-9"
                />
            </div>
            {status === 'OK' && isOpen && (
                <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover py-1 text-popover-foreground shadow-md">
                    {data.map((suggestion) => {
                        const {
                            place_id,
                            structured_formatting: { main_text, secondary_text },
                        } = suggestion;

                        return (
                            <li
                                key={place_id}
                                onClick={handleSelect(suggestion)}
                                className="flex cursor-pointer flex-col px-4 py-2 hover:bg-accent hover:text-accent-foreground"
                            >
                                <span className="font-medium">{main_text}</span>
                                <span className="text-xs text-muted-foreground">
                                    {secondary_text}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
