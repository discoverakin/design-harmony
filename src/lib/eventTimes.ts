/**
 * Only the *start* of an event survives into `events.time`. A tester asked how
 * long a workshop runs so she could plan the rest of her day, and the answer is
 * usually sitting in the record already — the scraper captured the full span
 * and then dropped the end:
 *
 *   time: "10:30 AM"   description: "Dates: Sundays June 28 & July 12, 2026, 10:30 AM–5:00 PM."
 *   time: "6:30 PM"    schedule_note: "Mondays, Jun 15 - Aug 10, 2026, 6:30-7:30 PM"
 *
 * So this recovers the end where it can be recovered *safely*, in the same
 * spirit as `eventDates.ts`: read what the scrape left behind rather than wait
 * for a schema change. About a third of approved events yield an end time; the
 * rest render exactly as they do today. See `docs/data-quality.md` §6.
 *
 * The bar for showing something is deliberately high. A wrong end time is worse
 * than no end time — she is planning her day around it — so anything ambiguous
 * is dropped rather than guessed at.
 */

export interface EventTiming {
  /** Normalised start, e.g. "10:30 AM". */
  start: string;
  /** Normalised end, e.g. "5:00 PM". */
  end: string;
  durationMinutes: number;
  /** Which field the span came from. Surfaced in tests and the QA script. */
  source: "duration_minutes" | "schedule_note" | "description";
}

interface EventTimingInput {
  time?: string | null;
  description?: string | null;
  schedule_note?: string | null;
  duration_minutes?: number | null;
}

/** Matches "10:30 AM", "6:30PM", "9am", "2 P.M." at the start of a string. */
const LEADING_CLOCK = /^\s*(\d{1,2})(?::(\d{2}))?\s*([AaPp])\.?[Mm]\.?/;

/**
 * A clock span: "10:30 AM–5:00 PM", "6:30-7:30 PM", "9am–12pm", "1:00 PM to 2:30 PM".
 *
 * The meridiem on the *end* is required, and that is what keeps date ranges
 * out: "Sep 10–Oct 29", "$35–$325", "grades 1–7" and "10-week" all fail here.
 */
const CLOCK_SPAN =
  /(\d{1,2})(?::(\d{2}))?\s*(?:([AaPp])\.?[Mm]\.?)?\s*(?:–|—|-|to|until)\s*(\d{1,2})(?::(\d{2}))?\s*([AaPp])\.?[Mm]\.?/g;

const MINUTES_PER_DAY = 24 * 60;

function toMinutes(hour: number, minute: number, meridiem: string): number {
  let h = hour % 12;
  if (meridiem.toLowerCase() === "p") h += 12;
  return h * 60 + minute;
}

export function formatClock(minutes: number): string {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const hour = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** The stored `time` as minutes past midnight, or null — a quarter of the
 *  catalogue stores "See details" or "Evenings and afternoons" there. */
export function parseStoredTime(time: string | null | undefined): number | null {
  const match = LEADING_CLOCK.exec(time ?? "");
  if (!match) return null;
  return toMinutes(Number(match[1]), Number(match[2] ?? 0), match[3]);
}

interface Span {
  start: number;
  end: number;
}

function findSpans(text: string | null | undefined): Span[] {
  if (!text) return [];
  const spans: Span[] = [];
  CLOCK_SPAN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = CLOCK_SPAN.exec(text)) !== null) {
    const [, sh, sm, sMer, eh, em, eMer] = match;
    const end = toMinutes(Number(eh), Number(em ?? 0), eMer);
    let start: number;
    if (sMer) {
      start = toMinutes(Number(sh), Number(sm ?? 0), sMer);
    } else {
      // "6:30-7:30 PM" — the start borrows the end's meridiem, unless that puts
      // it after the end ("10:30–12:00 PM" is a morning start, not an evening one).
      start = toMinutes(Number(sh), Number(sm ?? 0), eMer);
      if (start >= end) {
        const flipped = toMinutes(Number(sh), Number(sm ?? 0), eMer.toLowerCase() === "p" ? "a" : "p");
        if (flipped < end) start = flipped;
      }
    }
    spans.push({ start, end });
  }
  return spans;
}

/** Spans that agree with each other collapse to one; genuinely different ones don't. */
function onlySpan(spans: Span[]): Span | null {
  if (spans.length === 0) return null;
  const distinct = new Map(spans.map((s) => [`${s.start}-${s.end}`, s]));
  return distinct.size === 1 ? spans[0] : null;
}

export function resolveEventTiming(event: EventTimingInput): EventTiming | null {
  const storedStart = parseStoredTime(event.time);

  // 1. The column, when someone has filled it in. Authoritative, and needs a
  //    real start time to be worth anything.
  const declared = event.duration_minutes;
  if (typeof declared === "number" && declared > 0 && declared < MINUTES_PER_DAY && storedStart !== null) {
    return {
      start: formatClock(storedStart),
      end: formatClock(storedStart + declared),
      durationMinutes: declared,
      source: "duration_minutes",
    };
  }

  // 2. A span in the scraped text. `schedule_note` is a statement about the
  //    schedule; `description` is mostly marketing copy that happens to contain
  //    one, so it is only trusted when the stored start agrees with it.
  const candidates: Array<{ span: Span | null; source: EventTiming["source"] }> = [
    { span: onlySpan(findSpans(event.schedule_note)), source: "schedule_note" },
    { span: onlySpan(findSpans(event.description)), source: "description" },
  ];

  for (const { span, source } of candidates) {
    if (!span) continue;
    if (span.end <= span.start) continue; // crosses midnight, or garbage
    if (storedStart !== null && span.start !== storedStart) continue; // disagreement — don't pick a winner
    if (storedStart === null && source === "description") continue; // unanchored marketing copy
    return {
      start: formatClock(span.start),
      end: formatClock(span.end),
      durationMinutes: span.end - span.start,
      source,
    };
  }

  return null;
}
