import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  ZoomIn, 
  ZoomOut, 
  Locate,
  Layers,
  X
} from "lucide-react";

interface DealLocation {
  id: string;
  lat: number;
  lng: number;
  address: string;
  city?: string;
  state?: string;
  askingPrice?: number;
  arv?: number;
  propertyType?: string;
  status?: string;
  matchScore?: number;
}

interface DealMapViewProps {
  deals: DealLocation[];
  onDealSelect: (dealId: string) => void;
  selectedDealId?: string;
  isLoading?: boolean;
}

declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

export function DealMapView({ deals, onDealSelect, selectedDealId, isLoading }: DealMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<DealLocation | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
  };

  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google) return;

    const defaultCenter = { lat: 39.8283, lng: -98.5795 };
    
    try {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 4,
        mapId: "marketflow-deals-map",
        disableDefaultUI: false,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      setMapLoaded(true);
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Failed to load map");
    }
  }, []);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setMapError("Google Maps API key not configured");
      return;
    }

    if (window.google?.maps) {
      initializeMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker&callback=initMap`;
    script.async = true;
    script.defer = true;

    window.initMap = initializeMap;

    script.onerror = () => {
      setMapError("Failed to load Google Maps");
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [initializeMap]);

  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    markersRef.current.forEach(marker => marker.map = null);
    markersRef.current = [];

    const validDeals = deals.filter(deal => deal.lat && deal.lng);
    
    if (validDeals.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();

    validDeals.forEach(deal => {
      const position = { lat: deal.lat, lng: deal.lng };
      bounds.extend(position);

      const markerContent = document.createElement("div");
      markerContent.className = `
        flex items-center justify-center w-8 h-8 rounded-full cursor-pointer
        transition-all duration-200 hover:scale-110
        ${selectedDealId === deal.id 
          ? "bg-primary text-primary-foreground ring-4 ring-primary/30" 
          : "bg-background text-foreground border-2 border-primary shadow-lg"
        }
      `;
      markerContent.innerHTML = `<span class="text-xs font-bold">$${Math.round((deal.askingPrice || 0) / 1000)}K</span>`;

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        position,
        map: mapInstanceRef.current,
        content: markerContent,
        title: deal.address,
      });

      marker.addListener("click", () => {
        setSelectedDeal(deal);
        onDealSelect(deal.id);
      });

      markersRef.current.push(marker);
    });

    if (validDeals.length > 1) {
      mapInstanceRef.current.fitBounds(bounds, 50);
    } else if (validDeals.length === 1) {
      mapInstanceRef.current.setCenter({ lat: validDeals[0].lat, lng: validDeals[0].lng });
      mapInstanceRef.current.setZoom(12);
    }
  }, [deals, mapLoaded, selectedDealId, onDealSelect]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom((mapInstanceRef.current.getZoom() || 4) + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom((mapInstanceRef.current.getZoom() || 4) - 1);
    }
  };

  const handleLocate = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          mapInstanceRef.current?.setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          mapInstanceRef.current?.setZoom(10);
        },
        () => {
          /* geolocation denied — silently fall back to default center */
        }
      );
    }
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <Skeleton className="h-[500px] w-full" />
      </Card>
    );
  }

  if (mapError) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="h-[500px] flex flex-col items-center justify-center text-center p-8">
          <MapPin className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Map Unavailable</h3>
          <p className="text-muted-foreground text-sm mb-4">{mapError}</p>
          <p className="text-xs text-muted-foreground">
            Deals are still available in Grid and Swipe views
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden relative">
      <div ref={mapRef} className="h-[500px] w-full" data-testid="deal-map" />

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button size="icon" variant="secondary" onClick={handleZoomIn} data-testid="button-zoom-in">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="secondary" onClick={handleZoomOut} data-testid="button-zoom-out">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="secondary" onClick={handleLocate} data-testid="button-locate">
          <Locate className="w-4 h-4" />
        </Button>
      </div>

      {/* Deal Count Badge */}
      <div className="absolute top-4 left-4">
        <Badge variant="secondary" className="shadow-lg">
          <MapPin className="w-3 h-3 mr-1" />
          {deals.filter(d => d.lat && d.lng).length} Deals
        </Badge>
      </div>

      {/* Selected Deal Card */}
      {selectedDeal && (
        <div className="absolute bottom-4 left-4 right-4 max-w-md mx-auto">
          <Card className="shadow-xl">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm truncate">{selectedDeal.address}</h4>
                  <p className="text-xs text-muted-foreground">
                    {[selectedDeal.city, selectedDeal.state].filter(Boolean).join(", ")}
                  </p>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6 -mr-2 -mt-1"
                  onClick={() => setSelectedDeal(null)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm font-semibold">
                    {formatCurrency(selectedDeal.askingPrice || 0)}
                  </span>
                </div>
                {selectedDeal.arv && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">ARV: {formatCurrency(selectedDeal.arv)}</span>
                  </div>
                )}
                {selectedDeal.matchScore && (
                  <Badge variant="outline" className="text-xs">
                    {selectedDeal.matchScore}% Match
                  </Badge>
                )}
              </div>

              <Button 
                className="w-full mt-3" 
                size="sm"
                onClick={() => onDealSelect(selectedDeal.id)}
                data-testid="button-view-map-deal"
              >
                View Deal Details
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
}

export function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!window.google?.maps) {
      resolve(null);
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        const location = results[0].geometry.location;
        resolve({ lat: location.lat(), lng: location.lng() });
      } else {
        resolve(null);
      }
    });
  });
}
