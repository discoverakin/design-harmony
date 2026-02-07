import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CommunityEvent } from "@/data/community";

interface CommunityEventCardProps {
  event: CommunityEvent;
}

const CommunityEventCard = ({ event }: CommunityEventCardProps) => (
  <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-border bg-card">
    <div className="flex flex-col items-center justify-center min-w-[44px] pt-0.5">
      <span className="text-2xl">{event.emoji}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-foreground">{event.title}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
        <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
          <Calendar className="w-3 h-3" />
          {event.date}
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
        <Link to={`/community/${event.groupSlug}`}>
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 hover:bg-secondary/80 cursor-pointer">
            {event.group}
          </Badge>
        </Link>
        <span className="text-[11px] text-muted-foreground">
          {event.attendees} going
        </span>
      </div>
    </div>
  </div>
);

export default CommunityEventCard;
