import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * The one horizontal card rail in the app.
 *
 * Testers hit two separate problems that both come back to having had two
 * implementations: "Featured this week" was a bare `overflow-x-auto` with no
 * arrows, dots or cut-off card, so it read as a finished row of three; and
 * "Recommended hobbies" was an Embla carousel, which listens for a pointer
 * *drag* and ignores wheel/trackpad events — so the two-finger sideways swipe
 * that scrolls Featured did nothing on Recommended.
 *
 * So this scrolls natively (touch, trackpad, shift+wheel, and arrow keys once
 * the rail has focus) *and* handles mouse click-drag on top. Every gesture
 * someone might reach for works on every rail, and nobody has to guess which.
 */

/** How far a mouse has to move before we treat the gesture as a drag, not a click. */
const DRAG_THRESHOLD_PX = 5;

interface CardCarouselProps {
  title: string;
  /** Sits in the header, left of the arrows — e.g. a "Based on your quiz" badge. */
  accessory?: ReactNode;
  /** Names the scrolling region for screen readers. Defaults to `title`. */
  label?: string;
  /**
   * The cards. Each direct child is made non-shrinking and a snap point by the
   * rail itself, so callers only set a width.
   */
  children: ReactNode;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** jsdom (and very old Safari) has no Element.scrollTo, hence the fallback. */
const scrollRailTo = (el: HTMLElement, left: number) => {
  const clamped = Math.max(0, Math.min(left, el.scrollWidth - el.clientWidth));
  if (typeof el.scrollTo === "function") {
    el.scrollTo({ left: clamped, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  } else {
    el.scrollLeft = clamped;
  }
};

const CardCarousel = ({ title, accessory, label, children }: CardCarouselProps) => {
  const railRef = useRef<HTMLDivElement>(null);

  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);
  const [dragging, setDragging] = useState(false);

  const scrollable = pageCount > 1;

  const measure = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    setAtStart(scrollLeft <= 1);
    setAtEnd(scrollLeft >= maxScroll - 1);
    // A "page" is one rail-width. Eight 160px cards on a phone is three dots,
    // not eight — the dots are a position hint, not a card count.
    const pages = clientWidth > 0 ? Math.max(1, Math.ceil(scrollWidth / clientWidth)) : 1;
    setPageCount(pages);
    // Spread the dots across the distance the rail can actually travel, not
    // across whole rail-widths. The last page is nearly always a partial one,
    // so dividing by clientWidth leaves the final dot permanently unreachable.
    setPage(maxScroll > 0 ? Math.round((scrollLeft / maxScroll) * (pages - 1)) : 0);
  }, []);

  // No dep array: cards arrive asynchronously, and re-measuring on every render
  // is cheaper than watching for it. Identical state values bail out in React.
  useEffect(measure);

  useEffect(() => {
    const el = railRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  const frame = useRef<number | null>(null);
  const onScroll = useCallback(() => {
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      measure();
    });
  }, [measure]);

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    []
  );

  const scrollByPage = (direction: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    scrollRailTo(el, el.scrollLeft + direction * el.clientWidth);
  };

  const scrollToPage = (index: number) => {
    const el = railRef.current;
    if (!el || pageCount < 2) return;
    scrollRailTo(el, (index / (pageCount - 1)) * (el.scrollWidth - el.clientWidth));
  };

  // --- Mouse drag ------------------------------------------------------------
  // Touch and pen keep native scrolling: it has momentum and rubber-banding we
  // would only make worse. This exists so the grab-and-pull gesture people
  // learned from the old Embla rail still works, on both rails.
  const drag = useRef<{ startX: number; startLeft: number; moved: boolean } | null>(null);
  const swallowNextClick = useRef(false);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    swallowNextClick.current = false;
    const el = railRef.current;
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    drag.current = { startX: e.clientX, startLeft: el.scrollLeft, moved: false };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = railRef.current;
    const state = drag.current;
    if (!el || !state) return;
    const dx = e.clientX - state.startX;
    if (!state.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD_PX) return;
      state.moved = true;
      setDragging(true);
      el.setPointerCapture?.(e.pointerId);
    }
    el.scrollLeft = state.startLeft - dx;
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    drag.current = null;
    if (!state?.moved) return;
    // Re-enabling scroll-snap-type re-snaps to the nearest card on its own.
    setDragging(false);
    railRef.current?.releasePointerCapture?.(e.pointerId);
    // Otherwise letting go over a card navigates to it.
    swallowNextClick.current = true;
  };

  const onClickCapture = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!swallowNextClick.current) return;
    swallowNextClick.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <section className="pt-6 pb-2">
      <div className="flex items-center justify-between gap-2 px-4 mb-3">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <div className="flex items-center gap-2">
          {accessory}
          {scrollable && (
            <div className="flex gap-1">
              <button
                type="button"
                aria-label={`Scroll ${title} left`}
                onClick={() => scrollByPage(-1)}
                disabled={atStart}
                className="p-1.5 rounded-lg bg-secondary text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-default transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label={`Scroll ${title} right`}
                onClick={() => scrollByPage(1)}
                disabled={atEnd}
                className="p-1.5 rounded-lg bg-secondary text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-default transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <div
          ref={railRef}
          role="region"
          aria-label={label ?? title}
          tabIndex={0}
          onScroll={onScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
          onDragStart={(e) => e.preventDefault()}
          // select-none is unconditional: the browser starts selecting text on
          // the first pixel of a drag, before React can react to it, and a rail
          // of tappable cards is not somewhere anyone selects text anyway.
          className={`flex gap-3 px-4 overflow-x-auto scrollbar-hide scroll-pl-4 outline-none select-none [&>*]:flex-shrink-0 [&>*]:snap-start ${
            dragging ? "cursor-grabbing" : "snap-x snap-mandatory"
          }`}
        >
          {children}
        </div>

        {/* The cut-off edge that says "there is more this way". */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-card to-transparent transition-opacity duration-200 ${
            scrollable && !atStart ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-card to-transparent transition-opacity duration-200 ${
            scrollable && !atEnd ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {scrollable && (
        <div className="flex justify-center gap-1.5 mt-3">
          {Array.from({ length: pageCount }).map((_, index) => (
            <button
              type="button"
              key={index}
              aria-label={`Go to page ${index + 1} of ${pageCount}`}
              aria-current={index === page}
              onClick={() => scrollToPage(index)}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                index === page ? "bg-primary w-4" : "bg-border hover:bg-muted-foreground w-1.5"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CardCarousel;
