import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEvents } from "@/hooks/use-events";
import { useToast } from "@/hooks/use-toast";

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEvent, toggleRSVP, toggleSave } = useEvents();
  const { toast } = useToast();

  const event = getEvent(id ?? "");

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background max-w-lg mx-auto px-5">
        <p className="text-4xl mb-3">😕</p>
        <p className="text-lg font-semibold text-foreground">Event not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/events")}>
          Back to Events
        </Button>
      </div>
    );
  }

  const isAttending = event.attendees.includes("You");
  const isSaved = event.savedBy.includes("You");

  const dateObj = new Date(event.date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const spotsLeft = event.maxAttendees
    ? event.maxAttendees - event.attendees.length
    : null;

  const handleRSVP = () => {
    toggleRSVP(event.id);
    toast({
      title: isAttending ? "RSVP cancelled" : "You're going! 🎉",
      description: isAttending
        ? `Removed from ${event.title}`
        : `Added to ${event.title}`,
    });
  };

  const handleSave = () => {
    toggleSave(event.id);
    toast({
      title: isSaved ? "Removed from saved" : "Event saved! 🔖",
      description: isSaved
        ? `Removed ${event.title} from your saved events`
        : `${event.title} saved for later`,
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share?.({
        title: event.title,
        text: `${event.title} – ${formattedDate} at ${event.location}`,
        url: window.location.href,
      });
    } catch {
      toast({ title: "Link copied!", description: "Share this event with friends." });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-lg mx-auto shadow-xl">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-4 bg-secondary">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-lg hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h2 className="text-sm font-semibold text-foreground flex-1 truncate">
          Event Details
        </h2>
        <button
          onClick={handleShare}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
        >
          <Share2 className="w-5 h-5 text-foreground" />
        </button>
        <button
          onClick={handleSave}
          className="p-2 -mr-2 rounded-lg hover:bg-accent transition-colors"
        >
          {isSaved ? (
            <BookmarkCheck className="w-5 h-5 text-primary" />
          ) : (
            <Bookmark className="w-5 h-5 text-foreground" />
          )}
        </button>
      </header>

      {/* Flyer */}
      {event.flyerBase64 && (
        <div className="w-full aspect-video bg-secondary overflow-hidden">
          <img
            src={event.flyerBase64}
            alt={`${event.title} flyer`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <main className="flex-1 overflow-y-auto">
        <div className="bg-card rounded-t-3xl -mt-1 shadow-lg px-5 pt-6 pb-8">
          {/* Emoji + title */}
          <div className="flex items-start gap-3 mb-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary text-3xl flex-shrink-0">
              {event.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-foreground leading-tight">
                {event.title}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-[10px]">
                  {event.hobbyCategory}
                </Badge>
                {event.group && (
                  <span className="text-[11px] text-muted-foreground">
                    by {event.group}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Meta info */}
          <div className="space-y-2.5 mb-5">
            <div className="flex items-center gap-3 text-sm text-foreground">
              <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground">
              <Clock className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground">
              <Users className="w-4 h-4 text-primary flex-shrink-0" />
              <span>
                {event.attendees.length} going
                {spotsLeft !== null && spotsLeft > 0 && (
                  <span className="text-muted-foreground">
                    {" "}
                    · {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
                  </span>
                )}
                {spotsLeft !== null && spotsLeft <= 0 && (
                  <span className="text-destructive font-medium"> · Full</span>
                )}
              </span>
            </div>
          </div>

          {/* External link */}
          {event.externalLink && (
            <a
              href={event.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary font-medium mb-5 hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              View original post
            </a>
          )}

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-foreground mb-2">About this event</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Attendees preview */}
          {event.attendees.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-foreground mb-2">
                Who's going ({event.attendees.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.attendees.map((name) => (
                  <Badge
                    key={name}
                    variant={name === "You" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* RSVP button */}
          <Button
            onClick={handleRSVP}
            className="w-full rounded-xl h-12 text-sm font-semibold"
            variant={isAttending ? "secondary" : "default"}
            disabled={!isAttending && spotsLeft !== null && spotsLeft <= 0}
          >
            {isAttending
              ? "Cancel RSVP"
              : spotsLeft !== null && spotsLeft <= 0
              ? "Event Full"
              : "RSVP — I'm Going! 🎉"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default EventDetail;
