import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;
const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Pin the model. The previous value (claude-sonnet-4-20250514) was retired on
// 2026-06-15, so every parse 404'd and search silently degraded to raw keyword
// matching for two months. Check the model is still current before assuming a
// search bug is a search bug.
const SEARCH_MODEL = "claude-sonnet-5";

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
  relaxing: ["arts-crafts", "pottery", "knitting"],
  stressed: ["pottery", "knitting", "arts-crafts"],
  creative: ["arts-crafts", "pottery", "knitting", "music", "performing-arts"],
  artistic: ["arts-crafts", "pottery", "knitting", "music", "performing-arts"],
  social: ["cooking", "dance", "music", "performing-arts"],
  fun: ["cooking", "dance", "music", "performing-arts"],
  "meet people": ["cooking", "dance", "music", "performing-arts"],
  learn: ["coding", "cooking", "pottery"],
  skill: ["coding", "cooking", "pottery"],
  active: ["dance"],
  energetic: ["dance"],
  food: ["cooking"],
  bake: ["cooking"],
  eat: ["cooking"],
  tech: ["coding"],
  make: ["coding"],
  build: ["coding"],
  bored: ["coding", "cooking", "dance", "performing-arts"],
  adventurous: ["dance", "coding", "performing-arts"],
};

/**
 * The live `events.hobby_slug` vocabulary is far wider than the seven slugs in
 * src/data/hobbies.ts that Claude is allowed to return — real listings use
 * `baking`, `crochet`, `ceramics`, `3d-printing` and ~25 more. Without this
 * map the hobby path never matches anything ("baking class" parses to
 * `cooking`, which no row has) and mood queries collapse to "here is
 * everything", because every mood resolves to slugs that are absent too.
 *
 * Each entry is canonical-first: [0] is the slug Claude returned, the rest are
 * the live slugs that mean the same thing. `performing-arts` is reachable only
 * through moods — it is deliberately absent from the prompt's enum, because
 * hobby pages (`/hobby/:slug`) exist only for the seven in hobbies.ts.
 *
 * The real fix is reconciling the taxonomy in one place; until then this keeps
 * search honest. See "Two disagreeing hobby taxonomies" in CLAUDE.md.
 */
const HOBBY_SLUG_ALIASES: Record<string, string[]> = {
  cooking: ["cooking", "baking", "pastry", "chocolate-making", "cocktail-making", "wine-tasting"],
  "arts-crafts": [
    "arts-crafts", "drawing", "painting", "printmaking", "sculpture",
    "candle-making", "jewelry-making", "floral-design", "stained-glass",
    "glasswork", "fiber-arts",
  ],
  pottery: ["pottery", "ceramics"],
  knitting: ["knitting", "crochet", "sewing", "quilting", "fiber-arts"],
  coding: ["coding", "electronics", "robotics", "3d-printing", "maker-space", "makerspace"],
  dance: ["dance"],
  music: ["music", "singing"],
  "performing-arts": ["performing-arts", "improv", "acting", "theatre", "filmmaking"],
};

/** Canonical slug -> every live slug that means the same thing, canonical first. */
export function expandHobbySlug(slug: string | null | undefined): string[] {
  if (!slug) return [];
  return HOBBY_SLUG_ALIASES[slug] ?? [slug];
}

/** Mood -> the live slugs its hobbies cover, de-duplicated. */
export function expandMood(mood: string | null | undefined): string[] {
  if (!mood) return [];
  const canonical = MOOD_TO_HOBBIES[mood];
  if (!canonical) return [];
  return Array.from(new Set(canonical.flatMap(expandHobbySlug)));
}

/* ------------------------------------------------------------------------ *
 * Keyword matching
 *
 * Search used to be `title ILIKE %keywords%` and nothing else, so a class only
 * surfaced when the query words appeared in its *title*. "free" matched only
 * because some titles happen to contain the word; a style or genre that lives
 * in the description ("wet felting", "wheel throwing") matched nothing. That
 * undercuts the "you don't need the exact keywords" promise, so matching now
 * spans the record: title, description, location, group name, hobby slug, and
 * the per-event `search_terms` column (migration 012) for curated synonyms.
 *
 * `created_by_name` is deliberately NOT searchable — default display names are
 * derived from the account's email local part, and making them queryable would
 * turn search into an email-fragment probe. See the privacy note in CLAUDE.md.
 * ------------------------------------------------------------------------ */

