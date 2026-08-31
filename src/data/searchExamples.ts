/**
 * Example prompts that teach what the search bar actually does.
 *
 * A tester said the label told her nothing a normal search box wouldn't, so she
 * typed keywords and never discovered she could describe a mood, a budget or a
 * night of the week. These are the demonstration: shown on the empty search
 * page and on the home entry point, and tappable, because one tap that returns
 * real classes teaches more than a sentence explaining the feature.
 *
 * Each one leans on a different thing `api/search.ts` parses — mood, hobby,
 * date, price, location — so between them they map the shape of what it
 * understands. Keep them deliberately un-keyword-like: "pottery" would teach
 * exactly the wrong lesson.
 */
export interface SearchExample {
  /** What gets searched. */
  query: string;
  /** Shown on the chip — short enough for a phone. */
  label: string;
}

export const SEARCH_EXAMPLES: SearchExample[] = [
  { query: "relaxing evening this weekend", label: "relaxing evening this weekend" },
  { query: "something creative with my hands", label: "creative with my hands" },
  { query: "free things to try near downtown", label: "free, near downtown" },
  { query: "meet new people who like cooking", label: "meet people who like cooking" },
  { query: "beginner class next week", label: "beginner class next week" },
];

/** The two shown on the home entry point, where space is tight. */
export const HOME_SEARCH_EXAMPLES = SEARCH_EXAMPLES.slice(0, 2);
