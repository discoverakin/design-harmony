/** Format a cent amount as a dollar string, e.g. 50 → "$0.50". Returns "Free" for 0. */
export function formatPrice(cents: number): string {
  if (!cents || cents <= 0) return "Free";
  return `$${(cents / 100).toFixed(2)}`;
}