const TEXT_COLUMNS = ["title", "description", "location", "group_name"] as const;

/** Relative worth of a hit, per field. Title beats body copy. */
const FIELD_WEIGHTS = {
  title: 5,
  search_terms: 4,
  hobby_slug: 3,
  description: 2,
  location: 1,
  group_name: 1,
};

/** Bonus for an event whose hobby_slug is exactly the one Claude parsed. */
const HOBBY_MATCH_BONUS = 6;

/** Bonus for a sibling slug — same hobby, different name in the data. */
const HOBBY_ALIAS_BONUS = 4;

/** Weight applied to Claude's `related_terms` — recall helpers, not the ask. */
const RELATED_TERM_WEIGHT = 0.4;

const MAX_PRIMARY_TERMS = 5;
const MAX_RELATED_TERMS = 4;
const RESULT_LIMIT = 20;
const FETCH_LIMIT = 60;

/**
 * Words that appear in almost every class listing, so matching on them returns
 * everything and ranks nothing.
 */
const STOPWORDS = new Set([
  "a", "an", "and", "any", "are", "around", "at", "beginner", "beginners",
  "best", "by", "can", "class", "classes", "course", "courses", "do", "event",
  "events", "find", "for", "from", "fun", "get", "good", "great", "group",
  "have", "help", "how", "in", "into", "is", "it", "join", "learn", "lesson",
  "lessons", "like", "looking", "me", "my", "near", "nearby", "new", "of",
  "on", "one", "or", "session", "sessions", "show", "some", "something",
  "studio", "thing", "things", "the", "there", "this", "to", "try", "up",
  "want", "was", "what", "where", "which", "with", "workshop", "workshops",
  "would", "you", "your",
]);

/**
 * Mirror of the `tags` arrays in src/data/hobbies.ts. Duplicated rather than
 * imported because api/* is bundled standalone (api/quiz.ts inlines the same
 * taxonomy). Used only as a vocabulary check, so it can drift a little without
 * breaking anything — but keep it in sync when hobbies.ts gains tags.
 */
const HOBBY_TAGS: Record<string, string[]> = {
  cooking: ["baking", "cuisine", "recipe", "chef", "food", "meal prep", "grilling", "pastry", "fermentation"],
  "arts-crafts": ["painting", "drawing", "pottery", "sculpture", "watercolor", "acrylic", "creative", "handmade", "diy"],
  pottery: ["clay", "wheel throwing", "sculpting", "glazing", "kiln", "ceramics", "hand building", "earthenware", "stoneware"],
  knitting: ["yarn", "sewing", "embroidery", "textile", "fiber arts", "needlework", "weaving", "macrame", "handcraft"],
  coding: ["programming", "web development", "app", "python", "javascript", "software", "robotics", "ai", "data science"],
  dance: ["salsa", "hip hop", "ballet", "contemporary", "latin", "swing", "ballroom", "choreography", "movement"],
  music: ["guitar", "piano", "drums", "singing", "instrument", "band", "production", "songwriting", "ukulele"],
};

/** Short words worth keeping ("ai", "3d") because they are real hobby terms. */
const SHORT_TERM_ALLOWLIST = new Set([
  ...Object.values(HOBBY_TAGS)
    .flat()
    .flatMap((tag) => tag.split(" "))
    .filter((word) => word.length < 3),
  "3d",
  "5k",
  "vr",
]);

/** The subset of an events row that search reads. */
export interface SearchableEvent {
  title?: string | null;
  description?: string | null;
  location?: string | null;
  group_name?: string | null;
  hobby_slug?: string | null;
  search_terms?: unknown;
  price_cents?: number | null;
  date?: string | null;
  lat?: number | null;
  lng?: number | null;
  [key: string]: unknown;
}

interface EventQueryResult {
  data: SearchableEvent[] | null;
  error: { code?: string; message?: string } | null;
}

/** Just the slice of the PostgREST builder this handler chains onto. */
interface EventQuery extends PromiseLike<EventQueryResult> {
  or(filter: string): EventQuery;
  eq(column: string, value: unknown): EventQuery;
  gt(column: string, value: unknown): EventQuery;
  gte(column: string, value: unknown): EventQuery;
  lte(column: string, value: unknown): EventQuery;
  ilike(column: string, pattern: string): EventQuery;
  not(column: string, operator: string, value: unknown): EventQuery;
  order(column: string, options: { ascending: boolean }): EventQuery;
  limit(count: number): EventQuery;
}

