/**
 * Example prompts that teach what the search bar actually does.
 *
 * A tester said the label told her nothing a normal search box wouldn't, so she
 * typed keywords and never discovered she could describe a mood, a budget or a
 * night of the week. These are the demonstration: shown on the empty search
 * page and on the home entry point, and tappable, because one tap that returns
 * real classes teaches more than a sentence explaining the feature.
 *
 * Each leans on a different thing `api/search.ts` parses — mood, price, skill
 * level, social intent, who you are with — so between them they map the shape
 * of what it understands. Keep them deliberately un-keyword-like: "pottery"
 * would teach exactly the wrong lesson.
 *
 * **These were measured against the live catalogue on 2026-08-31, not
 * imagined.** An example that returns one result teaches that the feature does
 * not work. The five here returned 6-12 classes each and none was dominated by
 * the out-of-area Toronto listings. Date-constrained phrasings were dropped for
 * exactly that reason: "relaxing evening this weekend" returned a single
 * Toronto workshop at 1pm, and "learn something new this month" came back 8/9
 * Toronto. Dates parse fine — there is just not enough local inventory in a
 * given week to demonstrate them yet. Re-measure before changing this list, and
 * revisit once the catalogue question in docs/data-quality.md §3 is settled.
 */
export interface SearchExample {
  /** What gets searched. */
  query: string;
  /** Shown on the chip — short enough for a phone. */
  label: string;
}

export const SEARCH_EXAMPLES: SearchExample[] = [
  { query: "something relaxing after work", label: "relaxing after work" },
  { query: "free classes to try", label: "free classes to try" },
  { query: "beginner friendly, no experience needed", label: "beginner, no experience" },
  { query: "meet people and make something", label: "meet people and make something" },
  { query: "something fun with my kid", label: "fun with my kid" },
];

/** The two shown on the home entry point, where space is tight. */
export const HOME_SEARCH_EXAMPLES = SEARCH_EXAMPLES.slice(0, 2);
