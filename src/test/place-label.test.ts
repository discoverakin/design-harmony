import { describe, it, expect } from "vitest";
import { cardLocationLabel, placeLabel } from "@/lib/placeLabel";
import { ANN_ARBOR_CENTER, distanceLabel } from "@/lib/geo";

/**
 * A tester wanted proximity at a glance instead of the literal address. Real
 * inventory measured 2026-08-31: 147 upcoming events, median address 41
 * characters, 78 of them long enough to truncate on a card — and 76 of the 147
 * are in Toronto, which the truncated address usually cut off before reaching.
 * These use the address shapes that are actually in the table.
 */

describe("placeLabel", () => {
  it("reduces a real Ann Arbor address to city and state", () => {
    expect(placeLabel("3765 Plaza Dr, Ann Arbor, MI 48108")).toBe("Ann Arbor, MI");
    expect(placeLabel("410 N. 4th Ave, Ann Arbor, MI 48104")).toBe("Ann Arbor, MI");
  });

  it("reduces a real Toronto address, sub-unit and all", () => {
    // The whole point: this used to render truncated, so half the catalogue
    // looked local until you opened it.
    expect(placeLabel("388 Carlaw Avenue, Unit 101C, Toronto, ON M4M 2T4")).toBe(
      "Toronto, ON"
    );
    expect(placeLabel("28 Bathurst St Unit 122 (Stackt Market), Toronto, ON M5V 2W9")).toBe(
      "Toronto, ON"
    );
    expect(placeLabel("1688 Queen Street West, Toronto, ON M6R 1B3")).toBe(
      "Toronto, ON"
    );
  });

  it("keeps a venue name when that is all there is", () => {
    expect(placeLabel("Maker Works")).toBe("Maker Works");
  });

  it("handles an address that already ends at the region", () => {
    expect(placeLabel("235 Queens Quay West, Toronto, ON")).toBe("Toronto, ON");
  });

  it("says something rather than nothing when the field is empty", () => {
    expect(placeLabel("")).toBe("Location TBC");
    expect(placeLabel(null)).toBe("Location TBC");
    expect(placeLabel(undefined)).toBe("Location TBC");
  });
});

describe("distanceLabel", () => {
  it("is precise near you and rounder far away", () => {
    expect(distanceLabel(0.05)).toBe("right here");
    expect(distanceLabel(2.44)).toBe("2.4 mi");
    expect(distanceLabel(9.9)).toBe("9.9 mi");
    expect(distanceLabel(12.4)).toBe("12 mi");
    expect(distanceLabel(251.6)).toBe("252 mi");
  });

  it("returns nothing for a nonsense distance rather than '-1 mi'", () => {
    expect(distanceLabel(NaN)).toBe("");
    expect(distanceLabel(-3)).toBe("");
  });
});

describe("cardLocationLabel", () => {
  const gallupPark = { lat: 42.2766, lng: -83.7191 };

  it("prefers a distance once we know where the user is", () => {
    const label = cardLocationLabel(
      { location: "3765 Plaza Dr, Ann Arbor, MI 48108", ...gallupPark },
      ANN_ARBOR_CENTER
    );
    expect(label).toMatch(/^\d+(\.\d)? mi$/);
  });

  it("falls back to the place name when the event was never geocoded", () => {
    // Two thirds of events — the common case until the backfill lands.
    expect(
      cardLocationLabel(
        { location: "388 Carlaw Avenue, Unit 101C, Toronto, ON M4M 2T4", lat: null, lng: null },
        ANN_ARBOR_CENTER
      )
    ).toBe("Toronto, ON");
  });

  it("falls back to the place name when the user has not shared a location", () => {
    expect(
      cardLocationLabel({ location: "3765 Plaza Dr, Ann Arbor, MI 48108", ...gallupPark }, null)
    ).toBe("Ann Arbor, MI");
  });

  it("never shows the full street address", () => {
    const address = "28 Bathurst St Unit 122 (Stackt Market), Toronto, ON M5V 2W9";
    expect(cardLocationLabel({ location: address, lat: null, lng: null }, null)).not.toContain(
      "Bathurst"
    );
  });
});