export interface SearchTerm {
  value: string;
  weight: number;
}

export interface PriceFilter {
  type: "free" | "under" | "paid" | null;
  max_cents: number | null;
}

export interface DateFilter {
  type: "exact_date" | "day_of_week" | "date_range" | null;
  value: string | null;
  start?: string | null;
  end?: string | null;
}

export interface ParsedSearch {
  keywords: string;
  related_terms?: string[] | null;
  hobby_slug: string | null;
  mood: string | null;
  time_of_day: string | null;
  location_hint: string | null;
  price_filter?: PriceFilter | null;
  date_filter: DateFilter;
}

/**
 * Crude plural stem. ILIKE is substring-based, so trimming the plural "s" makes
 * "quilts" match "quilting" without pulling in unrelated words.
 */
function stem(word: string): string {
  if (word.length > 4 && word.endsWith("s") && !word.endsWith("ss")) {
    return word.slice(0, -1);
  }
  return word;
}

export function tokenize(raw: string | null | undefined, limit = MAX_PRIMARY_TERMS): string[] {
  if (!raw) return [];
  const tokens: string[] = [];

  for (const word of String(raw).toLowerCase().split(/[^a-z0-9]+/)) {
    if (!word || STOPWORDS.has(word)) continue;
    if (word.length < 3 && !SHORT_TERM_ALLOWLIST.has(word)) continue;

    const token = stem(word);
    if (!tokens.includes(token)) tokens.push(token);
    if (tokens.length >= limit) break;
  }

  return tokens;
}

/**
 * Claude's `keywords` carry the intent; `related_terms` are the adjacent words
 * a listing might use instead ("felting" -> "wool", "fiber"). Both widen the
 * net, but related terms are weighted down so they never outrank a direct hit.
 */
export function buildSearchTerms(parsed: Partial<ParsedSearch> | null): SearchTerm[] {
  if (!parsed) return [];

  const primary = tokenize(parsed.keywords, MAX_PRIMARY_TERMS);
  const related = tokenize(
    (parsed.related_terms ?? []).join(" "),
    MAX_PRIMARY_TERMS + MAX_RELATED_TERMS
  )
    .filter((term) => !primary.includes(term))
    .slice(0, MAX_RELATED_TERMS);

  return [
    ...primary.map((value) => ({ value, weight: 1 })),
    ...related.map((value) => ({ value, weight: RELATED_TERM_WEIGHT })),
  ];
}

/**
 * PostgREST `or=(...)` string. Every term is checked against every searchable
 * column, so a match anywhere in the record counts; ranking (scoreEvent) sorts
 * out which of those matches mattered.
 */
export function buildMatchFilter(
  terms: SearchTerm[],
  opts: { hobbySlugs?: string[]; moodSlugs?: string[]; includeSearchTerms?: boolean }
): string | null {
  const conditions: string[] = [];

  const slugs = opts.hobbySlugs?.length ? opts.hobbySlugs : opts.moodSlugs ?? [];
  if (slugs.length === 1) {
    conditions.push(`hobby_slug.eq.${slugs[0]}`);
  } else if (slugs.length > 1) {
    conditions.push(`hobby_slug.in.(${slugs.join(",")})`);
  }

  for (const { value } of terms) {
    for (const column of TEXT_COLUMNS) {
      conditions.push(`${column}.ilike.*${value}*`);
    }
    conditions.push(`hobby_slug.ilike.*${value}*`);
    if (opts.includeSearchTerms) {
      conditions.push(`search_terms.cs.{"${value}"}`);
    }
  }

  return conditions.length > 0 ? conditions.join(",") : null;
}

function fieldHit(field: unknown, term: string): boolean {
  return typeof field === "string" && field.toLowerCase().includes(term);
}

