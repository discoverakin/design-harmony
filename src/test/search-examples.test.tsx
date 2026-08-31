import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import Search from "@/pages/Search";
import BrowseHobbiesSection from "@/components/BrowseHobbiesSection";
import { SEARCH_EXAMPLES, HOME_SEARCH_EXAMPLES } from "@/data/searchExamples";
import { clearSearchCache } from "@/lib/searchCache";

/**
 * A tester read "search classes with AI" as an ordinary search box, typed
 * keywords, and never discovered she could describe a mood. The teaching is
 * examples she can tap, not a label — so these check the examples are on
 * screen when she needs them, that tapping one actually searches it, and that
 * they get out of the way once there are results.
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

const RESULT = {
  id: "evt-1",
  title: "Candlelit Restorative Yoga",
  date: "2099-01-01",
  time: "7:00 PM",
  location: "Ann Arbor",
  price_cents: 0,
  emoji: "🧘",
  flyer_url: null,
  hobby_slug: null,
  description: "One session.",
  price_display: null,
};

const Probe = () => {
  const { pathname, search } = useLocation();
  return <span data-testid="url">{pathname + decodeURIComponent(search)}</span>;
};

beforeEach(() => {
  clearSearchCache();
  vi.restoreAllMocks();
});

describe("search page — teaching what the bar does", () => {
  const renderSearch = () =>
    render(
      <MemoryRouter initialEntries={["/search"]}>
        <Search />
        <Probe />
      </MemoryRouter>
    );

  it("explains the difference before anything is searched", () => {
    vi.stubGlobal("fetch", vi.fn());
    renderSearch();

    expect(screen.getByText("Say what you're in the mood for")).toBeInTheDocument();
    expect(screen.getByText(/Not just a keyword/)).toBeInTheDocument();
  });

  it("offers example phrases that are phrases, not keywords", () => {
    vi.stubGlobal("fetch", vi.fn());
    renderSearch();

    SEARCH_EXAMPLES.forEach((example) => {
      expect(screen.getByRole("button", { name: example.label })).toBeInTheDocument();
    });
    // The lesson is that vague works; a one-word example would teach the opposite.
    SEARCH_EXAMPLES.forEach((example) => {
      expect(example.query.split(" ").length).toBeGreaterThan(2);
    });
  });

  it("runs the example when tapped, and puts it in the box", async () => {
    const fetchSpy = vi.fn(async () => ({
      ok: true,
      json: async () => ({ results: [RESULT], parsed: null }),
    }));
    vi.stubGlobal("fetch", fetchSpy);
    renderSearch();

    fireEvent.click(
      screen.getByRole("button", { name: "relaxing evening this weekend" })
    );

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    expect(JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string)).toEqual({
      query: "relaxing evening this weekend",
    });
    // Seeing it land in the input is half the lesson.
    expect(screen.getByDisplayValue("relaxing evening this weekend")).toBeInTheDocument();
    expect(screen.getByTestId("url").textContent).toBe(
      "/search?q=relaxing evening this weekend"
    );
  });

  it("gets out of the way once there are results", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ results: [RESULT], parsed: null }),
      }))
    );
    renderSearch();

    fireEvent.click(screen.getByRole("button", { name: "creative with my hands" }));

    expect(await screen.findByText("Candlelit Restorative Yoga")).toBeInTheDocument();
    expect(screen.queryByText("Say what you're in the mood for")).not.toBeInTheDocument();
  });
});

describe("home entry point", () => {
  it("offers the same lesson, tappable, straight into search", async () => {
    render(
      <MemoryRouter initialEntries={["/home"]}>
        <Routes>
          <Route path="/home" element={<BrowseHobbiesSection />} />
          <Route path="/search" element={<div>Search page</div>} />
        </Routes>
        <Probe />
      </MemoryRouter>
    );

    const example = HOME_SEARCH_EXAMPLES[0];
    fireEvent.click(screen.getByRole("button", { name: example.label }));

    await waitFor(() =>
      expect(screen.getByTestId("url").textContent).toBe(`/search?q=${example.query}`)
    );
  });
});
