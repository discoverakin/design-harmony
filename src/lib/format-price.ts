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
