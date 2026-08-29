import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Search from "@/pages/Search";
import HobbyDetail from "@/pages/HobbyDetail";
import { clearSearchCache, writeSearchCache } from "@/lib/searchCache";

/**
 * A tester lost her search by tapping a result: the card opened the whole
 * hobby category, and back from there went home rather than to the search.
 * These cover the path she actually walked.
 */

vi.mock("@/hooks/use-auth", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("@/hooks/use-theme", () => ({ useTheme: () => ({ theme: "light" }) }));
vi.mock("@/lib/supabase", () => ({ supabase: { from: () => ({}) } }));
vi.mock("@/hooks/use-events", () => ({
  useEvents: () => ({ getEventsByHobby: () => [], loading: false }),
}));
vi.mock("@/hooks/use-saved-events", () => ({
  useSavedEvents: () => ({
    savedIds: new Set<string>(),
    isSaved: () => false,
    toggleSave: () => {},
    loading: false,
  }),
}));

const RESULT = {
  id: "evt-1",
  title: "Wheel Throwing Workshop",
  date: "2099-01-01",
  time: "6:00 PM",
  location: "Ann Arbor",
  price_cents: 4500,
  emoji: "🏺",
  flyer_url: null,
  hobby_slug: "pottery",
  description: "A one-off class.",
  price_display: null,
};

const Probe = () => <span data-testid="path">{useLocation().pathname}</span>;

function renderSearch(entries: string[] = ["/search?q=pottery"]) {
  return render(
    <MemoryRouter initialEntries={entries}>
      <Routes>
        <Route path="/home" element={<div>Home page</div>} />
        <Route path="/search" element={<Search />} />
        <Route path="/hobby/:slug" element={<div>Category page</div>} />
        <Route path="/events/:id" element={<div>Event page</div>} />
      </Routes>
      <Probe />
    </MemoryRouter>
  );
}

beforeEach(() => {
  clearSearchCache();
  vi.restoreAllMocks();
});

describe("search view", () => {
  it("restores a cached search without calling the API again", async () => {
    // The whole point: back from an event repaints the same results instantly.
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    writeSearchCache({
      query: "pottery",
      results: [RESULT],
      parsed: null,
      fallback: null,
      locationUsed: null,
    });

    renderSearch();

    expect(await screen.findByText("Wheel Throwing Workshop")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("calls the API when there is nothing cached for that query", async () => {
    const fetchSpy = vi.fn(async () => ({
      ok: true,
      json: async () => ({ results: [RESULT], parsed: null }),
    }));
    vi.stubGlobal("fetch", fetchSpy);

    renderSearch();

    expect(await screen.findByText("Wheel Throwing Workshop")).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("opens the class itself, not its whole category", async () => {
    // The card links to /hobby/:slug by default; on results that means tapping
    // a specific class lands you on a list of every class in it.
    vi.stubGlobal("fetch", vi.fn());
    writeSearchCache({
      query: "pottery",
      results: [RESULT],
      parsed: null,
      fallback: null,
      locationUsed: null,
    });

    renderSearch();
    await screen.findByText("Wheel Throwing Workshop");

    fireEvent.click(screen.getByRole("link", { name: /Book Now/i }));
    await waitFor(() =>
      expect(screen.getByTestId("path").textContent).toBe("/events/evt-1")
    );
  });

  it("has a back control that returns to where the search came from", async () => {
    vi.stubGlobal("fetch", vi.fn());

    render(
      <MemoryRouter initialEntries={["/home"]}>
        <Routes>
          <Route
            path="/home"
            element={<Link to="/search?q=pottery">Go search</Link>}
          />
          <Route path="/search" element={<Search />} />
        </Routes>
        <Probe />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Go search"));
    await waitFor(() =>
      expect(screen.getByTestId("path").textContent).toBe("/search")
    );

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    await waitFor(() =>
      expect(screen.getByTestId("path").textContent).toBe("/home")
    );
  });

  it("falls back to home when the search view is the first page of the session", async () => {
    // Deep link or fresh tab: there is nothing behind this page, and going
    // back would leave the app.
    vi.stubGlobal("fetch", vi.fn());
    renderSearch(["/search?q=pottery"]);

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    await waitFor(() => expect(screen.getByText("Home page")).toBeInTheDocument());
  });
});

describe("category page", () => {
  it("goes back to the search that led there, not to home", async () => {
    // This is the reported bug: HobbyDetail's back button was navigate("/"),
    // so a search two taps back was unreachable.
    vi.stubGlobal("fetch", vi.fn());

    render(
      <MemoryRouter initialEntries={["/search?q=pottery"]}>
        <Routes>
          <Route path="/home" element={<div>Home page</div>} />
          <Route
            path="/search"
            element={<Link to="/hobby/pottery">Open category</Link>}
          />
          <Route path="/hobby/:slug" element={<HobbyDetail />} />
        </Routes>
        <Probe />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Open category"));
    await waitFor(() =>
      expect(screen.getByTestId("path").textContent).toBe("/hobby/pottery")
    );

    fireEvent.click(screen.getByRole("button", { name: /Back/i }));
    await waitFor(() =>
      expect(screen.getByTestId("path").textContent).toBe("/search")
    );
    expect(screen.queryByText("Home page")).not.toBeInTheDocument();
  });
});
