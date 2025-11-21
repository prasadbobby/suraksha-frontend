import React, { useEffect, useRef, useState } from 'react';

interface GoogleMapProps {
  apiKey: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  width?: string;
  className?: string;
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    title: string;
    type?: 'current' | 'safe' | 'unsafe' | 'emergency';
  }>;
  showSafeRoutes?: boolean;
  showHeatmap?: boolean;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  apiKey,
  center = { lat: 28.6139, lng: 77.2090 }, // Default to New Delhi
  zoom = 15,
  height = '400px',
  width = '100%',
  className = '',
  onLocationSelect,
  markers = [],
  showSafeRoutes = false,
  showHeatmap = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current) return;

      try {
        // Load Google Maps using the new functional API
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,visualization`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          const map = new google.maps.Map(mapRef.current!, {
            center: center,
            zoom: zoom,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          });

          mapInstanceRef.current = map;

          // Add click listener for location selection
          if (onLocationSelect) {
            const geocoder = new google.maps.Geocoder();

            map.addListener('click', (event: google.maps.MapMouseEvent) => {
              if (event.latLng) {
                const position = {
                  lat: event.latLng.lat(),
                  lng: event.latLng.lng()
                };

                geocoder.geocode({ location: position }, (results, status) => {
                  if (status === 'OK' && results && results[0]) {
                    onLocationSelect({
                      ...position,
                      address: results[0].formatted_address
                    });
                  } else {
                    onLocationSelect({
                      ...position,
                      address: `${position.lat}, ${position.lng}`
                    });
                  }
                });
              }
            });
          }

          setIsLoaded(true);
          setError(null);
        };

        script.onerror = () => {
          console.error('Error loading Google Maps script');
          setError('Failed to load Google Maps. Please check your API key and internet connection.');
        };

        // Only add script if it hasn't been added already
        if (!document.querySelector(`script[src*="maps.googleapis.com"]`)) {
          document.head.appendChild(script);
        } else {
          // Script already loaded, initialize map directly
          const map = new google.maps.Map(mapRef.current!, {
            center: center,
            zoom: zoom,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          });

          mapInstanceRef.current = map;
          setIsLoaded(true);
          setError(null);
        }
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to load Google Maps. Please check your API key.');
      }
    };

    initializeMap();
  }, [apiKey, center.lat, center.lng, zoom, onLocationSelect]);

  // Add markers when map is loaded
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    const map = mapInstanceRef.current;

    // Clear existing markers
    // Note: In a real implementation, you'd want to manage marker instances

    markers.forEach((marker) => {
      const icon = getMarkerIcon(marker.type);

      new google.maps.Marker({
        position: marker.position,
        map: map,
        title: marker.title,
        icon: icon
      });
    });
  }, [markers, isLoaded]);

  const getMarkerIcon = (type?: string) => {
    const colors = {
      current: '#3b82f6', // Blue for current location
      safe: '#22c55e',    // Green for safe zones
      unsafe: '#ef4444',  // Red for unsafe areas
      emergency: '#f59e0b' // Orange for emergency services
    };

    const color = colors[type as keyof typeof colors] || '#6b7280';

    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 0.8,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 8
    };
  };

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ height, width }}
      >
        <div className="text-center p-4">
          <div className="text-destructive font-medium mb-2">Map Load Error</div>
          <div className="text-sm text-muted-foreground">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height, width }}>
      <div
        ref={mapRef}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg overflow-hidden"
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <div className="text-sm text-muted-foreground">Loading map...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;