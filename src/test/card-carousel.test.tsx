import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CardCarousel from "@/components/CardCarousel";
import FeaturedHobbiesCarousel from "@/components/FeaturedHobbiesCarousel";

/**
 * A tester read "Featured this week" as a finished row of three cards, and
 * found that the sideways swipe which scrolled it did nothing on "Recommended
 * hobbies" (that one was Embla, which only listens for a pointer drag). So
 * what these guard is: the affordances show up whenever a rail overflows, and
 * *both* gesture families — native scroll and mouse drag — move the same rail.
 */

const RAIL_WIDTH = 300;
const CONTENT_WIDTH = 900;

const isRail = (el: HTMLElement) => el.getAttribute("role") === "region";

/**
 * jsdom has no layout: clientWidth/scrollWidth are 0 and scrollLeft is inert,
 * so the rail would always look like it fits. These stubs give the rail — and
 * only the rail — a size, backed by a real scrollLeft the component can move.
 */
let scrollLeft = 0;

const stubLayout = (contentWidth = CONTENT_WIDTH) => {
  scrollLeft = 0;
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get(this: HTMLElement) {
      return isRail(this) ? RAIL_WIDTH : 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
    configurable: true,
    get(this: HTMLElement) {
      return isRail(this) ? contentWidth : 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "scrollLeft", {
    configurable: true,
    get(this: HTMLElement) {
      return isRail(this) ? scrollLeft : 0;
    },
    set(this: HTMLElement, value: number) {
      if (isRail(this)) scrollLeft = value;
    },
  });
};

afterEach(() => {
  for (const prop of ["clientWidth", "scrollWidth", "scrollLeft"]) {
    delete (HTMLElement.prototype as unknown as Record<string, unknown>)[prop];
  }
});

const renderRail = (cards = 6) =>
  render(
    <CardCarousel title="Featured this week">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i}>Card {i + 1}</div>
      ))}
    </CardCarousel>
  );

/**
 * jsdom never scrolls anything, so the scroll event has to be faked; and the
 * rail re-measures inside requestAnimationFrame, so the frame has to be waited
 * out before the dots and arrows reflect the new position.
 */
const settle = async () => {
  fireEvent.scroll(screen.getByRole("region"));
  await act(
    () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  );
};

