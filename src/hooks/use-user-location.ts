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

/**
 * The user's position, but only if they have already granted it.
 *
 * Cards show a distance where they can, and a place name where they cannot —
 * so this must never trigger a permission prompt. A browse list is the wrong
 * moment to ask, and a prompt nobody expects gets denied, which would cost us
 * the answer for good. Anyone who has used the distance filter (or granted the
 * map) already counts as granted, and their cards start showing distances with
 * no further ceremony.
 */
export function useGrantedLocation() {
  const [coords, setCoords] = useState<Coords | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    const read = () =>
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!cancelled) {
            setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          }
        },
        () => {},
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 }
      );

    // No Permissions API (older Safari) means we cannot tell granted from
    // unasked, and asking is the thing we must not do. Show place names.
    if (!navigator.permissions?.query) return;

    navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((status) => {
        if (!cancelled && status.state === "granted") read();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return coords;
}