export function scoreEvent(
  event: SearchableEvent,
  terms: SearchTerm[],
  hobbySlugs?: string[] | null
): number {
  let score = 0;

  // hobbySlugs[0] is the slug Claude actually parsed; the rest are aliases.
  const slugIndex = hobbySlugs?.indexOf(String(event?.hobby_slug)) ?? -1;
  if (slugIndex === 0) score += HOBBY_MATCH_BONUS;
  else if (slugIndex > 0) score += HOBBY_ALIAS_BONUS;

  const curated: string[] = Array.isArray(event?.search_terms)
    ? event.search_terms.map((term: unknown) => String(term).toLowerCase())
    : [];

  for (const { value, weight } of terms) {
    if (fieldHit(event?.title, value)) score += FIELD_WEIGHTS.title * weight;
    if (curated.some((t) => t.includes(value))) score += FIELD_WEIGHTS.search_terms * weight;
    if (fieldHit(event?.hobby_slug, value)) score += FIELD_WEIGHTS.hobby_slug * weight;
    if (fieldHit(event?.description, value)) score += FIELD_WEIGHTS.description * weight;
    if (fieldHit(event?.location, value)) score += FIELD_WEIGHTS.location * weight;
    if (fieldHit(event?.group_name, value)) score += FIELD_WEIGHTS.group_name * weight;
  }

  return score;
}

