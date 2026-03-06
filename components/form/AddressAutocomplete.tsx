"use client";

import React, { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

interface AddressAutocompleteProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function AddressAutocomplete({
    value = "",
    onChange,
    placeholder = "Start typing your address...",
    className = "",
    disabled = false,
}: AddressAutocompleteProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [localValue, setLocalValue] = useState(value);

    // Sync local state if external value changes (e.g. going back/forward)
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        if (disabled || !inputRef.current) return;

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.warn("Google Maps API key is missing. Autocomplete will not work.");
            return;
        }

        setOptions({
            key: apiKey,
            v: "weekly",
        });

        importLibrary("places").then(() => {
            if (!inputRef.current) return;

            const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
                fields: ["formatted_address", "geometry", "name", "address_components"],
                types: ["address"],
                componentRestrictions: { country: "au" },
            });

            // Prevent enter key from submitting the form when selecting from the dropdown
            inputRef.current.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                }
            });

            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();
                const address = place.formatted_address || inputRef.current?.value || "";

                // Parse address components
                let street_number = "";
                let street_name = "";
                let city = "";
                let state = "";
                let postcode = "";
                let country = "";

                if (place.address_components) {
                    for (const component of place.address_components) {
                        const types = component.types;
                        if (types.includes("street_number")) street_number = component.long_name;
                        if (types.includes("route")) street_name = component.long_name;
                        if (types.includes("locality")) city = component.long_name;
                        if (types.includes("administrative_area_level_1")) state = component.short_name;
                        if (types.includes("postal_code")) postcode = component.long_name;
                        if (types.includes("country")) country = component.long_name;
                    }
                }

                const street_address = street_number ? `${street_number} ${street_name}` : street_name;

                setLocalValue(address);

                onChange(JSON.stringify({
                    full_address: address,
                    components: {
                        street_number,
                        street_address,
                        city,
                        state,
                        postcode,
                        country
                    }
                }));
            });
        }).catch((e: unknown) => {
            console.error("Failed to load Google Maps Places Library", e);
        });

    }, [disabled, onChange]);

    return (
        <input
            ref={inputRef}
            type="text"
            value={localValue}
            onChange={(e) => {
                setLocalValue(e.target.value);
                onChange(e.target.value);
            }}
            placeholder={placeholder}
            className={className}
            disabled={disabled}
        />
    );
}