describe("CardCarousel", () => {
  it("advertises itself with arrows and dots once the cards overflow", () => {
    stubLayout();
    renderRail();

    expect(screen.getByRole("button", { name: /Scroll .* right/ })).toBeEnabled();
    // Three rail-widths of content, so three dots — a position hint, not one
    // dot per card.
    expect(screen.getAllByRole("button", { name: /Go to page/ })).toHaveLength(3);
  });

  it("stays quiet when the cards already fit", () => {
    stubLayout(RAIL_WIDTH);
    renderRail(2);

    expect(screen.queryByRole("button", { name: /Scroll/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Go to page/ })).not.toBeInTheDocument();
  });

  it("greys out the arrow that would run off the end", async () => {
    stubLayout();
    renderRail();

    expect(screen.getByRole("button", { name: /Scroll .* left/ })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /Scroll .* right/ }));
    fireEvent.click(screen.getByRole("button", { name: /Scroll .* right/ }));
    await settle();

    expect(screen.getByRole("button", { name: /Scroll .* left/ })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Scroll .* right/ })).toBeDisabled();
  });

  it("moves one rail-width per arrow press and marks the dot it landed on", async () => {
    stubLayout();
    renderRail();

    fireEvent.click(screen.getByRole("button", { name: /Scroll .* right/ }));
    await settle();

    expect(screen.getByRole("region").scrollLeft).toBe(RAIL_WIDTH);
    const dots = screen.getAllByRole("button", { name: /Go to page/ });
    expect(dots[1]).toHaveAttribute("aria-current", "true");
  });

  it("jumps to a page when its dot is tapped", async () => {
    stubLayout();
    renderRail();

    fireEvent.click(screen.getByRole("button", { name: "Go to page 3 of 3" }));
    await settle();

    expect(screen.getByRole("region").scrollLeft).toBe(2 * RAIL_WIDTH);
  });

  it("keeps up with a native sideways scroll — trackpad, wheel or touch", async () => {
    stubLayout();
    renderRail();
    const rail = screen.getByRole("region");

    rail.scrollLeft = RAIL_WIDTH * 2;
    await settle();

    expect(screen.getAllByRole("button", { name: /Go to page/ })[2]).toHaveAttribute(
      "aria-current",
      "true"
    );
    expect(screen.getByRole("button", { name: /Scroll .* right/ })).toBeDisabled();
  });

  it("also scrolls when a mouse grabs and pulls, the way the old Embla rail did", () => {
    stubLayout();
    renderRail();
    const rail = screen.getByRole("region");

    fireEvent.pointerDown(rail, { pointerType: "mouse", button: 0, clientX: 200 });
    fireEvent.pointerMove(rail, { pointerType: "mouse", clientX: 80 });

    expect(rail.scrollLeft).toBe(120);
  });

  it("does not open the card you happened to let go over", () => {
    stubLayout();
    const onClick = vi.fn();
    render(
      <CardCarousel title="Featured this week">
        <button type="button" onClick={onClick}>
          Card 1
        </button>
        <div>Card 2</div>
        <div>Card 3</div>
      </CardCarousel>
    );
    const rail = screen.getByRole("region");
    const card = screen.getByRole("button", { name: "Card 1" });

    fireEvent.pointerDown(rail, { pointerType: "mouse", button: 0, clientX: 200 });
    fireEvent.pointerMove(rail, { pointerType: "mouse", clientX: 80 });
    fireEvent.pointerUp(rail, { pointerType: "mouse", clientX: 80 });
    fireEvent.click(card);

    expect(onClick).not.toHaveBeenCalled();

    // ...but the very next click, with no drag before it, still opens the card.
    fireEvent.click(card);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("leaves a plain click alone when the mouse never moved", () => {
    stubLayout();
    const onClick = vi.fn();
    render(
      <CardCarousel title="Featured this week">
        <button type="button" onClick={onClick}>
          Card 1
        </button>
        <div>Card 2</div>
        <div>Card 3</div>
      </CardCarousel>
    );
    const rail = screen.getByRole("region");
    const card = screen.getByRole("button", { name: "Card 1" });

    fireEvent.pointerDown(rail, { pointerType: "mouse", button: 0, clientX: 200 });
    fireEvent.pointerMove(rail, { pointerType: "mouse", clientX: 202 });
    fireEvent.pointerUp(rail, { pointerType: "mouse", clientX: 202 });
    fireEvent.click(card);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("leaves touch to the browser, which scrolls it better than we would", () => {
    stubLayout();
    renderRail();
    const rail = screen.getByRole("region");

    fireEvent.pointerDown(rail, { pointerType: "touch", button: 0, clientX: 200 });
    fireEvent.pointerMove(rail, { pointerType: "touch", clientX: 80 });

    expect(rail.scrollLeft).toBe(0);
  });
});

describe("the rails agree with each other", () => {
  it("gives the hobbies rail the same arrows and dots as the events rail", () => {
    stubLayout();
    render(
      <MemoryRouter>
        <FeaturedHobbiesCarousel />
      </MemoryRouter>
    );

    // This one used to be an Embla carousel whose arrows disappeared entirely
    // once the quiz personalised it.
    expect(screen.getByRole("region", { name: "Recommended hobbies" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Scroll .* right/ })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Go to page/ }).length).toBeGreaterThan(1);
  });

  it("keeps the arrows when the quiz personalises it", () => {
    stubLayout();
    render(
      <MemoryRouter>
        <FeaturedHobbiesCarousel quizSlugs={["cooking", "pottery", "dance"]} />
      </MemoryRouter>
    );

    expect(screen.getByText("Based on your quiz")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Scroll .* right/ })).toBeInTheDocument();
  });
});

describe("CardCarousel dots on an uneven last page", () => {
  it("can still reach the end from the last dot", async () => {
    // 700px of cards in a 300px rail travels 400px, not two full rail-widths.
    // Paging by rail-width used to overshoot, clamp, and leave dot 3 dead.
    stubLayout(700);
    renderRail();

    fireEvent.click(screen.getByRole("button", { name: "Go to page 3 of 3" }));
    await settle();

    expect(screen.getByRole("region").scrollLeft).toBe(400);
    expect(screen.getAllByRole("button", { name: /Go to page/ })[2]).toHaveAttribute(
      "aria-current",
      "true"
    );
    expect(screen.getByRole("button", { name: /Scroll .* right/ })).toBeDisabled();
  });
});