/** Most relevant first, then soonest. */
export function rankEvents<T extends SearchableEvent>(
  events: T[],
  terms: SearchTerm[],
  hobbySlugs?: string[] | null
): T[] {
  return [...events]
    .map((event) => ({ event, score: scoreEvent(event, terms, hobbySlugs) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        String(a.event?.date ?? "").localeCompare(String(b.event?.date ?? ""))
    )
    .map((entry) => entry.event);
}

/** In-memory equivalent of buildMatchFilter, for the proximity branch. */
export function eventMatchesTerms(
  event: SearchableEvent,
  terms: SearchTerm[],
  hobbySlugs?: string[] | null,
  moodSlugs?: string[]
): boolean {
  const slugs = hobbySlugs?.length ? hobbySlugs : moodSlugs ?? [];
  if (terms.length === 0 && slugs.length === 0) return true;

  if (slugs.includes(String(event?.hobby_slug))) return true;

  return scoreEvent(event, terms, null) > 0;
}

export function normalizePriceFilter(raw: unknown): PriceFilter {
  const source = (raw ?? {}) as { type?: unknown; max_cents?: unknown };
  const type = source.type;
  if (type !== "free" && type !== "under" && type !== "paid") {
    return { type: null, max_cents: null };
  }
  const max = Number(source.max_cents);
  return {
    type,
    max_cents: Number.isFinite(max) && max > 0 ? Math.round(max) : null,
  };
}

export function matchesPrice(event: SearchableEvent, filter: PriceFilter | null): boolean {
  if (!filter?.type) return true;

  // A null price_cents means the real price lives in price_display as text
  // ("$80 per person"), not that the class is free. SQL already excludes those
  // rows — NULL fails eq/lte/gt — so treating null as 0 here would make the
  // proximity branch disagree with every other path.
  if (event?.price_cents == null) return false;

  const cents = Number(event.price_cents);
  if (!Number.isFinite(cents)) return false;
  if (filter.type === "free") return cents === 0;
  if (filter.type === "paid") return cents > 0;
  // "under" with no ceiling is meaningless — treat it as "show everything".
  return filter.max_cents == null || cents <= filter.max_cents;
}

function weekdayOf(date: string): string {
  return new Date(date + "T00:00:00")
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
}

export function matchesDateFilter(
  event: SearchableEvent,
  filter: DateFilter | null | undefined
): boolean {
  if (!filter?.type) return true;
  const date = String(event?.date ?? "");
  if (!date) return false;

  if (filter.type === "exact_date") return !filter.value || date === filter.value;
  if (filter.type === "date_range") {
    if (!filter.start || !filter.end) return true;
    return date >= filter.start && date <= filter.end;
  }
  if (filter.type === "day_of_week") {
    return !filter.value || weekdayOf(date) === filter.value.toLowerCase();
  }
  return true;
}

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
  "keywords": string,        // the topic words only, space separated (e.g. "pottery", "watercolor painting")
                            // Leave out filler the other fields already capture:
                            // no "class", "near me", price words, or day names.
  "related_terms": string[], // 0-5 single lowercase words a listing might use instead of the
                            // keywords: synonyms, materials, techniques, genres, styles.
                            // "felting" -> ["wool", "fiber", "yarn"]
                            // "watercolor" -> ["painting", "paint", "brush"]
                            // "sourdough" -> ["bread", "baking", "fermentation"]
                            // Return [] when the keywords are already generic.
  "hobby_slug": string | null, // one of: cooking, arts-crafts, pottery, knitting, coding, dance, music
  "mood": string | null,     // Map vague queries aggressively to moods:
                            //   "relaxing", "chill", "calm", "peaceful" → "relaxing"
                            //   "fun", "exciting", "something to do" → "fun"
                            //   "creative", "artsy", "make something" → "creative"
                            //   "artistic", "art" → "artistic"
                            //   "meet people", "with friends" → "meet people"
                            //   "social" → "social"
                            //   "stressed", "need to unwind", "de-stress" → "stressed"
                            //   "bored", "nothing to do" → "bored"
                            //   "adventurous", "try something new" → "adventurous"
                            //   "active", "energetic", "workout" → "active"
                            //   "learn something new", "pick up a skill" → "learn"
                            //   "food", "eat", "bake" → "food"
                            //   "tech", "make", "build" → "tech"
  "time_of_day": string | null, // "morning", "afternoon", "evening", or null
  "location_hint": string | null, // extracted location/area, or null
  "price_filter": {
    "type": "free" | "under" | "paid" | null,
    "max_cents": number | null  // only for "under", in cents
  },
  "date_filter": {
    "type": "exact_date" | "day_of_week" | "date_range" | null,
    "value": string | null,     // ISO date "YYYY-MM-DD" for exact_date, day name for day_of_week, or null
    "start": string | null,     // ISO date for date_range start, null otherwise
    "end": string | null        // ISO date for date_range end, null otherwise
  }
}

IMPORTANT: If the user mentions a specific activity by name that matches one of the hobby_slug values, always set hobby_slug to that slug — never leave it null.
Examples:
- "pottery class" → hobby_slug: "pottery"
- "cooking something fun" → hobby_slug: "cooking"
- "baking class" → hobby_slug: "cooking"
- "arts and crafts" → hobby_slug: "arts-crafts"
- "knitting or sewing" → hobby_slug: "knitting"
- "learn to code" → hobby_slug: "coding"
- "dance class" → hobby_slug: "dance"
- "music lessons" → hobby_slug: "music"

Always fill in keywords, even when hobby_slug is set — listings are matched on their
full text (title, description, location, tags), not only on the hobby.

Price filter examples:
- "free classes" → type: "free", max_cents: null
- "anything free this weekend" → type: "free"
- "classes under $30" → type: "under", max_cents: 3000
- "cheap", "affordable", "budget" → type: "under", max_cents: 2500
- "paid workshops" → type: "paid"
- No price reference → type: null, max_cents: null

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

/**
 * Structured-output schema for the parse. Constraining the response removes a
 * whole failure class: before this, a markdown-fenced or slightly-off reply
 * threw in `JSON.parse` and the handler fell back to raw keyword matching —
 * silently, because a failed parse looks exactly like a query with no intent.
 */
const PARSE_SCHEMA = {
  type: "object",
  properties: {
    keywords: { type: "string" },
    related_terms: { type: "array", items: { type: "string" } },
    hobby_slug: {
      anyOf: [
        {
          type: "string",
          enum: ["cooking", "arts-crafts", "pottery", "knitting", "coding", "dance", "music"],
        },
        { type: "null" },
      ],
    },
    mood: { anyOf: [{ type: "string" }, { type: "null" }] },
    time_of_day: {
      anyOf: [
        { type: "string", enum: ["morning", "afternoon", "evening"] },
        { type: "null" },
      ],
    },
    location_hint: { anyOf: [{ type: "string" }, { type: "null" }] },
    price_filter: {
      type: "object",
      properties: {
        type: {
          anyOf: [{ type: "string", enum: ["free", "under", "paid"] }, { type: "null" }],
        },
        max_cents: { anyOf: [{ type: "integer" }, { type: "null" }] },
      },
      required: ["type", "max_cents"],
      additionalProperties: false,
    },
    date_filter: {
      type: "object",
      properties: {
        type: {
          anyOf: [
            { type: "string", enum: ["exact_date", "day_of_week", "date_range"] },
            { type: "null" },
          ],
        },
        value: { anyOf: [{ type: "string" }, { type: "null" }] },
        start: { anyOf: [{ type: "string" }, { type: "null" }] },
        end: { anyOf: [{ type: "string" }, { type: "null" }] },
      },
      required: ["type", "value", "start", "end"],
      additionalProperties: false,
    },
  },
  required: [
    "keywords",
    "related_terms",
    "hobby_slug",
    "mood",
    "time_of_day",
    "location_hint",
    "price_filter",
    "date_filter",
  ],
  additionalProperties: false,
} as const;

async function parseQueryWithClaude(query: string): Promise<ParsedSearch | null> {
  if (!ANTHROPIC_API_KEY) {
    console.error("[search] ANTHROPIC_API_KEY is not set — falling back to keyword search");
    return null;
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: SEARCH_MODEL,
      max_tokens: 1024,
      // Extraction, not reasoning — and adaptive thinking is on by default on
      // this model, which would eat into max_tokens and truncate the JSON.
      thinking: { type: "disabled" },
      output_config: { format: { type: "json_schema", schema: PARSE_SCHEMA } },
      system: buildSystemPrompt(),
      messages: [{ role: "user", content: query }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(
      `[search] Claude parse failed: ${res.status} ${res.statusText} ${detail.slice(0, 300)}`
    );
    return null;
  }

  const data = await res.json();

  if (data.stop_reason === "refusal") {
    console.error("[search] Claude declined the query:", JSON.stringify(data.stop_details));
    return null;
  }

  const text = data.content?.find((block: { type?: string }) => block?.type === "text")?.text;
  if (!text) {
    console.error("[search] Claude returned no text block:", JSON.stringify(data).slice(0, 300));
    return null;
  }

  return JSON.parse(text) as ParsedSearch;
}

/**
 * `search_terms` arrives with migration 012, which is applied by hand in the
 * Supabase SQL editor. Until someone runs it the column does not exist, so the
 * first query that references it fails — we notice once, drop the condition,
 * and keep serving matches on the other columns.
 */
let searchTermsColumnAvailable = true;

function isMissingSearchTermsColumn(error: EventQueryResult["error"]): boolean {
  if (!error) return false;
  return error.code === "42703" || /search_terms/.test(String(error.message ?? ""));
}

type QueryBuilder = (query: EventQuery, includeSearchTerms: boolean) => EventQuery;

async function runEventQuery(supabase: SupabaseClient, build: QueryBuilder) {
  const base = () =>
    supabase.from("events").select("*").eq("status", "approved") as unknown as EventQuery;

  const { data, error } = await build(base(), searchTermsColumnAvailable);
  if (!error) return { data: data ?? [], error: null };

  if (searchTermsColumnAvailable && isMissingSearchTermsColumn(error)) {
    searchTermsColumnAvailable = false;
    const retry = await build(base(), false);
    return { data: retry.data ?? [], error: retry.error ?? null };
  }

  return { data: [] as SearchableEvent[], error };
}

function findLandmarkCoords(hint: string | null) {
  if (!hint) return null;
  const normalized = hint.toLowerCase().trim();

  if (ANN_ARBOR_LANDMARKS[normalized]) {
    return { coords: ANN_ARBOR_LANDMARKS[normalized], key: normalized };
  }

  // Partial match — the hint contains a known landmark, or vice versa.
  for (const [key, coords] of Object.entries(ANN_ARBOR_LANDMARKS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return { coords, key };
    }
  }

  return null;
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

  let parsed: ParsedSearch | null = null;
  try {
    parsed = await parseQueryWithClaude(query);
  } catch (err) {
    console.error("[search] Claude parse threw — falling back to keyword search:", err);
  }

  if (!parsed) {
    console.warn(`[search] degraded keyword-only search for query: ${JSON.stringify(query)}`);
  }

  // Without Claude we still search the whole record, just with the raw query
  // as the keywords and no date/price/location intent.
  const intent: ParsedSearch = parsed ?? {
    keywords: query,
    related_terms: [],
    hobby_slug: null,
    mood: null,
    time_of_day: null,
    location_hint: null,
    price_filter: { type: null, max_cents: null },
    date_filter: { type: null, value: null, start: null, end: null },
  };

  const terms = buildSearchTerms(intent);
  const hobbySlugs = expandHobbySlug(intent.hobby_slug);
  const moodSlugs = hobbySlugs.length === 0 ? expandMood(intent.mood) : [];
  const priceFilter = normalizePriceFilter(intent.price_filter);
  const dateFilter = intent.date_filter;

  const respond = (
    results: SearchableEvent[],
    extra: Record<string, unknown> = {}
  ) =>
    res.status(200).json({
      results: rankEvents(results, terms, hobbySlugs).slice(0, RESULT_LIMIT),
      parsed,
      ...extra,
    });

  // --- Proximity branch: a recognised landmark wins over text location match ---
  const landmarkMatch = findLandmarkCoords(intent.location_hint);

  if (landmarkMatch) {
    const { coords, key } = landmarkMatch;

    // Fetch approved events with coordinates; the client's isUpcoming filter
    // drops past single-day events while keeping ongoing/multi ones.
    const { data: geocoded } = await runEventQuery(supabase, (q) =>
      q.not("lat", "is", null).not("lng", "is", null)
    );

    const nearby = geocoded.filter((event) => {
      const latDiff = Math.abs(Number(event.lat) - coords.lat);
      const lngDiff = Math.abs(Number(event.lng) - coords.lng);
      return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) < PROXIMITY_RADIUS;
    });

    // Nothing at all near the landmark: fall through to the text-based path
    // rather than dead-ending on an empty result.
    if (nearby.length > 0) {
      const onTopic = nearby.filter((event) =>
        eventMatchesTerms(event, terms, hobbySlugs, moodSlugs)
      );
      // Date and price used to be dropped here entirely — "near Kerrytown this
      // Saturday" echoed Saturday back and then ignored it.
      const exact = onTopic.filter(
        (event) => matchesDateFilter(event, dateFilter) && matchesPrice(event, priceFilter)
      );

      if (exact.length > 0) return respond(exact, { location_used: key });
      if (onTopic.length > 0)
        return respond(onTopic, { location_used: key, fallback: "relaxed_filters" });
      return respond(nearby, { location_used: key, fallback: "location_only" });
    }
  }

  const applyFilters = (
    query: EventQuery,
    includeSearchTerms: boolean,
    opts: { narrow: boolean }
  ): EventQuery => {
    let q = query;

    const filter = buildMatchFilter(terms, { hobbySlugs, moodSlugs, includeSearchTerms });
    if (filter) q = q.or(filter);

    if (opts.narrow) {
      if (intent.location_hint) q = q.ilike("location", `%${intent.location_hint}%`);

      if (priceFilter.type === "free") q = q.eq("price_cents", 0);
      else if (priceFilter.type === "paid") q = q.gt("price_cents", 0);
      else if (priceFilter.type === "under" && priceFilter.max_cents != null)
        q = q.lte("price_cents", priceFilter.max_cents);

      if (dateFilter?.type === "exact_date" && dateFilter.value) {
        q = q.eq("date", dateFilter.value);
      } else if (dateFilter?.type === "date_range" && dateFilter.start && dateFilter.end) {
        q = q.gte("date", dateFilter.start).lte("date", dateFilter.end);
      }
      // day_of_week has no SQL equivalent here — filtered in memory below.
      // No default date floor: ongoing/multi events keep past anchor dates and
      // the client's isUpcoming filter handles single-day past events.
    }

    return q.order("date", { ascending: true }).limit(FETCH_LIMIT);
  };

  // Tier 1 — everything the query asked for.
  const { data, error } = await runEventQuery(supabase, (q, includeSearchTerms) =>
    applyFilters(q, includeSearchTerms, { narrow: true })
  );

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const results = data.filter((event) => matchesDateFilter(event, dateFilter));
  if (results.length > 0) return respond(results);

  // Tier 2 — same topic, without the date / price / location narrowing.
  const relaxed = await runEventQuery(supabase, (q, includeSearchTerms) =>
    applyFilters(q, includeSearchTerms, { narrow: false })
  );
  if (relaxed.data.length > 0) return respond(relaxed.data, { fallback: "relaxed_filters" });

  // Tier 3 — nothing matched the topic at all; show what is on.
  const anything = await runEventQuery(supabase, (q) =>
    q.order("date", { ascending: true }).limit(FETCH_LIMIT)
  );
  return respond(anything.data, { fallback: "all_events" });
}
