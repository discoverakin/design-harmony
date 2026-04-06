import type { IncomingMessage, ServerResponse } from "http";
import { createClient } from "@supabase/supabase-js";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;
const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const ANN_ARBOR_LANDMARKS: Record<string, { lat: number; lng: number }> = {
  'downtown': { lat: 42.2808, lng: -83.7430 },
  'main street': { lat: 42.2795, lng: -83.7480 },
  'south main': { lat: 42.2750, lng: -83.7480 },
  'north main': { lat: 42.2917, lng: -83.7489 },
  'burns park': { lat: 42.2776, lng: -83.7409 },
  'gallup park': { lat: 42.2766, lng: -83.7191 },
  'kerrytown': { lat: 42.2866, lng: -83.7450 },
  'central campus': { lat: 42.2780, lng: -83.7382 },
  'north campus': { lat: 42.2942, lng: -83.7102 },
  'state street': { lat: 42.2739, lng: -83.7408 },
  'liberty street': { lat: 42.2794, lng: -83.7483 },
  'michigan theater': { lat: 42.2794, lng: -83.7468 },
  'argus farm': { lat: 42.2794, lng: -83.7501 },
  'planet rock': { lat: 42.2697, lng: -83.6989 },
  'nichols arboretum': { lat: 42.2808, lng: -83.7280 },
  'fuller park': { lat: 42.2985, lng: -83.7191 },
  'eberwhite': { lat: 42.2700, lng: -83.7600 },
  'old west side': { lat: 42.2794, lng: -83.7600 },
};

const PROXIMITY_RADIUS = 0.012; // ~0.8 miles in degrees

const MOOD_TO_HOBBIES: Record<string, string[]> = {
  relaxing: ["yoga", "fitness", "reading", "gardening", "knitting"],
  stressed: ["yoga", "fitness", "pottery", "gardening"],
  creative: ["pottery", "photography", "film-making", "arts-crafts", "writing"],
  social: ["dance", "cooking", "board-sports", "gaming"],
  adventurous: ["hiking", "rock-climbing", "board-sports", "martial-arts"],
  bored: ["gaming", "coding", "reading", "board-sports", "astronomy"],
  fun: ["dance", "cooking", "gaming", "board-sports"],
  active: ["fitness", "hiking", "rock-climbing", "swimming", "martial-arts"],
};

function buildSystemPrompt(): string {
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const todayISO = new Date().toISOString().split("T")[0];

  return `You are a search assistant for Discover Akin, a marketplace for creative studio classes in Ann Arbor.
Today's date is ${todayFormatted} (${todayISO}).

Extract search intent from the user's query and return ONLY a JSON object with these fields:
{
  "keywords": string,        // key topic words (e.g. "pottery", "painting", "yoga")
  "hobby_slug": string | null, // one of: arts-crafts, astronomy, board-sports, coding, cooking,
                                //  dance, film-making, fitness, gaming, gardening, hiking, knitting,
                                //  languages, martial-arts, music, photography, pottery, reading,
                                //  rock-climbing, sports, swimming, volunteering, woodworking,
                                //  writing, yoga
  "mood": string | null,     // Map vague queries aggressively to moods:
                            //   "relaxing", "chill", "calm", "peaceful" → "relaxing"
                            //   "fun", "exciting", "something to do" → "fun"
                            //   "creative", "artsy", "make something" → "creative"
                            //   "meet people", "social", "with friends" → "social"
                            //   "stressed", "need to unwind", "de-stress" → "stressed"
                            //   "bored", "nothing to do" → "bored"
                            //   "adventurous", "try something new" → "adventurous"
  "time_of_day": string | null, // "morning", "afternoon", "evening", or null
  "location_hint": string | null, // extracted location/area, or null
  "date_filter": {
    "type": "exact_date" | "day_of_week" | "date_range" | null,
    "value": string | null,     // ISO date "YYYY-MM-DD" for exact_date, day name for day_of_week, or null
    "start": string | null,     // ISO date for date_range start, null otherwise
    "end": string | null        // ISO date for date_range end, null otherwise
  }
}

IMPORTANT: If the user mentions a specific activity by name that matches one of the hobby_slug values, always set hobby_slug to that slug — never leave it null.
Examples:
- "hiking next weekend" → hobby_slug: "hiking"
- "pottery class" → hobby_slug: "pottery"
- "cooking something fun" → hobby_slug: "cooking"
- "yoga near me" → hobby_slug: "yoga"
- "arts and crafts" → hobby_slug: "arts-crafts"
- "rock climbing" → hobby_slug: "rock-climbing"

If the user mentions a specific Ann Arbor location, neighborhood, street or landmark, extract it as location_hint (lowercase text). Examples:
- "near Burns Park" → location_hint: "burns park"
- "classes on State Street" → location_hint: "state street"
- "something downtown" → location_hint: "downtown"
- "near campus" → location_hint: "central campus"
- "on Liberty" → location_hint: "liberty street"
- "near the arb" → location_hint: "nichols arboretum"
- "near Kerrytown" → location_hint: "kerrytown"
- "north campus area" → location_hint: "north campus"
- "near Gallup" → location_hint: "gallup park"
- "by Michigan Theater" → location_hint: "michigan theater"
Known areas: downtown, main street, south main, north main, burns park, gallup park, kerrytown, central campus, north campus, state street, liberty street, michigan theater, argus farm, planet rock, nichols arboretum, fuller park, eberwhite, old west side.
If they say "near me" or "nearby", set location_hint to "downtown" as default.

Date filter examples:
- "this Saturday" → type: "exact_date", value: the next Saturday's ISO date
- "this weekend" → type: "date_range", start: next Saturday ISO, end: next Sunday ISO
- "on Fridays" → type: "day_of_week", value: "Friday"
- "next week" → type: "date_range", start: next Monday ISO, end: next Sunday ISO
- No time reference → type: null, value: null

Return only valid JSON, no markdown, no explanation.`;
}

