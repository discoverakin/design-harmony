import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Users, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CommunityEvent } from "@/data/events";

interface EventListCardProps {
  event: CommunityEvent;
}

const EventListCard = ({ event }: EventListCardProps) => {
  const dateObj = new Date(event.date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      to={`/events/${event.id}`}
      className="flex items-start gap-3 p-4 rounded-xl border-2 border-border bg-card hover:border-primary/30 transition-colors group"
    >
      {/* Emoji column */}
      <div className="flex flex-col items-center justify-center min-w-[44px] pt-0.5">
        <span className="text-2xl">{event.emoji}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {event.title}
        </p>
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
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
            {event.hobbyCategory}
          </Badge>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" />
            {event.attendees.length}
            {event.maxAttendees ? `/${event.maxAttendees}` : ""} going
          </span>
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0 group-hover:text-primary transition-colors" />
    </Link>
  );
};

export default EventListCard;
