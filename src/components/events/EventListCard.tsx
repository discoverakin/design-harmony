import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Users, ChevronRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SaveEventButton from "@/components/events/SaveEventButton";
import type { CommunityEvent } from "@/data/events";
import { groups } from "@/data/community";
import { priceLabel } from "@/lib/format-price";
import { parseEventDates, classificationLabel, hasKnownDate } from "@/lib/eventDates";
import { HOBBY_IMAGES } from "@/data/hobbyImages";


interface EventListCardProps {
  event: CommunityEvent;
  compact?: boolean;
}

const EventListCard = ({ event, compact = false }: EventListCardProps) => {
  const dateObj = new Date(event.date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const { classification } = parseEventDates(event.description);
  const chipLabel = classificationLabel(classification);
  // The anchor date is misleading for ongoing/multi events, so suppress TODAY/TMRW
  const isSingleDay = classification === "single";
  const isToday =
    isSingleDay && event.date === new Date().toISOString().split("T")[0];
  const isTomorrow =
    isSingleDay &&
    event.date === new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const spotsLeft = event.max_attendees
    ? event.max_attendees - event.rsvp_count
    : null;

  // Top thumbnail fallback chain: flyer_url → per-hobby image → (no thumbnail).
  // The emoji column below always renders as the final fallback.
  const hobbyImage = event.hobby_slug ? HOBBY_IMAGES[event.hobby_slug] : null;
  const sources = [event.flyer_url, hobbyImage].filter((s): s is string => !!s);
  const [attemptIdx, setAttemptIdx] = useState(0);
  const thumbSrc = sources[attemptIdx] ?? null;

  return (
    <Link
      to={`/events/${event.id}`}
      className="block rounded-xl border-2 border-border bg-card hover:border-primary/30 transition-colors group overflow-hidden"
    >
      {/* Top thumbnail (flyer → hobby image; emoji column below is the ultimate fallback) */}
      {thumbSrc && !compact && (
        <div className="w-full h-32 overflow-hidden">
          <img
            src={thumbSrc}
            alt={`${event.title} flyer`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setAttemptIdx((i) => i + 1)}
          />
        </div>
      )}

      <div className="flex items-start gap-3 p-4">
        {/* Emoji column */}
        <div className="flex flex-col items-center justify-center min-w-[44px] pt-0.5">
          <span className="text-2xl">{event.emoji}</span>
          {isToday && (
            <span className="text-[9px] font-bold text-primary mt-0.5">TODAY</span>
          )}
          {isTomorrow && (
            <span className="text-[9px] font-semibold text-muted-foreground mt-0.5">
              TMRW
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {event.title}
            </p>
            {/* Always rendered. Gating this on `price_cents > 0` left free and
                scraped-price classes showing no price at all — 41% of the
                upcoming list, and a tester's complaint that the cards carried
                emoji and little else. */}
            <Badge
              variant="outline"
              className="text-[9px] px-1.5 py-0 flex-shrink-0 font-semibold"
            >
              {priceLabel(event)}
            </Badge>
            {event.has_attended ? (
              <Badge className="text-[9px] px-1.5 py-0 flex-shrink-0 gap-0.5 bg-primary/15 text-primary border-0">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Attended
              </Badge>
            ) : event.is_attending ? (
              <Badge className="text-[9px] px-1.5 py-0 flex-shrink-0">Going</Badge>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
            <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
              <Calendar className="w-3 h-3" />
              {hasKnownDate(event.date) ? formattedDate : "Schedule varies"}
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {event.time}
            </span>
            {chipLabel && (
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-medium">
                {chipLabel}
              </Badge>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
            <MapPin className="w-3 h-3" />
            {event.location}
          </span>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {event.group_name && (() => {
                const linkedGroup = groups.find((g) => g.name === event.group_name);
                return linkedGroup ? (
                  <Link
                    to={`/community/${linkedGroup.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-primary font-medium truncate max-w-[120px] hover:underline"
                  >
                    {event.group_name}
                  </Link>
                ) : (
                  <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                    {event.group_name}
                  </span>
                );
              })()}
            </div>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              {event.rsvp_count}
              {event.max_attendees ? `/${event.max_attendees}` : ""}
              {spotsLeft !== null && spotsLeft <= 5 && spotsLeft > 0 && (
                <span className="text-primary font-medium ml-0.5">
                  · {spotsLeft} left
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Save + arrow. The whole card is a link, so the save button stops the
            tap itself (see SaveEventButton) and sits in its own column. */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <SaveEventButton eventId={event.id} title={event.title} variant="plain" />
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </Link>
  );
};

export default EventListCard;
