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
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Image or placeholder */}
      {flyer_url ? (
        <div className="w-full h-24 bg-secondary overflow-hidden">
          <img
            src={flyer_url}
            alt={title}
            className="w-full h-full object-cover"
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

        <span className="text-sm font-bold text-[#E8604A] block">
          {formatPrice(price_cents)}
        </span>

        <div className="space-y-0.5">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5 flex-shrink-0" />
            {formattedDate} · {time}
          </p>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1 truncate">
            <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
            {location}
          </p>
        </div>

        <Link to={hobby_slug ? `/hobby/${hobby_slug}` : `/events/${id}`}>
          <Button className="w-full rounded-lg h-8 text-xs font-semibold mt-1.5">
            Book Now
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
