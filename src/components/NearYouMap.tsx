import { useState, useEffect, useCallback, useMemo } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import { MapPin, Navigation, Star } from "lucide-react";
import { hobbies } from "@/data/hobbies";
import { Link } from "react-router-dom";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

// Default center (NYC) used while geolocation loads or if denied
const DEFAULT_CENTER = { lat: 40.7128, lng: -74.006 };

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  emoji: string;
  name: string;
  hobbyLabel: string;
  hobbySlug: string;
  rating: number;
  price: string;
  distance: string;
}

/** Deterministic pseudo-random offset from a seed string */
function seededOffset(seed: string, range: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return ((hash % 1000) / 1000) * range;
}

/** Build markers by distributing nearby classes around a center point */
function buildMarkers(center: { lat: number; lng: number }): MapMarker[] {
  const markers: MapMarker[] = [];
  const featured = hobbies.slice(0, 10); // top 10 hobbies for the map

  featured.forEach((hobby) => {
    hobby.nearbyClasses.forEach((cls, i) => {
      // Parse distance from "X.X mi away" string
      const milesMatch = cls.location.match(/([\d.]+)/);
      const miles = milesMatch ? parseFloat(milesMatch[1]) : 1;
      // 1 mile ≈ 0.0145 degrees latitude
      const degreeRadius = miles * 0.0145;

      // Use seeded offsets for consistent but spread-out positions
      const seed = `${hobby.slug}-${cls.name}-${i}`;
      const angle = seededOffset(seed, Math.PI * 2);
      const dist = degreeRadius * (0.5 + seededOffset(seed + "r", 0.5));

      markers.push({
        id: `${hobby.slug}-${i}`,
        lat: center.lat + Math.cos(angle) * dist,
        lng: center.lng + Math.sin(angle) * dist / Math.cos(center.lat * Math.PI / 180),
        emoji: hobby.emoji,
        name: cls.name,
        hobbyLabel: hobby.label,
        hobbySlug: hobby.slug,
        rating: cls.rating,
        price: cls.price,
        distance: cls.location,
      });
    });
  });

  return markers;
}

const MapContent = ({ center }: { center: { lat: number; lng: number } }) => {
  const map = useMap();
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  const markers = useMemo(() => buildMarkers(center), [center]);

  const handleRecenter = useCallback(() => {
    map?.panTo(center);
    map?.setZoom(14);
  }, [map, center]);

  return (
    <>
      {/* Recenter button */}
      <button
        onClick={handleRecenter}
        className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-card border-2 border-border shadow-md flex items-center justify-center hover:bg-secondary transition-colors"
      >
        <Navigation className="w-4 h-4 text-primary" />
      </button>

      {/* User location dot */}
      <AdvancedMarker position={center}>
        <div className="relative">
          <div className="w-4 h-4 rounded-full bg-blue-500 border-[3px] border-white shadow-lg" />
          <div className="absolute -inset-2 rounded-full bg-blue-500/20 animate-ping" />
        </div>
      </AdvancedMarker>

      {/* Hobby class markers */}
      {markers.map((marker) => (
        <AdvancedMarker
          key={marker.id}
          position={{ lat: marker.lat, lng: marker.lng }}
          onClick={() => setSelectedMarker(marker)}
        >
          <div className="flex flex-col items-center cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-card border-2 border-primary/40 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-lg">{marker.emoji}</span>
            </div>
          </div>
        </AdvancedMarker>
      ))}

      {/* Info window */}
      {selectedMarker && (
        <InfoWindow
          position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
          onCloseClick={() => setSelectedMarker(null)}
          pixelOffset={[0, -40]}
        >
          <Link
            to={`/hobby/${selectedMarker.hobbySlug}`}
            className="block p-1 min-w-[160px]"
          >
            <p className="text-sm font-semibold text-gray-900">
              {selectedMarker.emoji} {selectedMarker.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {selectedMarker.hobbyLabel} · {selectedMarker.distance}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-0.5 text-xs text-amber-600">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {selectedMarker.rating}
              </span>
              <span className="text-xs text-gray-400">{selectedMarker.price}</span>
            </div>
          </Link>
        </InfoWindow>
      )}
    </>
  );
};

const NearYouMap = () => {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [locating, setLocating] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, []);

  return (
    <section className="px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-foreground">Near You</h2>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="w-3 h-3" />
          {locating ? "Locating..." : "Live"}
        </span>
      </div>
      <div className="relative h-[300px] rounded-2xl border-2 border-border overflow-hidden">
        <APIProvider apiKey={API_KEY}>
          <Map
            defaultCenter={center}
            center={locating ? undefined : center}
            defaultZoom={14}
            mapId="akin-near-you"
            gestureHandling="greedy"
            disableDefaultUI
            style={{ width: "100%", height: "100%" }}
          >
            {!locating && <MapContent center={center} />}
          </Map>
        </APIProvider>

        {/* Loading overlay */}
        {locating && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <span className="w-6 h-6 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-xs text-muted-foreground font-medium">
                Finding your location...
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default NearYouMap;
