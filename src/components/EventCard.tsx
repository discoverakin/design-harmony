import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format-price";
import { parseEventDates, classificationLabel, hasKnownDate } from "@/lib/eventDates";
import { HOBBY_IMAGES } from "@/data/hobbyImages";

/**
 * Condense a free-form price string into a compact label.
 * "$35 for workshop and $60 for kit" → "from $35"
 * "$35–$325" → "from $35"
 * "$35" → "$35"
 * "TBD" → "TBD" (raw fallback)
 */
function summarizePriceDisplay(raw: string): string {
  const matches = [...raw.matchAll(/\$(\d+(?:\.\d{1,2})?)/g)];
  if (matches.length === 0) return raw;
  const parsed = matches.map((m) => ({ raw: m[1], num: parseFloat(m[1]) }));
  const unique = [...new Set(parsed.map((p) => p.num))];
  if (unique.length === 1) return `$${parsed[0].raw}`;
  const min = Math.min(...unique);
  const minRaw = parsed.find((p) => p.num === min)!.raw;
  return `from $${minRaw}`;
}

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  price_cents: number;
  emoji: string;
  flyer_url?: string | null;
  hobby_slug?: string | null;
  /** Free-form price string (e.g. "$35–$325") preferred over the derived price when set. */
  price_display?: string | null;
  /** When true, the CTA always links to /events/:id, ignoring hobby_slug. */
  forceEventDetail?: boolean;
  /** Optional description; used to detect and label multi-date/ongoing events. */
  description?: string | null;
}

const EventCard = ({
  id,
  title,
  date,
  time,
  location,
  price_cents,
  emoji,
  flyer_url,
  hobby_slug,
  price_display,
  forceEventDetail = false,
  description,
}: EventCardProps) => {
  const { classification } = parseEventDates(description);
  const chipLabel = classificationLabel(classification);

  // Image fallback chain: flyer_url → per-hobby image → emoji. Failed loads (onError)
  // advance to the next candidate, ultimately falling through to the emoji block.
  const hobbyImage = hobby_slug ? HOBBY_IMAGES[hobby_slug] : null;
  const sources = [flyer_url, hobbyImage].filter((s): s is string => !!s);
  const [attemptIdx, setAttemptIdx] = useState(0);
  const imageSrc = sources[attemptIdx] ?? null;

  const dateObj = new Date(date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const formattedTime = (() => {
    const match = time?.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return time;
    const dt = new Date(`${date}T${time}`);
    return dt.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  })();

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Image (flyer → hobby image) with emoji fallback on missing or failed load */}
      {imageSrc ? (
        <div className="w-full h-24 bg-secondary overflow-hidden">
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover"
            onError={() => setAttemptIdx((i) => i + 1)}
          />
        </div>
      ) : (
        <div className="w-full h-24 bg-secondary/60 flex items-center justify-center">
          <span className="text-5xl">{emoji}</span>
        </div>
      )}

      {/* Content */}
      <div className="p-3 space-y-1.5">
        <h3 className="text-xs font-semibold text-foreground leading-tight line-clamp-2">
          {title}
        </h3>

        {/* Price + optional multi-date chip on the same row so tile heights stay uniform */}
        <div className="flex items-center justify-between gap-2">
          {price_display ? (
            <span className="text-[10px] text-muted-foreground">
              {summarizePriceDisplay(price_display)}
            </span>
          ) : (
            <span className="text-sm font-bold text-[#FF5B3B]">
              {formatPrice(price_cents)}
            </span>
          )}
          {chipLabel && (
            <Badge
              variant="secondary"
              className="text-[9px] px-1.5 py-0 font-medium flex-shrink-0"
            >
              {chipLabel}
            </Badge>
          )}
        </div>

        <div className="space-y-0.5">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5 flex-shrink-0" />
            {hasKnownDate(date) ? `${formattedDate} · ${formattedTime}` : "Schedule varies"}
          </p>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1 truncate">
            <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
            {location}
          </p>
        </div>

        <Link to={hobby_slug && !forceEventDetail ? `/hobby/${hobby_slug}` : `/events/${id}`}>
          <Button className="w-full rounded-lg h-8 text-xs font-semibold mt-1.5">
            Book Now
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