interface DateFilter {
  type: "exact_date" | "day_of_week" | "date_range" | null;
  value: string | null;
  start?: string | null;
  end?: string | null;
}

interface ParsedSearch {
  keywords: string;
  hobby_slug: string | null;
  mood: string | null;
  time_of_day: string | null;
  location_hint: string | null;
  date_filter: DateFilter;
}

async function parseQueryWithClaude(query: string): Promise<ParsedSearch | null> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 256,
      system: buildSystemPrompt(),
      messages: [{ role: "user", content: query }],
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const text = data.content?.[0]?.text;
  if (!text) return null;

  return JSON.parse(text) as ParsedSearch;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.body;
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Missing query" });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const today = new Date().toISOString().split("T")[0];

  let parsed: ParsedSearch | null = null;

  try {
    parsed = await parseQueryWithClaude(query);
  } catch (err) {
    // parse failed — fall through to keyword search
  }

  if (parsed) {
    let q = supabase
      .from("events")
      .select("*")
      .eq("status", "approved")
      .order("date", { ascending: true })
      .limit(10);

    if (parsed.hobby_slug) {
      q = q.eq("hobby_slug", parsed.hobby_slug);
    } else if (parsed.mood && MOOD_TO_HOBBIES[parsed.mood]) {
      q = q.in("hobby_slug", MOOD_TO_HOBBIES[parsed.mood]);
    } else if (parsed.keywords) {
      q = q.ilike("title", `%${parsed.keywords}%`);
    }

    // Proximity-based location search
    const searchCoords = parsed.location_hint
      ? ANN_ARBOR_LANDMARKS[parsed.location_hint.toLowerCase()]
      : null;

    if (searchCoords) {
      // Fetch all upcoming approved events with coordinates, then filter by proximity
      const { data: allEvents } = await supabase
        .from("events")
        .select("*")
        .eq("status", "approved")
        .gte("date", today)
        .not("lat", "is", null)
        .not("lng", "is", null);

      let nearbyEvents = (allEvents ?? []).filter((event) => {
        const latDiff = Math.abs(event.lat - searchCoords.lat);
        const lngDiff = Math.abs(event.lng - searchCoords.lng);
        return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) < PROXIMITY_RADIUS;
      });

      // Apply hobby/mood/keyword filter on nearby results
      if (parsed.hobby_slug) {
        nearbyEvents = nearbyEvents.filter((e) => e.hobby_slug === parsed!.hobby_slug);
      } else if (parsed.mood && MOOD_TO_HOBBIES[parsed.mood]) {
        nearbyEvents = nearbyEvents.filter((e) => MOOD_TO_HOBBIES[parsed!.mood!].includes(e.hobby_slug));
      }

      nearbyEvents.sort((a, b) => a.date.localeCompare(b.date));

      return res.status(200).json({
        results: nearbyEvents.slice(0, 10),
        parsed,
        location_used: parsed.location_hint,
      });
    }

    // No coordinates — fall back to text-based location filter
    if (parsed.location_hint) {
      q = q.ilike("location", `%${parsed.location_hint}%`);
    }

    const df = parsed.date_filter;
    if (df?.type === "exact_date" && df.value) {
      q = q.eq("date", df.value);
    } else if (df?.type === "date_range" && df.start && df.end) {
      q = q.gte("date", df.start).lte("date", df.end);
    } else if (df?.type === "day_of_week" && df.value) {
      // day_of_week filtering isn't supported via PostgREST filters,
      // so fetch future events and filter in JS
      q = q.gte("date", today);
    } else {
      q = q.gte("date", today);
    }

    const { data, error } = await q;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    let results = data ?? [];

    // Client-side day-of-week filter
    if (df?.type === "day_of_week" && df.value) {
      const targetDay = df.value.toLowerCase();
      results = results.filter((e) => {
        const dayName = new Date(e.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
        return dayName === targetDay;
      });
    }

    if (results.length === 0) {
      // Tier 2: try hobby_slug without date
      if (parsed.hobby_slug) {
        const { data: t2 } = await supabase
          .from("events").select("*")
          .eq("status", "approved")
          .eq("hobby_slug", parsed.hobby_slug)
          .gte("date", today).order("date").limit(10);
        if (t2 && t2.length > 0)
          return res.status(200).json({ results: t2, parsed, fallback: "hobby_only" });
      }

      // Tier 3: try mood slugs without date
      if (parsed.mood && MOOD_TO_HOBBIES[parsed.mood]) {
        const { data: t3 } = await supabase
          .from("events").select("*")
          .eq("status", "approved")
          .in("hobby_slug", MOOD_TO_HOBBIES[parsed.mood])
          .gte("date", today).order("date").limit(10);
        if (t3 && t3.length > 0)
          return res.status(200).json({ results: t3, parsed, fallback: "mood_only" });
      }

      // Tier 4: return any upcoming events
      const { data: t4 } = await supabase
        .from("events").select("*")
        .eq("status", "approved")
        .gte("date", today).order("date").limit(10);
      return res.status(200).json({ results: t4 ?? [], parsed, fallback: "all_events" });
    }

    return res.status(200).json({ results, parsed });
  }

  // Fallback: basic keyword search on title
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "approved")
    .eq("status", "active")
    .gte("date", today)
    .ilike("title", `%${query}%`)
    .order("date", { ascending: true })
    .limit(10);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ results: data, parsed: null });
}
