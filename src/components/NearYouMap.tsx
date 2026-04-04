import { useState, useEffect, useCallback } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import { MapPin, Navigation } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/format-price";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

// Ann Arbor downtown
const DEFAULT_CENTER = { lat: 42.2808, lng: -83.743 };

interface MapEvent {
  id: string;
  title: string;
  hobby_slug: string;
  location: string;
  date: string;
  time: string;
  price_cents: number;
  lat: number;
  lng: number;
  emoji: string;
}

function formatHobbyLabel(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatEventDate(date: string, time: string | null): string {
  const dt = new Date(date + "T00:00:00");
  const datePart = dt.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  if (!time) return datePart;

  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (match) {
    const timeDt = new Date(`${date}T${time}`);
    const timePart = timeDt.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${datePart} · ${timePart}`;
  }

  return `${datePart} · ${time}`;
}

const MapContent = ({
  center,
  events,
}: {
  center: { lat: number; lng: number };
  events: MapEvent[];
}) => {
  const map = useMap();
  const [selectedEvent, setSelectedEvent] = useState<MapEvent | null>(null);

  const handleRecenter = useCallback(() => {
    map?.panTo(center);
    map?.setZoom(13);
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

      {/* Event markers */}
      {events.map((evt) => (
        <AdvancedMarker
          key={evt.id}
          position={{ lat: evt.lat, lng: evt.lng }}
          onClick={() => setSelectedEvent(evt)}
        >
          <div className="flex flex-col items-center cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-card border-2 border-primary/40 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-lg">{evt.emoji}</span>
            </div>
          </div>
        </AdvancedMarker>
      ))}

      {/* Info window */}
      {selectedEvent && (
        <InfoWindow
          position={{ lat: selectedEvent.lat, lng: selectedEvent.lng }}
          onCloseClick={() => setSelectedEvent(null)}
          pixelOffset={[0, -40]}
        >
          <Link
            to={`/hobby/${selectedEvent.hobby_slug}`}
            className="block p-1 min-w-[160px]"
          >
            <p className="text-sm font-semibold text-gray-900">
              {selectedEvent.title}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatHobbyLabel(selectedEvent.hobby_slug)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatEventDate(selectedEvent.date, selectedEvent.time)}
            </p>
            <p className="text-xs font-medium text-gray-700 mt-1">
              {formatPrice(selectedEvent.price_cents)}
            </p>
          </Link>
        </InfoWindow>
      )}
    </>
  );
};

const NearYouMap = () => {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [userLocated, setUserLocated] = useState(false);
  const [events, setEvents] = useState<MapEvent[]>([]);

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase
        .from("events")
        .select(
          "id, title, hobby_slug, location, date, time, price_cents, lat, lng, emoji"
        )
        .eq("status", "approved")
        .gte("date", new Date().toISOString().split("T")[0])
        .not("lat", "is", null)
        .not("lng", "is", null);

      if (data) setEvents(data as MapEvent[]);
    }
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setUserLocated(true);
      },
      () => {},
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, []);

  return (
    <section className="px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-foreground">Near You</h2>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="w-3 h-3" />
          {userLocated ? "Live" : "Ann Arbor"}
        </span>
      </div>
      <div className="relative h-[300px] rounded-2xl border-2 border-border overflow-hidden">
        <APIProvider apiKey={API_KEY}>
          <Map
            defaultCenter={DEFAULT_CENTER}
            center={center}
            defaultZoom={13}
            mapId="akin-near-you"
            gestureHandling="greedy"
            scrollwheel={true}
            disableDoubleClickZoom={false}
            disableDefaultUI
            style={{ width: "100%", height: "100%" }}
          >
            <MapContent center={center} events={events} />
          </Map>
        </APIProvider>
      </div>
    </section>
  );
};

export default NearYouMap;
