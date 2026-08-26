import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import EventFilterBar from "@/components/events/EventFilterBar";
import { NO_FILTERS, type EventFilters } from "@/lib/eventFilters";

/**
 * The controls testers asked for have to be *visible without typing* — that was
 * the whole point of the feedback — so these assert the chips are on screen in
 * the default state, not behind a disclosure.
 */

const renderBar = (filters: EventFilters = NO_FILTERS) => {
  const onChange = vi.fn();
  render(<EventFilterBar filters={filters} onChange={onChange} />);
  return onChange;
};

describe("EventFilterBar", () => {
  it("shows date, price, and distance controls with nothing selected", () => {
    renderBar();
    ["Today", "Tomorrow", "This week", "Next week", "This month"].forEach((label) =>
      expect(screen.getByText(label)).toBeInTheDocument()
    );
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("Paid")).toBeInTheDocument();
    expect(screen.getByText("3 mi")).toBeInTheDocument();
    expect(screen.getByText("Pick a date")).toBeInTheDocument();
  });

  it("reports a date preset", () => {
    const onChange = renderBar();
    fireEvent.click(screen.getByText("Tomorrow"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ date: "tomorrow" }));
  });

  it("reports a price", () => {
    const onChange = renderBar();
    fireEvent.click(screen.getByText("Free"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ price: "free" }));
  });

  it("reports a radius", () => {
    const onChange = renderBar();
    fireEvent.click(screen.getByText("5 mi"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ radiusMiles: 5 }));
  });

  it("marks the active chip for assistive tech", () => {
    renderBar({ ...NO_FILTERS, price: "free" });
    expect(screen.getByText("Free")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Paid")).toHaveAttribute("aria-pressed", "false");
  });

  it("clears the preset when a specific day is showing", () => {
    const onChange = renderBar({ ...NO_FILTERS, day: "2026-09-12", date: "today" });
    // The chip reads as the picked day, and "Today" is no longer selected.
    expect(screen.getByText("Sat, Sep 12")).toBeInTheDocument();
    expect(screen.getByText("Today")).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(screen.getByText("Clear date"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ day: null }));
  });

  it("picks a specific date from the calendar", () => {
    // The "what's on that day?" ask that came in alongside the range chips.
    const onChange = renderBar({ ...NO_FILTERS, day: "2026-09-12" });
    fireEvent.click(screen.getByText("Sat, Sep 12"));
    fireEvent.click(screen.getByRole("gridcell", { name: "20" }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ day: "2026-09-20", date: "any" })
    );
  });

  it("says which origin a radius is measured from", () => {
    const onChange = vi.fn();
    render(
      <EventFilterBar
        filters={{ ...NO_FILTERS, radiusMiles: 3 }}
        onChange={onChange}
        originLabel="downtown Ann Arbor"
      />
    );
    expect(screen.getByText("Within 3 mi of downtown Ann Arbor")).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Clear filters/));
    expect(onChange).toHaveBeenCalledWith(NO_FILTERS);
  });
});
