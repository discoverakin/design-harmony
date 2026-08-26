import { useCallback, useEffect, useRef, useState } from "react";
import { ANN_ARBOR_CENTER, type Coords } from "@/lib/geo";

export type LocationStatus = "idle" | "locating" | "granted" | "unavailable";

/**
 * The origin distance filtering measures from.
 *
 * Geolocation is only requested once the user actually asks for a radius —
 * a permission prompt on page load for a feature nobody has touched reads as
 * the app grabbing at something. When it is refused or unsupported, distance
 * still works: it falls back to downtown Ann Arbor, which is the centre of the
 * catalogue anyway, and the UI says which origin it used.
 */
export function useUserLocation(active: boolean) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<LocationStatus>("idle");
  const asked = useRef(false);

  const request = useCallback(() => {
    if (asked.current) return;
    asked.current = true;

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unavailable");
      return;
    }

    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("granted");
      },
      () => setStatus("unavailable"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 }
    );
  }, []);

  useEffect(() => {
    if (active) request();
  }, [active, request]);

  return {
    origin: coords ?? ANN_ARBOR_CENTER,
    usingDeviceLocation: coords !== null,
    locating: status === "locating",
    status,
    request,
  };
}
