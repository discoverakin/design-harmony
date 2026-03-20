import { useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Clock, Calendar, Users } from "lucide-react";
import { getHobbyBySlug } from "@/data/hobbies";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { useEvents } from "@/hooks/use-events";
import { formatPrice } from "@/lib/format-price";

const HobbyDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const hobby = getHobbyBySlug(slug || "");
  const { getEventsByHobby, loading } = useEvents();
  const classesRef = useRef<HTMLElement>(null);

  if (!hobby) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background max-w-lg mx-auto">
        <p className="text-lg text-muted-foreground">Hobby not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>
          Go back
        </Button>
      </div>
    );
  }

  const hobbyEvents = getEventsByHobby(hobby.slug);

  const handleGetStarted = () => {
    classesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-lg mx-auto shadow-xl">
      {/* Hero */}
      <div
        className="relative px-4 pt-6 pb-10"
        style={{ backgroundColor: hobby.bgColor }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-4">
          <span className="text-6xl">{hobby.emoji}</span>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground leading-tight">
              {hobby.label}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-4">
        <div className="bg-card rounded-t-3xl -mt-4 shadow-lg px-5 pt-6">
          {/* Description */}
          <section className="mb-6">
            <h2 className="text-lg font-bold text-foreground mb-2">About</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {hobby.description}
            </p>
          </section>

          {/* Benefits */}
          <section className="mb-6">
            <h2 className="text-lg font-bold text-foreground mb-3">Why try it?</h2>
            <ul className="space-y-2">
              {hobby.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2">
                  <span className="mt-1 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Classes & Events */}
          <section className="mb-6" ref={classesRef}>
            <h2 className="text-lg font-bold text-foreground mb-3">
              <MapPin className="w-4 h-4 inline-block mr-1 text-primary -mt-0.5" />
              {hobbyEvents.length > 0 ? "Upcoming classes & events" : "Nearby classes"}
            </h2>

            {/* Live events from Supabase */}
            {hobbyEvents.length > 0 ? (
              <div className="space-y-3">
                {hobbyEvents.map((event) => {
                  const dateObj = new Date(event.date + "T00:00:00");
                  const formatted = dateObj.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  });
                  return (
                    <Link
                      key={event.id}
                      to={`/events/${event.id}`}
                      className="flex items-center gap-3 w-full p-4 rounded-xl border-2 border-border bg-card hover:bg-secondary/40 transition-colors text-left"
                    >
                      <span className="text-2xl flex-shrink-0">{event.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {event.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                            <Calendar className="w-3 h-3" />
                            {formatted} · {event.time}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </span>
                        {event.rsvp_count > 0 && (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                            <Users className="w-3 h-3" />
                            {event.rsvp_count} going
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-xs font-semibold text-primary">
                          {formatPrice(event.price_cents)}
                        </span>
                        {event.max_attendees && (
                          <span className="text-[10px] text-muted-foreground">
                            {Math.max(0, event.max_attendees - event.rsvp_count)} spots left
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-6">
                <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              /* Fallback: static nearbyClasses */
              <div className="space-y-3">
                {hobby.nearbyClasses.map((cls) => (
                  <div
                    key={cls.name}
                    className="flex items-center justify-between w-full p-4 rounded-xl border-2 border-border bg-card text-left"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{cls.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {cls.location}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="flex items-center gap-0.5 text-xs font-medium text-foreground">
                        <Star className="w-3 h-3 fill-primary text-primary" />
                        {cls.rating}
                      </span>
                      <span className="text-xs text-muted-foreground">{cls.price}</span>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground text-center pt-1">
                  No upcoming events yet — check back soon!
                </p>
              </div>
            )}
          </section>

          {/* CTA */}
          <Button
            className="w-full rounded-xl h-12 text-base font-semibold mb-4"
            onClick={handleGetStarted}
          >
            Get started
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default HobbyDetail;
