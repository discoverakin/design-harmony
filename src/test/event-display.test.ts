import { describe, it, expect } from "vitest";
import { formatPrice } from "@/lib/format-price";
import { hasKnownDate, isUpcoming } from "@/lib/eventDates";

describe("formatPrice", () => {
  it("shows Free only for an actual zero price", () => {
    expect(formatPrice(0)).toBe("Free");
  });

  it("never calls an unknown price free", () => {
    // Scraped listings leave price_cents null and put the real price in
    // price_display ("$80 per person"). Rendering that as Free misinforms.
    expect(formatPrice(null)).toBe("See details");
    expect(formatPrice(undefined)).toBe("See details");
  });

  it("formats a real price", () => {
    expect(formatPrice(500)).toBe("$5.00");
    expect(formatPrice(13500)).toBe("$135.00");
  });

  it("does not render nonsense for a bad value", () => {
    expect(formatPrice(NaN)).toBe("See details");
    expect(formatPrice(-100)).toBe("See details");
  });
});

describe("hasKnownDate", () => {
  it("accepts a real date", () => {
    expect(hasKnownDate("2026-08-25")).toBe(true);
  });

  it("rejects the far-future placeholder used for unknown schedules", () => {
    // 2099-01-01 rendered as "Thu, Jan 1" and read as a stale event.
    expect(hasKnownDate("2099-01-01")).toBe(false);
    expect(hasKnownDate("2090-06-01")).toBe(false);
  });

  it("rejects a missing date", () => {
    expect(hasKnownDate(null)).toBe(false);
    expect(hasKnownDate("")).toBe(false);
  });

  it("leaves isUpcoming alone — a sentinel event is still listable", () => {
    // Suppressing the date is a display decision, not a filtering one.
    expect(isUpcoming({ date: "2099-01-01", description: "Taster class." })).toBe(true);
  });
});
