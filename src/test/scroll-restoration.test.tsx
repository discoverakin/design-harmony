import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";

/**
 * The events list is 174 cards long. Tapping one and coming back used to land
 * at the top, because the browser restores scroll before the events have been
 * fetched — when the page is still a spinner one viewport tall.
 */

const Page = ({ ready }: { ready: boolean }) => {
  useScrollRestoration(ready);
  return <div>list</div>;
};

const setScrollY = (value: number) =>
  Object.defineProperty(window, "scrollY", {
    value,
    writable: true,
    configurable: true,
  });

beforeEach(() => {
  sessionStorage.clear();
  setScrollY(0);
  vi.stubGlobal("scrollTo", vi.fn());
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  });
});

describe("useScrollRestoration", () => {
  it("puts the list back where it was", async () => {
    const first = render(
      <MemoryRouter initialEntries={["/events"]}>
        <Page ready />
      </MemoryRouter>
    );

    setScrollY(1200); // user scrolls down the list
    first.unmount(); // ...and taps into an event

    render(
      <MemoryRouter initialEntries={["/events"]}>
        <Page ready />
      </MemoryRouter>
    );

    await waitFor(() => expect(window.scrollTo).toHaveBeenCalledWith(0, 1200));
  });

  it("waits for the list to be ready before restoring", async () => {
    const first = render(
      <MemoryRouter initialEntries={["/events"]}>
        <Page ready />
      </MemoryRouter>
    );
    setScrollY(800);
    first.unmount();
    (window.scrollTo as ReturnType<typeof vi.fn>).mockClear();

    // Still loading: restoring now would scroll a one-screen spinner to nowhere.
    const pending = render(
      <MemoryRouter initialEntries={["/events"]}>
        <Page ready={false} />
      </MemoryRouter>
    );
    expect(window.scrollTo).not.toHaveBeenCalled();

    pending.rerender(
      <MemoryRouter initialEntries={["/events"]}>
        <Page ready />
      </MemoryRouter>
    );
    await waitFor(() => expect(window.scrollTo).toHaveBeenCalledWith(0, 800));
  });

  it("does not scroll when there is nothing recorded", async () => {
    render(
      <MemoryRouter initialEntries={["/events"]}>
        <Page ready />
      </MemoryRouter>
    );
    await waitFor(() => expect(window.scrollTo).not.toHaveBeenCalled());
  });

  it("survives storage being unavailable", () => {
    const original = sessionStorage.getItem;
    sessionStorage.getItem = () => {
      throw new Error("private mode");
    };

    expect(() =>
      render(
        <MemoryRouter initialEntries={["/events"]}>
          <Page ready />
        </MemoryRouter>
      )
    ).not.toThrow();

    sessionStorage.getItem = original;
  });
});
