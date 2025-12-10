/// <reference types="@types/google.maps" />
import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyMapProps {
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  className?: string;
  height?: string;
  showCard?: boolean;
  title?: string;
  "data-testid"?: string;
}

interface MapMarker {
  address: string;
  lat: number;
  lng: number;
  title?: string;
}

let googleMapsLoaded = false;
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
  if (googleMapsLoaded && window.google?.maps) {
    return Promise.resolve();
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    const apiKey = await fetchGoogleMapsApiKey();
    
    if (!apiKey) {
      console.warn('Google Maps API key not configured.');
      return;
    }

    return new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        if (window.google?.maps) {
          googleMapsLoaded = true;
          resolve();
        } else {
          existingScript.addEventListener('load', () => {
            googleMapsLoaded = true;
            resolve();
          });
        }
        return;
      }

      const callbackName = 'initGoogleMapsCallback';
      (window as any)[callbackName] = () => {
        googleMapsLoaded = true;
        resolve();
      };

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geocoding&callback=${callbackName}`;
      script.async = true;
      script.defer = true;
      script.onerror = () => reject(new Error("Failed to load Google Maps API"));
      document.head.appendChild(script);
    });
  })();

  return loadingPromise;
}

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!window.google?.maps) return null;
  
  const geocoder = new window.google.maps.Geocoder();
  
  return new Promise((resolve) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        resolve({ lat: location.lat(), lng: location.lng() });
      } else {
        console.warn('Geocoding failed:', status);
        resolve(null);
      }
    });
  });
}

export function PropertyMap({
  address,
  city,
  state,
  zipCode,
  className,
  height = "300px",
  showCard = true,
  title = "Property Location",
  "data-testid": testId,
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const fullAddress = [address, city, state, zipCode].filter(Boolean).join(', ');

  const initializeMap = useCallback(async () => {
    if (!mapRef.current || !window.google?.maps || mapInstanceRef.current) return;

    try {
      const coords = await geocodeAddress(fullAddress);
      
      if (!coords) {
        setError('Could not find location on map');
        setIsLoading(false);
        return;
      }

      setCoordinates(coords);

      const map = new window.google.maps.Map(mapRef.current, {
        center: coords,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: true,
        fullscreenControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      mapInstanceRef.current = map;

      // Use standard Marker (AdvancedMarkerElement requires map ID)
      new window.google.maps.Marker({
        position: coords,
        map: map,
        title: fullAddress,
      });

      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to load map');
      setIsLoading(false);
    }
  }, [fullAddress]);

  useEffect(() => {
    loadGoogleMapsApi()
      .then(() => {
        if (window.google?.maps) {
          initializeMap();
        } else {
          setError('Google Maps not available');
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load Google Maps:', err);
        setError('Failed to load Google Maps');
        setIsLoading(false);
      });

    return () => {
      if (markerRef.current) {
        markerRef.current = null;
      }
      mapInstanceRef.current = null;
    };
  }, [initializeMap]);

  const mapContent = (
    <div className="relative" style={{ height }}>
      {isLoading && (
        <Skeleton className="absolute inset-0 rounded-lg" />
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50 rounded-lg">
          <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className={cn("w-full h-full rounded-lg", isLoading && "invisible")}
        data-testid={testId}
      />
    </div>
  );

  if (!showCard) {
    return mapContent;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mapContent}
        <div className="mt-3 text-sm text-muted-foreground">
          <p>{fullAddress}</p>
          {coordinates && (
            <p className="text-xs mt-1">
              Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Multi-property map for showing multiple deals/listings
interface MultiPropertyMapProps {
  properties: Array<{
    id: string;
    address: string;
    city?: string;
    state?: string;
    price?: number;
    type?: string;
  }>;
  className?: string;
  height?: string;
  onMarkerClick?: (id: string) => void;
  "data-testid"?: string;
}

export function MultiPropertyMap({
  properties,
  className,
  height = "400px",
  onMarkerClick,
  "data-testid": testId,
}: MultiPropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeMap = useCallback(async () => {
    if (!mapRef.current || !window.google?.maps || properties.length === 0) return;

    try {
      // Default center (Phoenix, AZ)
      const defaultCenter = { lat: 33.4484, lng: -112.0740 };
      
      const map = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 10,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      mapInstanceRef.current = map;
      const bounds = new window.google.maps.LatLngBounds();
      
      // Geocode and add markers for each property
      for (const property of properties) {
        const fullAddress = [property.address, property.city, property.state].filter(Boolean).join(', ');
        const coords = await geocodeAddress(fullAddress);
        
        if (coords) {
          const marker = new window.google.maps.Marker({
            position: coords,
            map: map,
            title: property.address,
          });

          if (onMarkerClick) {
            marker.addListener('click', () => {
              onMarkerClick(property.id);
            });
          }

          // Info window
          const infoContent = `
            <div style="padding: 8px; max-width: 200px;">
              <h4 style="margin: 0 0 4px 0; font-weight: 600;">${property.address}</h4>
              ${property.price ? `<p style="margin: 0; color: #059669;">$${property.price.toLocaleString()}</p>` : ''}
              ${property.type ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">${property.type}</p>` : ''}
            </div>
          `;
          
          const infoWindow = new window.google.maps.InfoWindow({
            content: infoContent
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          markersRef.current.push(marker);
          bounds.extend(coords);
        }
      }

      // Fit map to show all markers
      if (markersRef.current.length > 0) {
        map.fitBounds(bounds);
        // Don't zoom in too close for single marker
        const listener = google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          const zoom = map.getZoom();
          if (zoom && zoom > 15) {
            map.setZoom(15);
          }
        });
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing multi-property map:', err);
      setError('Failed to load map');
      setIsLoading(false);
    }
  }, [properties, onMarkerClick]);

  useEffect(() => {
    // Clear previous markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    mapInstanceRef.current = null;
    setIsLoading(true);
    setError(null);

    loadGoogleMapsApi()
      .then(() => {
        if (window.google?.maps) {
          initializeMap();
        } else {
          setError('Google Maps not available');
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load Google Maps:', err);
        setError('Failed to load Google Maps');
        setIsLoading(false);
      });

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [initializeMap]);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Property Locations ({properties.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative" style={{ height }}>
          {isLoading && (
            <Skeleton className="absolute inset-0 rounded-lg" />
          )}
          
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50 rounded-lg">
              <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          )}
          
          <div 
            ref={mapRef} 
            className={cn("w-full h-full rounded-lg", isLoading && "invisible")}
            data-testid={testId}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default PropertyMap;
