import { describe, it, expect } from "vitest";
import {
  resolveEventTiming,
  formatClock,
  formatDuration,
  parseStoredTime,
} from "@/lib/eventTimes";

/**
 * The strings here are lifted from production rows, because the value of this
 * parser is entirely in how it copes with what the scraper actually writes.
 * A wrong end time is worse than none — a tester is planning her day around it
 * — so the rejection cases below matter as much as the happy ones.
 */

describe("parseStoredTime", () => {
  it("reads the clock formats that appear in events.time", () => {
    expect(parseStoredTime("10:30 AM")).toBe(630);
    expect(parseStoredTime("6:30 PM")).toBe(1110);
    expect(parseStoredTime("12:00 PM")).toBe(720); // noon, not midnight
    expect(parseStoredTime("12:30 AM")).toBe(30);
    expect(parseStoredTime("9am")).toBe(540);
  });

  it("gives up on the quarter of the catalogue that has no clock at all", () => {
    expect(parseStoredTime("See details")).toBeNull();
    expect(parseStoredTime("Evenings and afternoons")).toBeNull();
    expect(parseStoredTime("")).toBeNull();
    expect(parseStoredTime(null)).toBeNull();
  });
});

describe("formatting", () => {
  it("writes clocks the way the rest of the catalogue does", () => {
    expect(formatClock(630)).toBe("10:30 AM");
    expect(formatClock(720)).toBe("12:00 PM");
    expect(formatClock(0)).toBe("12:00 AM");
    expect(formatClock(1110)).toBe("6:30 PM");
  });

  it("writes durations without a dangling zero", () => {
    expect(formatDuration(45)).toBe("45m");
    expect(formatDuration(60)).toBe("1h");
    expect(formatDuration(90)).toBe("1h 30m");
    expect(formatDuration(390)).toBe("6h 30m");
  });
});

describe("resolveEventTiming — spans it should find", () => {
  it("reads an en-dashed span out of the description", () => {
    expect(
      resolveEventTiming({
        time: "10:30 AM",
        description:
          "Dates: Sundays June 28 & July 12, 2026, 10:30 AM–5:00 PM. Advanced art quilting workshop.",
      })
    ).toEqual({ start: "10:30 AM", end: "5:00 PM", durationMinutes: 390, source: "description" });
  });

  it("lets the start borrow the end's meridiem", () => {
    // "6:30-7:30 PM" — the start carries no AM/PM of its own.
    expect(
      resolveEventTiming({
        time: "6:30 PM",
        schedule_note: "Mondays, Jun 15 - Aug 10, 2026 (excl. Jun 29 & Jul 27), 6:30-7:30 PM",
      })
    ).toMatchObject({ start: "6:30 PM", end: "7:30 PM", durationMinutes: 60 });
  });

  it("does not drag a morning start into the evening", () => {
    // Borrowing "PM" would make this 10:30pm–12:00pm and invert the span.
    expect(
      resolveEventTiming({ time: "10:30 AM", description: "Runs 10:30–12:00 PM." })
    ).toMatchObject({ start: "10:30 AM", end: "12:00 PM", durationMinutes: 90 });
  });

  it("handles the compact lowercase form", () => {
    expect(
      resolveEventTiming({
        time: "9:00 AM",
        description: "Dates: Summer 2026 sessions (4 days, 9am–12pm; check site).",
      })
    ).toMatchObject({ start: "9:00 AM", end: "12:00 PM", durationMinutes: 180 });
  });

  it("prefers the duration column over anything in the prose", () => {
    expect(
      resolveEventTiming({
        time: "6:00 PM",
        duration_minutes: 120,
        description: "Doors 6:00 PM–11:00 PM for the social afterwards.",
      })
    ).toEqual({ start: "6:00 PM", end: "8:00 PM", durationMinutes: 120, source: "duration_minutes" });
  });

  it("recovers a span even when events.time is unusable, if the note states it", () => {
    // 15 of 58 sampled events store "See details"; a schedule_note is a
    // statement about the schedule, so it can stand on its own.
    expect(
      resolveEventTiming({
        time: "See details",
        schedule_note: "Runs every Sunday morning 10:00AM–11:30AM; no specific dates listed.",
      })
    ).toMatchObject({ start: "10:00 AM", end: "11:30 AM", source: "schedule_note" });
  });
});

describe("resolveEventTiming — what it must refuse", () => {
  it("ignores date ranges, price ranges and age ranges", () => {
    for (const description of [
      "Dates: Aug 1 – Aug 15, 2026. Multi-week jewelry workshop.",
      "8-week course running Wednesdays, Sep 10–Oct 29.",
      "Tuition $35–$325 depending on section.",
      "STEM skill courses for grades 1–7 in Ann Arbor.",
      "A 10-week course meeting once per week.",
    ]) {
      expect(resolveEventTiming({ time: "10:00 AM", description })).toBeNull();
    }
  });

  it("stays quiet when the listing advertises several different times", () => {
    expect(
      resolveEventTiming({
        time: "10:00 AM",
        description:
          "Multiple days/times available (Mon–Fri AM and PM). Morning 10:00am–1:00pm, evening 6:00pm–9:00pm.",
      })
    ).toBeNull();
  });

  it("does not trust a span in marketing copy that nothing anchors", () => {
    // events.time is unusable, so there is no way to tell whether this span
    // belongs to the class being viewed or to some other offering.
    expect(
      resolveEventTiming({
        time: "See details",
        description:
          "Single-session handbuilding taster. — Curious about pottery? Our evening sessions run 6:30 PM–9:30 PM.",
      })
    ).toBeNull();
  });

  it("drops a span that disagrees with the stored start time", () => {
    expect(
      resolveEventTiming({ time: "9:00 AM", description: "The class runs 6:00 PM–8:00 PM." })
    ).toBeNull();
  });

  it("drops a span that ends before it starts", () => {
    expect(
      resolveEventTiming({ time: "10:00 PM", description: "Late session 10:00 PM–1:00 AM." })
    ).toBeNull();
  });

  it("ignores a duration column that is absent, zero or absurd", () => {
    const base = { time: "6:00 PM", description: "No span here." };
    expect(resolveEventTiming({ ...base, duration_minutes: null })).toBeNull();
    expect(resolveEventTiming({ ...base, duration_minutes: 0 })).toBeNull();
    expect(resolveEventTiming({ ...base, duration_minutes: 5000 })).toBeNull();
  });

  it("returns nothing when there is simply nothing to find", () => {
    expect(
      resolveEventTiming({ time: "6:00 PM", description: "A lovely evening class.", schedule_note: null })
    ).toBeNull();
  });
});
