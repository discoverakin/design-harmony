import { Link } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format-price";

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
}: EventCardProps) => {
  const dateObj = new Date(date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="rounded-xl border-2 border-border bg-card overflow-hidden shadow-sm">
      {/* Image or placeholder */}
      {flyer_url ? (
        <div className="w-full aspect-[2/1] bg-secondary overflow-hidden">
          <img
            src={flyer_url}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-24 bg-secondary/60 flex items-center justify-center">
          <span className="text-4xl">{emoji}</span>
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground leading-tight">
            {title}
          </h3>
          <span className="text-xs font-semibold text-primary flex-shrink-0">
            {formatPrice(price_cents)}
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formattedDate} · {time}
          </p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {location}
          </p>
        </div>

        <Link to={hobby_slug ? `/hobby/${hobby_slug}` : `/events/${id}`}>
          <Button className="w-full rounded-xl h-10 text-sm font-semibold mt-2">
            Book Now
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
