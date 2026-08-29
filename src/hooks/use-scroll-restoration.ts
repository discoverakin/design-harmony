import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const STORAGE_KEY = "akin-scroll-positions";
const MAX_ENTRIES = 20;

type Positions = Record<string, number>;

function read(): Positions {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? (parsed as Positions) : {};
  } catch {
    return {};
  }
}

function write(key: string, offset: number) {
  try {
    const positions = read();
    positions[key] = offset;
    // Keep the map from growing forever across a long session.
    const entries = Object.entries(positions).slice(-MAX_ENTRIES);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    /* private mode or full quota — scroll position is not worth throwing over */
  }
}

/**
 * Put a long list back where the user left it when they press back.
 *
 * The browser's own scroll restoration is useless here: it fires before the
 * events have been fetched, when the page is still a spinner one viewport tall,
 * so it restores to 0 and the user lands at the top of a 174-item list holding
 * the place they had scrolled to in their head.
 *
 * `ready` is the caller's "the list is rendered now" signal — restoration waits
 * for it, and happens once. `location.key` is stable per history entry, so a
 * back navigation reads the same slot it wrote.
 */
export function useScrollRestoration(ready: boolean) {
  const { key } = useLocation();
  const restored = useRef(false);

  // Reset when the history entry changes, so a new page starts at the top.
  useEffect(() => {
    restored.current = false;
  }, [key]);

  useEffect(() => {
    if (!ready || restored.current) return;
    restored.current = true;

    const offset = read()[key];
    if (typeof offset === "number" && offset > 0) {
      // After paint, or the layout it is scrolling within may not exist yet.
      requestAnimationFrame(() => window.scrollTo(0, offset));
    }
  }, [ready, key]);

  // Record on the way out. Writing per scroll event would mean a storage write
  // per frame; the only moment that matters is leaving the page.
  useEffect(() => {
    return () => {
      write(key, window.scrollY);
    };
  }, [key]);
}
