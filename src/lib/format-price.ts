/**
 * Format a cent amount as a dollar string, e.g. 50 → "$0.50".
 *
 * 0 is Free. `null`/`undefined` means the price is *unknown* — scraped
 * listings put the real price in `price_display` as free text ("$80 per
 * person") and leave `price_cents` null — so it must never render as Free.
 * Telling someone a class is free when it is not is the worst thing this
 * function can do.
 */
export function formatPrice(cents: number | null | undefined): string {
  if (cents === 0) return "Free";
  if (cents == null || !Number.isFinite(cents) || cents < 0) return "See details";
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Condense a free-form `price_display` string into a compact label.
 * "$35 for workshop and $60 for kit" → "from $35"
 * "$35–$325" → "from $35"
 * "$35" → "$35"
 * "TBD" → "TBD" (raw fallback)
 */
export function summarizePriceDisplay(raw: string): string {
  const matches = [...raw.matchAll(/\$(\d+(?:\.\d{1,2})?)/g)];
  if (matches.length === 0) return raw;
  const parsed = matches.map((m) => ({ raw: m[1], num: parseFloat(m[1]) }));
  const unique = [...new Set(parsed.map((p) => p.num))];
  if (unique.length === 1) return `$${parsed[0].raw}`;
  const min = Math.min(...unique);
  const minRaw = parsed.find((p) => p.num === min)!.raw;
  return `from $${minRaw}`;
}

/**
 * The single price rule every card follows: prefer the scraped free-text price,
 * fall back to the cents column. Never returns an empty string — a card with no
 * price at all reads as missing information, which is what a tester reported of
 * the events list.
 */
export function priceLabel(event: {
  price_cents?: number | null;
  price_display?: string | null;
}): string {
  const display = event.price_display?.trim();
  if (display) return summarizePriceDisplay(display);
  return formatPrice(event.price_cents);
}
