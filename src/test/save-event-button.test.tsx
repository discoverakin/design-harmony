import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Link, MemoryRouter, useLocation } from "react-router-dom";
import SaveEventButton from "@/components/events/SaveEventButton";
import { SavedEventsProvider } from "@/hooks/use-saved-events";

/**
 * The ask: pin an event from the card while scrolling, without opening it —
 * and place the control clear of "Book Now" so a thumb never hits the wrong
 * one. The separation is layout (see EventCard); what is testable here is that
 * a save never navigates, and that an anonymous tap asks for an account
 * instead of quietly doing nothing.
 */

const { authState, insertMock, deleteMock, selectMock } = vi.hoisted(() => ({
  authState: { user: { id: "user-1" } as { id: string } | null },
  insertMock: vi.fn(async (_row?: unknown) => ({ error: null as Error | null })),
  deleteMock: vi.fn(async () => ({ error: null as Error | null })),
  selectMock: vi.fn(async () => ({ data: [] as { event_id: string }[] })),
}));

vi.mock("@/hooks/use-auth", () => ({ useAuth: () => ({ user: authState.user }) }));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => selectMock() }),
      insert: (row: unknown) => insertMock(row),
      delete: () => ({ eq: () => ({ eq: () => deleteMock() }) }),
    }),
  },
}));

const LocationProbe = () => (
  <span data-testid="path">{useLocation().pathname}</span>
);

/** The save button as it actually ships: inside a card that is itself a link. */
function renderInCard() {
  return render(
    <MemoryRouter initialEntries={["/events"]}>
      <SavedEventsProvider>
        <Link to="/events/evt-1">
          <span>Wheel Throwing Workshop</span>
          <SaveEventButton eventId="evt-1" title="Wheel Throwing Workshop" />
        </Link>
        <LocationProbe />
      </SavedEventsProvider>
    </MemoryRouter>
  );
}

const saveButton = () => screen.getByRole("button", { name: /Save|Remove/ });

beforeEach(() => {
  authState.user = { id: "user-1" };
  insertMock.mockClear();
  deleteMock.mockClear();
  selectMock.mockClear();
  insertMock.mockResolvedValue({ error: null });
  deleteMock.mockResolvedValue({ error: null });
  selectMock.mockResolvedValue({ data: [] });
});

describe("SaveEventButton", () => {
  it("starts unsaved and names the action for screen readers", async () => {
    renderInCard();
    await waitFor(() => expect(saveButton()).toHaveAttribute("aria-pressed", "false"));
    expect(saveButton()).toHaveAccessibleName("Save Wheel Throwing Workshop");
  });

  it("keeps a 44px touch target around the 36px circle", () => {
    // Measured, not decorative: at 36px flat, a press a pixel outside the icon
    // fell through to the card link and opened the event.
    renderInCard();
    expect(saveButton()).toHaveClass("w-11", "h-11", "border-4", "border-transparent");
  });

  it("saves on tap and persists it", async () => {
    renderInCard();
    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Remove Wheel Throwing Workshop from saved" })
      ).toHaveAttribute("aria-pressed", "true")
    );
    expect(insertMock).toHaveBeenCalledWith({ event_id: "evt-1", user_id: "user-1" });
  });

  it("does not open the event — the card link must not fire", async () => {
    // The whole reason for the control: pin it and keep scrolling.
    renderInCard();
    fireEvent.click(saveButton());

    await waitFor(() => expect(saveButton()).toHaveAttribute("aria-pressed", "true"));
    expect(screen.getByTestId("path").textContent).toBe("/events");
  });

  it("unsaves an already-saved event", async () => {
    selectMock.mockResolvedValue({ data: [{ event_id: "evt-1" }] });
    renderInCard();

    await waitFor(() => expect(saveButton()).toHaveAttribute("aria-pressed", "true"));
    fireEvent.click(saveButton());

    await waitFor(() => expect(saveButton()).toHaveAttribute("aria-pressed", "false"));
    expect(deleteMock).toHaveBeenCalled();
  });

  it("rolls back when the write fails", async () => {
    // A bookmark that looks saved but isn't makes the saved list a lie.
    insertMock.mockResolvedValue({ error: new Error("rls") });
    renderInCard();

    fireEvent.click(saveButton());

    await waitFor(() => expect(insertMock).toHaveBeenCalled());
    expect(saveButton()).toHaveAttribute("aria-pressed", "false");
  });

  it("asks an anonymous visitor to sign up instead of failing quietly", async () => {
    authState.user = null;
    renderInCard();

    fireEvent.click(saveButton());

    // The sheet is modal, so the card behind it goes aria-hidden — query
    // through it rather than asserting the button is still exposed.
    expect(await screen.findByText("Log in to save events")).toBeInTheDocument();
    expect(insertMock).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: /Save Wheel/, hidden: true })
    ).toHaveAttribute("aria-pressed", "false");
  });
});
