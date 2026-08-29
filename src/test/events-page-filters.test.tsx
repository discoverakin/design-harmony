import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import Events from "@/pages/Events";
import type { CommunityEvent } from "@/data/events";

/**
 * Wiring test for the browse filters on /events: that the chips reach the
 * list, that the URL carries the choice, and — the part worth guarding — that
 * listings with no price or no confirmed date are disclosed rather than
 * disappearing. See docs/data-quality.md for why that matters here.
 */

vi.mock("@/hooks/use-auth", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("@/hooks/use-theme", () => ({ useTheme: () => ({ theme: "light" }) }));
vi.mock("@/lib/supabase", () => ({ supabase: { from: () => ({}) } }));
vi.mock("@/hooks/use-saved-events", () => ({
  useSavedEvents: () => ({
    savedIds: new Set<string>(),
    isSaved: () => false,
    toggleSave: () => {},
    loading: false,
  }),
}));

const today = new Date().toISOString().split("T")[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

const makeEvent = (overrides: Partial<CommunityEvent>): CommunityEvent =>
  ({
    id: "e",
    title: "A class",
    description: "One session.",
    date: today,
    time: "6:00 PM",
    location: "Ann Arbor",
    emoji: "🎨",
    flyer_url: null,
    external_link: null,
    max_attendees: null,
    group_name: null,
    created_by: null,
    created_by_name: "Akin Scout",
    price_cents: 2000,
    hobby_slug: null,
    lat: 42.2808,
    lng: -83.743,
    status: "approved",
    created_at: "2026-08-01",
    rsvp_count: 0,
    is_attending: false,
    has_attended: false,
    attendance_minutes: null,
    has_paid: false,
    ...overrides,
  }) as CommunityEvent;

const EVENTS: CommunityEvent[] = [
  makeEvent({ id: "1", title: "Free Drop-In Drawing", price_cents: 0, date: today }),
  makeEvent({ id: "2", title: "Wheel Throwing Workshop", price_cents: 6500, date: tomorrow }),
  makeEvent({ id: "3", title: "Unpriced Glaze Lab", price_cents: null, date: today }),
];

vi.mock("@/hooks/use-events", () => ({
  useEvents: () => ({ approvedEvents: EVENTS, loading: false }),
}));

/** Surfaces the router's query string so the URL round-trip can be asserted. */
const LocationProbe = () => (
  <span data-testid="location-search">{useLocation().search}</span>
);

const renderEvents = () =>
  render(
    <MemoryRouter initialEntries={["/events"]}>
      <Events />
      <LocationProbe />
    </MemoryRouter>
  );

const upcomingPanel = () => screen.getByRole("tabpanel");
/** Filter chips are buttons; section headings share their words. */
const chip = (name: string) => screen.getByRole("button", { name });

describe("/events browse filters", () => {
  it("shows every upcoming event before any filter is touched", () => {
    renderEvents();
    expect(screen.getByText("Free Drop-In Drawing")).toBeInTheDocument();
    expect(screen.getByText("Wheel Throwing Workshop")).toBeInTheDocument();
    expect(screen.getByText("Unpriced Glaze Lab")).toBeInTheDocument();
  });

  it("narrows to today without needing a typed search", () => {
    renderEvents();
    fireEvent.click(chip("Today"));
    expect(screen.getByText("Free Drop-In Drawing")).toBeInTheDocument();
    expect(screen.queryByText("Wheel Throwing Workshop")).not.toBeInTheDocument();
  });

  it("filters to free classes and says what it held back", () => {
    renderEvents();
    fireEvent.click(chip("Free"));

    expect(screen.getByText("Free Drop-In Drawing")).toBeInTheDocument();
    expect(screen.queryByText("Wheel Throwing Workshop")).not.toBeInTheDocument();
    // The unpriced class is not free and not paid — it is hidden, but declared.
    expect(screen.queryByText("Unpriced Glaze Lab")).not.toBeInTheDocument();
    expect(
      within(upcomingPanel()).getByText(/1 with no listed price/)
    ).toBeInTheDocument();
  });

  it("names the section after the active date filter", () => {
    renderEvents();
    fireEvent.click(chip("Tomorrow"));
    expect(within(upcomingPanel()).getByText("Tomorrow", { selector: "h3" })).toBeInTheDocument();
  });

  it("offers a way out when a filter empties the list", () => {
    renderEvents();
    fireEvent.click(chip("Free"));
    fireEvent.click(chip("Tomorrow"));
    expect(screen.getByText(/No events found for these filters/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByText("Wheel Throwing Workshop")).toBeInTheDocument();
  });

  it("keeps the choice in the URL so a round-trip to an event survives", () => {
    renderEvents();
    fireEvent.click(chip("Free"));
    fireEvent.click(chip("Tomorrow"));
    const params = new URLSearchParams(
      screen.getByTestId("location-search").textContent ?? ""
    );
    expect(params.get("date")).toBe("tomorrow");
    expect(params.get("price")).toBe("free");
  });
});
