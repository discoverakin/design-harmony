import type { IncomingMessage, ServerResponse } from "http";
import { createClient } from "@supabase/supabase-js";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;
const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
    console.log("Parsed intent:", JSON.stringify(parsed));
  } catch (err) {
    console.log("Claude parse error:", err);
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
    console.log("Supabase results count:", data?.length);
    console.log("Supabase error:", error);

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
