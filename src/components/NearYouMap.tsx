import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Navigation } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/format-price";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

// Ann Arbor downtown
const DEFAULT_CENTER = { lat: 42.2808, lng: -83.743 };

const HOBBY_EMOJI: Record<string, string> = {
  "arts-crafts": "🎨",
  music: "🎵",
  photography: "📸",
  knitting: "🧶",
  pottery: "🏺",
  woodworking: "🪵",
  "film-making": "🎬",
  sports: "⚽",
  yoga: "🧘",
  dance: "💃",
  hiking: "🥾",
  fitness: "💪",
  swimming: "🏊",
  "martial-arts": "🥋",
  cooking: "👨‍🍳",
  reading: "📚",
};

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

function formatHobbyLabel(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Load the Google Maps JS API script once */
function loadGoogleMaps(): Promise<void> {
  if (window.google?.maps) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=marker`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
}

const NearYouMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [userLocated, setUserLocated] = useState(false);
  const [events, setEvents] = useState<MapEvent[]>([]);
  const [ready, setReady] = useState(false);

  // Fetch events from Supabase
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

  // Load Google Maps script and initialize map
  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then(() => {
      if (cancelled || !mapRef.current) return;

      const map = new google.maps.Map(mapRef.current, {
        center: DEFAULT_CENTER,
        zoom: 13,
        gestureHandling: "greedy",
        mapId: "4521372b044ebd8eb35561cc",
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
      });

      mapInstanceRef.current = map;
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Place markers when map is ready and events are loaded
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!ready || !map || events.length === 0) return;

    const infoWindow = new google.maps.InfoWindow();

    events.forEach((evt) => {
      const pin = document.createElement("div");
      pin.style.cssText = "font-size:28px;cursor:pointer;";
      pin.textContent = HOBBY_EMOJI[evt.hobby_slug] || evt.emoji || "📍";

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: evt.lat, lng: evt.lng },
        content: pin,
        title: evt.title,
      });

      marker.addListener("click", () => {
        infoWindow.setContent(`
          <div style="padding:8px;max-width:200px;">
            <strong>${evt.title}</strong><br/>
            <span style="color:#666;font-size:12px;">
              ${formatHobbyLabel(evt.hobby_slug)} · ${formatEventDate(evt.date, evt.time)}
            </span><br/>
            <span style="color:#E8604A;font-weight:bold;">${formatPrice(evt.price_cents)}</span><br/>
            <a href="/hobby/${evt.hobby_slug}"
               style="color:#E8604A;font-size:13px;text-decoration:none;">View classes →</a>
          </div>
        `);
        infoWindow.open({ map, anchor: marker });
      });
    });
  }, [ready, events]);

  // Optional geolocation recenter
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        mapInstanceRef.current?.panTo(userPos);
        setUserLocated(true);
      },
      () => {},
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, []);

  const handleRecenter = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (userLocated) {
      navigator.geolocation.getCurrentPosition((pos) => {
        map.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        map.setZoom(13);
      });
    } else {
      map.panTo(DEFAULT_CENTER);
      map.setZoom(13);
    }
  }, [userLocated]);

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
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
        <button
          onClick={handleRecenter}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-card border-2 border-border shadow-md flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <Navigation className="w-4 h-4 text-primary" />
        </button>
      </div>
    </section>
  );
};

export default NearYouMap;
