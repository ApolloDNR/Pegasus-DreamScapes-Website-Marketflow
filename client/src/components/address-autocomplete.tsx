/// <reference types="@types/google.maps" />
import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google: typeof google;
    initGooglePlaces: () => void;
  }
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  "data-testid"?: string;
}

interface ParsedAddress {
  streetNumber: string;
  streetName: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  fullAddress: string;
}

export function parseAddressComponents(place: google.maps.places.PlaceResult): ParsedAddress {
  const components = place.address_components || [];
  const result: ParsedAddress = {
    streetNumber: "",
    streetName: "",
    city: "",
    state: "",
    zip: "",
    county: "",
    fullAddress: place.formatted_address || "",
  };

  for (const component of components) {
    const types = component.types;
    if (types.includes("street_number")) {
      result.streetNumber = component.long_name;
    }
    if (types.includes("route")) {
      result.streetName = component.long_name;
    }
    if (types.includes("locality")) {
      result.city = component.long_name;
    }
    if (types.includes("administrative_area_level_1")) {
      result.state = component.short_name;
    }
    if (types.includes("postal_code")) {
      result.zip = component.long_name;
    }
    if (types.includes("administrative_area_level_2")) {
      result.county = component.long_name.replace(" County", "");
    }
  }

  return result;
}

let googleApiLoaded = false;
let loadingPromise: Promise<void> | null = null;
let apiKeyCache: string | null = null;

async function fetchGoogleMapsApiKey(): Promise<string> {
  if (apiKeyCache !== null) {
    return apiKeyCache;
  }
  
  try {
    const response = await fetch('/api/config/google-maps');
    if (!response.ok) {
      throw new Error('Failed to fetch Google Maps API key');
    }
    const data = await response.json();
    const key = data.apiKey || '';
    apiKeyCache = key;
    return key;
  } catch (error) {
    console.error('Error fetching Google Maps API key:', error);
    return '';
  }
}

async function loadGoogleMapsApi(): Promise<void> {
  if (googleApiLoaded && window.google?.maps?.places) {
    return Promise.resolve();
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    const apiKey = await fetchGoogleMapsApiKey();
    
    if (!apiKey) {
      console.warn('Google Maps API key not configured. Address autocomplete will be disabled.');
      return;
    }

    return new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        if (window.google?.maps?.places) {
          googleApiLoaded = true;
          resolve();
        } else {
          existingScript.addEventListener('load', () => {
            googleApiLoaded = true;
            resolve();
          });
        }
        return;
      }

      window.initGooglePlaces = () => {
        googleApiLoaded = true;
        resolve();
      };

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlaces`;
      script.async = true;
      script.defer = true;
      script.onerror = () => reject(new Error("Failed to load Google Maps API"));
      document.head.appendChild(script);
    });
  })();

  return loadingPromise;
}

export function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Enter address...",
  className,
  disabled = false,
  "data-testid": testId,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const initAutocomplete = useCallback(() => {
    if (!inputRef.current || !window.google?.maps?.places || autocompleteRef.current) {
      return;
    }

    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "us" },
        fields: ["address_components", "formatted_address", "geometry", "place_id"],
        types: ["address"],
      });

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.formatted_address) {
          onChange(place.formatted_address);
          onPlaceSelect?.(place);
        }
      });

      setIsLoading(false);
    } catch (error) {
      console.error("Error initializing autocomplete:", error);
      setApiError(true);
      setIsLoading(false);
    }
  }, [onChange, onPlaceSelect]);

  useEffect(() => {
    loadGoogleMapsApi()
      .then(() => {
        if (window.google?.maps?.places) {
          initAutocomplete();
        } else {
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error("Failed to load Google Maps API:", error);
        setApiError(true);
        setIsLoading(false);
      });

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [initAutocomplete]);

  return (
    <div className="relative">
      <MapPin className={cn(
        "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
        isFocused ? "text-primary" : "text-muted-foreground"
      )} />
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={apiError ? placeholder : placeholder}
        disabled={disabled}
        className={cn("pl-10 pr-10", className)}
        data-testid={testId}
      />
      {isLoading && !apiError && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
      )}
    </div>
  );
}

export default AddressAutocomplete;
