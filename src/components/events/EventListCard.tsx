import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Users, ChevronRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CommunityEvent } from "@/data/events";
import { groups } from "@/data/community";

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

  const isToday = event.date === new Date().toISOString().split("T")[0];
  const isTomorrow =
    event.date === new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const isAttending = event.attendees.includes("You");
  const hasAttended = (event.attendedBy || []).includes("You");
  const spotsLeft = event.maxAttendees
    ? event.maxAttendees - event.attendees.length
    : null;

  return (
    <Link
      to={`/events/${event.id}`}
      className="block rounded-xl border-2 border-border bg-card hover:border-primary/30 transition-colors group overflow-hidden"
    >
      {/* Flyer thumbnail */}
      {event.flyerBase64 && !compact && (
        <div className="w-full h-32 overflow-hidden">
          <img
            src={event.flyerBase64}
            alt={`${event.title} flyer`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {event.title}
            </p>
            {hasAttended ? (
              <Badge className="text-[9px] px-1.5 py-0 flex-shrink-0 gap-0.5 bg-primary/15 text-primary border-0">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Attended
              </Badge>
            ) : isAttending ? (
              <Badge className="text-[9px] px-1.5 py-0 flex-shrink-0">Going</Badge>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
            <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {event.time}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
            <MapPin className="w-3 h-3" />
            {event.location}
          </span>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                {event.hobbyCategory}
              </Badge>
              {event.group && (() => {
                const linkedGroup = groups.find((g) => g.name === event.group);
                return linkedGroup ? (
                  <Link
                    to={`/community/${linkedGroup.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-primary font-medium truncate max-w-[100px] hover:underline"
                  >
                    {event.group}
                  </Link>
                ) : (
                  <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                    {event.group}
                  </span>
                );
              })()}
            </div>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              {event.attendees.length}
              {event.maxAttendees ? `/${event.maxAttendees}` : ""}
              {spotsLeft !== null && spotsLeft <= 5 && spotsLeft > 0 && (
                <span className="text-primary font-medium ml-0.5">
                  · {spotsLeft} left
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0 group-hover:text-primary transition-colors" />
      </div>
    </Link>
  );
};

export default EventListCard;
