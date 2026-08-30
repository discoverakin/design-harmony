import { useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CalendarRange,
  Clock,
  MapPin,
  Users,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useEvents } from "@/hooks/use-events";
import { useSavedEvents } from "@/hooks/use-saved-events";
import { useGoBack } from "@/hooks/use-go-back";
import { useActivityLog } from "@/hooks/use-activity-log";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { groups } from "@/data/community";
import { priceLabel } from "@/lib/format-price";
import { parseEventDates } from "@/lib/eventDates";


const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const redirectQuery = `redirect=${encodeURIComponent(pathname)}`;
  const {
    getEvent, markAttended, unmarkAttended, loading,
  } = useEvents();
  const { isSaved, toggleSave } = useSavedEvents();
  const goBack = useGoBack("/events");
  const { addLog, logs, deleteLog } = useActivityLog();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [showAttendedSheet, setShowAttendedSheet] = useState(false);
  const [attendedHours, setAttendedHours] = useState("");
  const [attendedMinutes, setAttendedMinutes] = useState("");

  const event = getEvent(id ?? "");

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

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

  const dateObj = new Date(event.date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const parsedDates = parseEventDates(event.description);

  const spotsLeft = event.max_attendees
    ? event.max_attendees - event.rsvp_count
    : null;

  // Find if there's already an activity log for this event
  const existingLog = logs.find(
    (l) => l.source === "event" && l.eventId === event.id
  );

  const handleSave = () => {
    const wasSaved = isSaved(event.id);
    toggleSave(event.id);
    toast({
      title: wasSaved ? "Removed from saved" : "Event saved! 🔖",
      description: wasSaved
        ? `Removed ${event.title} from your saved events`
        : `${event.title} saved for later`,
    });
  };


  const handleMarkAttended = () => {
    setShowAttendedSheet(true);
  };

  const handleConfirmAttended = () => {
    const totalMinutes =
      (parseInt(attendedHours || "0", 10) || 0) * 60 +
      (parseInt(attendedMinutes || "0", 10) || 0);

    if (totalMinutes <= 0) {
      toast({
        title: "Add duration",
        description: "How long did you spend at this event?",
        variant: "destructive",
      });
      return;
    }

    // Mark attended on the event (persists to Supabase)
    markAttended(event.id, totalMinutes);

    // Auto-log to activity tracker (still localStorage for now)
    addLog({
      hobbyName: event.title,
      emoji: event.emoji,
      durationMinutes: totalMinutes,
      date: event.date,
      note: `Attended "${event.title}" at ${event.location}`,
      source: "event",
      eventId: event.id,
      eventTitle: event.title,
    });

    toast({
      title: "Activity logged! ✅",
      description: `${event.title} — ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m added to your tracker.`,
    });

    setShowAttendedSheet(false);
    setAttendedHours("");
    setAttendedMinutes("");
  };

  const handleUnmarkAttended = () => {
    unmarkAttended(event.id);

    // Remove the associated activity log
    if (existingLog) {
      deleteLog(existingLog.id);
    }

    toast({
      title: "Attendance removed",
      description: "Activity log entry has been removed from your tracker.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-lg mx-auto shadow-xl">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-4 bg-secondary">
        <button
          onClick={goBack}
          className="p-2 -ml-2 rounded-lg hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h2 className="text-sm font-semibold text-foreground flex-1 truncate">
          Event Details
        </h2>
        <button
          onClick={handleSave}
          className="p-2 -mr-2 rounded-lg hover:bg-accent transition-colors"
        >
          {isSaved(event.id) ? (
            <BookmarkCheck className="w-5 h-5 text-primary" />
          ) : (
            <Bookmark className="w-5 h-5 text-foreground" />
          )}
        </button>
      </header>

      {/* Flyer */}
      {event.flyer_url && (
        <div className="w-full aspect-video bg-secondary overflow-hidden">
          <img
            src={event.flyer_url}
            alt={`${event.title} flyer`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <main className="flex-1 overflow-y-auto">
        <div className="bg-card rounded-t-3xl -mt-1 shadow-lg px-5 pt-6 pb-8">
          {/* Attended badge */}
          {event.has_attended && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-primary/10 border-2 border-primary/20">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">
                  You attended this event!
                </p>
                {event.attendance_minutes != null && (
                  <p className="text-[11px] text-muted-foreground">
                    {Math.floor(event.attendance_minutes / 60)}h{" "}
                    {event.attendance_minutes % 60}m logged to your tracker
                  </p>
                )}
              </div>
              <button
                onClick={handleUnmarkAttended}
                className="text-[11px] text-muted-foreground hover:text-destructive transition-colors font-medium"
              >
                Undo
              </button>
            </div>
          )}

          {/* Emoji + title */}
          <div className="flex items-start gap-3 mb-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary text-3xl flex-shrink-0">
              {event.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-foreground leading-tight">
                  {event.title}
                </h1>
                {/* Always shown, and never truncated here — this is where a
                    card's "Contact studio for pricing" has to be readable. */}
                <Badge variant="outline" className="text-xs font-semibold">
                  {priceLabel(event)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {event.group_name && (() => {
                  const linkedGroup = groups.find((g) => g.name === event.group_name);
                  return linkedGroup ? (
                    <Link
                      to={`/community/${linkedGroup.slug}`}
                      className="text-[11px] text-primary font-medium hover:underline"
                    >
                      by {event.group_name}
                    </Link>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">
                      by {event.created_by_name}
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Meta info */}
          <div className="space-y-2.5 mb-5">
            <div className="flex items-center gap-3 text-sm text-foreground">
              <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{formattedDate}</span>
            </div>
            {parsedDates.classification !== "single" && parsedDates.datesText && (
              <div className="flex items-start gap-3 text-sm text-foreground">
                <CalendarRange className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  <span className="font-medium">Dates:</span> {parsedDates.datesText}
                </span>
              </div>
            )}
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
                {event.rsvp_count} going
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

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-foreground mb-2">About this event</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Attendee info */}
          {event.rsvp_count > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-foreground mb-2">
                Who's going ({event.rsvp_count})
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {event.is_attending && (
                    <Badge variant="default" className="text-xs">
                      You
                    </Badge>
                  )}
                  {(() => {
                    const others = event.is_attending ? event.rsvp_count - 1 : event.rsvp_count;
                    return others > 0 ? (
                      <Badge variant="secondary" className="text-xs">
                        +{others} other{others !== 1 ? "s" : ""}
                      </Badge>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            {event.external_link ? (
              <a
                href={event.external_link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2"
              >
                🎟️ RSVP / Book Now
              </a>
            ) : (
              <button
                disabled
                className="w-full h-14 rounded-2xl bg-muted text-muted-foreground font-semibold text-base flex items-center justify-center gap-2 cursor-not-allowed"
              >
                Booking not available
              </button>
            )}

            {/* Mark as Attended — only show for RSVP'd users who haven't marked yet */}
            {event.is_attending && !event.has_attended && (
              <Button
                onClick={handleMarkAttended}
                variant="outline"
                className="w-full rounded-xl h-12 text-sm font-semibold gap-2 border-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark as Attended & Log Hours
              </Button>
            )}

          </div>
        </div>
      </main>

      {/* Attended duration sheet */}
      <Sheet open={showAttendedSheet} onOpenChange={setShowAttendedSheet}>
        <SheetContent side="bottom" className="rounded-t-3xl max-w-lg mx-auto pb-8">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-lg">Log Your Attendance</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 pt-2">
            {/* Event preview */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/60">
              <span className="text-2xl">{event.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {event.title}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formattedDate} · {event.time}
                </p>
              </div>
            </div>

            {/* Duration */}
            <div>
              <Label className="text-xs font-semibold">
                How long did you spend? *
              </Label>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1.5 flex-1">
                  <Input
                    type="number"
                    min={0}
                    max={23}
                    value={attendedHours}
                    onChange={(e) => setAttendedHours(e.target.value)}
                    placeholder="1"
                    className="rounded-xl text-center"
                  />
                  <span className="text-xs text-muted-foreground font-medium">
                    hr
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-1">
                  <Input
                    type="number"
                    min={0}
                    max={59}
                    value={attendedMinutes}
                    onChange={(e) => setAttendedMinutes(e.target.value)}
                    placeholder="30"
                    className="rounded-xl text-center"
                  />
                  <span className="text-xs text-muted-foreground font-medium">
                    min
                  </span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <Timer className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                This will be automatically logged to your{" "}
                <span className="font-semibold text-foreground">Hobby Tracker</span> as
                an activity linked to this event.
              </p>
            </div>

            {/* Submit */}
            <Button
              onClick={handleConfirmAttended}
              className="w-full rounded-xl h-11 text-sm font-semibold gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm & Log Activity
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Signup wall for anonymous visitors */}
      {!user && (
        <div className="fixed inset-x-0 bottom-0 z-40 pointer-events-none">
          <div className="max-w-lg mx-auto">
            {/* Fade + blur gradient covering bottom portion */}
            <div className="h-40 bg-gradient-to-b from-transparent to-card/95 backdrop-blur-sm" />
            {/* Solid sheet with CTA */}
            <div className="bg-card border-t border-border rounded-t-3xl shadow-2xl px-6 pt-6 pb-8 pointer-events-auto">
              <div className="w-12 h-1 bg-border rounded-full mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground text-center mb-2">
                Sign up to RSVP for this event
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-5">
                Create a free account to book classes and track your progress.
              </p>
              <button
                onClick={() => navigate(`/signup?type=seeker&${redirectQuery}`)}
                className="w-full h-12 rounded-2xl bg-[#FF5B3B] hover:bg-[#FF5B3B]/90 text-white font-semibold text-base mb-3 transition-colors"
              >
                Create Account
              </button>
              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <button
                  onClick={() => navigate(`/login?type=seeker&${redirectQuery}`)}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EventDetail;
