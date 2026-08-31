import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { weeklyShuffle } from "@/lib/weeklyShuffle";
import { isUpcoming } from "@/lib/eventDates";
import EventCard from "@/components/EventCard";
import CardCarousel from "@/components/CardCarousel";

interface FeaturedEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  emoji: string;
  price_cents: number;
  price_display: string | null;
  hobby_slug: string | null;
  flyer_url: string | null;
  description: string | null;
  lat: number | null;
  lng: number | null;
}

const FEATURED_COUNT = 8;
const POOL_LIMIT = 200;

const FeaturedThisWeek = () => {
  const [pool, setPool] = useState<FeaturedEvent[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Fetch approved events without a server-side date filter so ongoing/multi
    // events with past anchor dates aren't dropped; isUpcoming filters below.
    supabase
      .from("events")
      .select(
        "id, title, date, time, location, emoji, price_cents, price_display, hobby_slug, flyer_url, description, lat, lng"
      )
      .eq("status", "approved")
      .order("date", { ascending: true })
      .limit(POOL_LIMIT)
      .then(({ data }) => {
        if (cancelled) return;
        setPool((data ?? []) as FeaturedEvent[]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const featured = useMemo(() => {
    if (!pool) return null;
    const upcoming = pool.filter((e) => isUpcoming(e));
    return weeklyShuffle(upcoming).slice(0, FEATURED_COUNT);
  }, [pool]);

  if (featured === null) {
    return (
      <CardCarousel title="Featured this week" label="Featured events this week">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="w-40 rounded-xl border border-border bg-card overflow-hidden animate-pulse"
          >
            <div className="w-full h-24 bg-secondary" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-secondary rounded w-3/4" />
              <div className="h-3 bg-secondary rounded w-1/2" />
              <div className="h-3 bg-secondary rounded w-2/3" />
            </div>
          </div>
        ))}
      </CardCarousel>
    );
  }

  if (featured.length === 0) return null;

  return (
    <CardCarousel title="Featured this week" label="Featured events this week">
      {featured.map((evt) => (
        <div key={evt.id} className="w-40">
          <EventCard
            id={evt.id}
            title={evt.title}
            date={evt.date}
            time={evt.time}
            location={evt.location}
            price_cents={evt.price_cents}
            price_display={evt.price_display}
            emoji={evt.emoji}
            flyer_url={evt.flyer_url}
            hobby_slug={evt.hobby_slug}
            description={evt.description}
            lat={evt.lat}
            lng={evt.lng}
            forceEventDetail
          />
        </div>
      ))}
    </CardCarousel>
  );
};

export default FeaturedThisWeek;
