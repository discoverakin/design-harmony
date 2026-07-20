/**
 * Multi-date events are represented in the events table by a single `date`
 * anchor plus a "Dates: <free-form text>" prefix at the start of `description`.
 * This helper extracts that prefix and classifies the event so cards can show
 * a small badge (Ongoing / Multiple dates) without a schema change.
 */

export type DateClassification = "single" | "multi" | "ongoing";

export interface ParsedEventDates {
  classification: DateClassification;
  /** The free-form span text after "Dates:", trimmed. `null` when no prefix exists. */
  datesText: string | null;
}

const ONGOING_PATTERN =
  /\b(ongoing|weekly|monthly|recurring|mondays|tuesdays|wednesdays|thursdays|fridays|saturdays|sundays|every\s+(?:mon|tue|wed|thu|fri|sat|sun)|each\s+(?:mon|tue|wed|thu|fri|sat|sun))/i;

const MULTI_PATTERN =
  /\b(through|multiple|sessions?|series|-\s*week|week\s+(?:course|session|program|series)|starting|weekend|-\s*day\b)/i;

/** Grabs the text after "Dates:" up to the first sentence break, or end of string. */
function extractDatesPrefix(description: string): string | null {
  if (!description) return null;
  const match = description.match(/^\s*dates?\s*:\s*([^\n]*?)(?:\.\s|\.$|$)/i);
  if (!match) return null;
  const text = match[1].trim();
  return text.length > 0 ? text : null;
}

export function parseEventDates(description: string | null | undefined): ParsedEventDates {
  const datesText = extractDatesPrefix(description ?? "");
  if (!datesText) return { classification: "single", datesText: null };

  if (ONGOING_PATTERN.test(datesText)) {
    return { classification: "ongoing", datesText };
  }
  if (MULTI_PATTERN.test(datesText)) {
    return { classification: "multi", datesText };
  }
  return { classification: "single", datesText };
}

/** Short chip label for a classification, or `null` when nothing should render. */
export function classificationLabel(c: DateClassification): string | null {
  if (c === "ongoing") return "Ongoing";
  if (c === "multi") return "Multiple dates";
  return null;
}

/**
 * True when an event should still surface on "upcoming"-oriented lists:
 * - ongoing/multi events pass regardless of anchor date
 * - single-date events pass when their date is today or later (local time)
 */
export function isUpcoming(event: {
  date: string;
  description?: string | null;
}): boolean {
  const { classification } = parseEventDates(event.description);
  if (classification !== "single") return true;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDate = new Date(event.date + "T00:00:00");
  return eventDate.getTime() >= todayStart.getTime();
}
