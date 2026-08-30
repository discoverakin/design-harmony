import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EventListCard from "@/components/events/EventListCard";
import type { CommunityEvent } from "@/data/events";

/**
 * A tester said the events list cards carried emoji and little else, and that
 * price should be on them the way it is on the featured cards. The badge was
 * gated on `price_cents > 0`, so free classes and the scraped ones that keep
 * their price in `price_display` showed nothing — 41% of the upcoming list.
 */

vi.mock("@/hooks/use-saved-events", () => ({
  useSavedEvents: () => ({
    savedIds: new Set<string>(),
    isSaved: () => false,
    toggleSave: () => {},
    loading: false,
  }),
}));

const event = (overrides: Partial<CommunityEvent>): CommunityEvent =>
  ({
    id: "e1",
    title: "Wheel Throwing Workshop",
    description: "One session.",
    date: "2026-09-12",
    time: "6:00 PM",
    location: "Ann Arbor",
    emoji: "🏺",
    flyer_url: null,
    external_link: null,
    max_attendees: null,
    group_name: null,
    created_by: null,
    created_by_name: "Akin Scout",
    price_cents: 4500,
    price_display: null,
    hobby_slug: null,
    status: "approved",
    created_at: "2026-08-01",
    rsvp_count: 0,
    is_attending: false,
    has_attended: false,
    attendance_minutes: null,
    has_paid: false,
    ...overrides,
  }) as CommunityEvent;

const renderCard = (overrides: Partial<CommunityEvent>) =>
  render(
    <MemoryRouter>
      <EventListCard event={event(overrides)} />
    </MemoryRouter>
  );

describe("EventListCard price", () => {
  it("shows a paid price", () => {
    renderCard({ price_cents: 8500 });
    expect(screen.getByText("$85.00")).toBeInTheDocument();
  });

  it("says Free rather than showing nothing", () => {
    renderCard({ price_cents: 0 });
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("shows the scraped price when there is no cents value", () => {
    renderCard({ price_cents: null, price_display: "$80 per person" });
    expect(screen.getByText("$80")).toBeInTheDocument();
  });

  it("says See details when the price is genuinely unknown", () => {
    // Never blank, and never "Free" — telling someone a paid class is free is
    // the one mistake this must not make.
    renderCard({ price_cents: null, price_display: null });
    expect(screen.getByText("See details")).toBeInTheDocument();
    expect(screen.queryByText("Free")).not.toBeInTheDocument();
  });

  it("carries more than an emoji on every card", () => {
    renderCard({ price_cents: null });
    expect(screen.getByText("Wheel Throwing Workshop")).toBeInTheDocument();
    expect(screen.getByText("See details")).toBeInTheDocument();
    expect(screen.getByText("Ann Arbor")).toBeInTheDocument();
  });
});
