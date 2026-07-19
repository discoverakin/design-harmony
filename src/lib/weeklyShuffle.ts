/**
 * Deterministic weekly shuffle.
 * Same ISO week + year → identical order across reloads; new week rolls automatically.
 */

/** ISO 8601 week number (1–53) combined with the ISO week-year, forming a stable seed. */
function getIsoWeekSeed(date = new Date()): number {
  const target = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  // Thursday of the current ISO week determines the week-year
  const dayOfWeek = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayOfWeek + 3);
  const isoYear = target.getUTCFullYear();
  const firstThursday = target.getTime();

  const jan4 = new Date(Date.UTC(isoYear, 0, 4));
  const jan4Day = (jan4.getUTCDay() + 6) % 7;
  jan4.setUTCDate(jan4.getUTCDate() - jan4Day + 3);

  const week = 1 + Math.round((firstThursday - jan4.getTime()) / 604800000);
  return isoYear * 100 + week;
}

/** mulberry32 — small, fast seeded PRNG returning floats in [0, 1). */
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates shuffle seeded from the current ISO week. Pure — does not mutate input. */
export function weeklyShuffle<T>(items: T[], date = new Date()): T[] {
  const rand = mulberry32(getIsoWeekSeed(date));
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
