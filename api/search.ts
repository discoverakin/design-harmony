import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
  "hobby_slug": string | null, // one of: pottery, painting, drawing, knitting, ceramics,
                                //  photography, cooking, baking, yoga, meditation, dancing,
                                //  singing, guitar, piano, violin, woodworking, jewelry,
                                //  weaving, embroidery, calligraphy, origami, candle-making,
                                //  soap-making, leather-crafting, flower-arranging
  "mood": string | null,     // e.g. "relaxing", "social", "creative", "active"
  "time_of_day": string | null, // "morning", "afternoon", "evening", or null
  "date_filter": {
    "type": "exact_date" | "day_of_week" | "date_range" | null,
    "value": string | null,     // ISO date "YYYY-MM-DD" for exact_date, day name for day_of_week, or null
    "start": string | null,     // ISO date for date_range start, null otherwise
    "end": string | null        // ISO date for date_range end, null otherwise
  }
}

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
  } catch {
    // Fall through to fallback search
  }

  if (parsed) {
    let q = supabase
      .from("events")
      .select("*")
      .eq("status", "active")
      .order("date", { ascending: true })
      .limit(10);

    if (parsed.hobby_slug) {
      q = q.eq("hobby_slug", parsed.hobby_slug);
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

    return res.status(200).json({ results, parsed });
  }

  // Fallback: basic keyword search on title
  const { data, error } = await supabase
    .from("events")
    .select("*")
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
