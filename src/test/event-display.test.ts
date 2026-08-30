import { describe, it, expect } from "vitest";
import { formatPrice, priceLabel, summarizePriceDisplay } from "@/lib/format-price";
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

describe("summarizePriceDisplay", () => {
  it("keeps a single price as-is", () => {
    expect(summarizePriceDisplay("$35")).toBe("$35");
    expect(summarizePriceDisplay("$35 per person")).toBe("$35");
  });

  it("reduces a range or a list to its lowest price", () => {
    expect(summarizePriceDisplay("$35–$325")).toBe("from $35");
    expect(summarizePriceDisplay("$35 for workshop and $60 for kit")).toBe("from $35");
  });

  it("passes through text with no price in it", () => {
    expect(summarizePriceDisplay("TBD")).toBe("TBD");
    expect(summarizePriceDisplay("Contact studio for pricing")).toBe(
      "Contact studio for pricing"
    );
  });
});

describe("priceLabel", () => {
  it("never returns nothing — a card with no price reads as missing info", () => {
    // The events list gated its price badge on `price_cents > 0`, so free and
    // scraped-price classes showed none at all.
    expect(priceLabel({ price_cents: 0 })).toBe("Free");
    expect(priceLabel({ price_cents: 8500 })).toBe("$85.00");
    expect(priceLabel({ price_cents: null })).toBe("See details");
    expect(priceLabel({})).toBe("See details");
  });

  it("prefers the scraped free-text price over the cents column", () => {
    // price_cents is null on scraped listings; price_display carries the truth.
    expect(priceLabel({ price_cents: null, price_display: "$80 per person" })).toBe(
      "$80"
    );
    expect(priceLabel({ price_cents: 0, price_display: "$35–$325" })).toBe("from $35");
  });

  it("ignores an empty display string rather than rendering a blank", () => {
    expect(priceLabel({ price_cents: 2500, price_display: "   " })).toBe("$25.00");
    expect(priceLabel({ price_cents: 2500, price_display: null })).toBe("$25.00");
  });
});
