# Consistent, discoverable card carousels — QA script

**PR:** #9 · **Shipped:** pending merge · **Test at:** the branch preview while
the PR is open, then <https://design-harmony-ashen.vercel.app>

Open in a **fresh incognito window** (no service worker, and you start logged
out). No DevTools panel is needed for the logged-out pass; the signed-in pass
needs nothing either. This is all visual and gestural.

## What changed, in one paragraph

The home page has two horizontal card rails, "Featured this week" and
"Recommended hobbies". They used to be built two different ways, and behaved
differently as a result. Featured was a plain scrolling row with **no arrows,
no dots and no hint that anything was off-screen** — a tester read it as a
finished row of three cards. Recommended was a drag-based carousel that
**ignored trackpad and wheel scrolling**, so the sideways two-finger swipe that
scrolled Featured did nothing on Recommended, and you had to grab and pull
instead. Both rails are now the same component: same arrows, same dots, same
fade at the cut-off edge, and every gesture — touch swipe, trackpad, shift +
wheel, mouse click-and-drag, arrow keys, and the arrow buttons — moves either
rail. The arrows and dots appear **only when the cards actually overflow**.

---

## 1. Featured this week announces that it scrolls

**Do:** Load the home page and look at "Featured this week" without touching
anything.
**Expect:** A ‹ › pair at the right of the heading (‹ greyed out, › live), a row
of dots under the cards, the last visible card cut off at the right edge, and a
soft fade over that cut edge.
**Fail:** The old version: a heading and what looks like a complete row of three
cards, with nothing to suggest more exist. This is the bug that started the
ticket — if the section looks "finished", it has regressed.

## 2. The same gesture works on both rails

**Do:** On a trackpad, two-finger swipe left across "Featured this week". Then
do exactly the same gesture across "Recommended hobbies". Repeat both with a
mouse: press, drag sideways, release.
**Expect:** All four move. The two rails feel the same.
**Fail:** Recommended not moving on the trackpad swipe while Featured does —
that was the second half of the ticket. Also a fail: Featured not responding to
a click-and-drag.

## 3. Dragging over a card does not open it

**Do:** Press the mouse down **on a card** in either rail, drag sideways at
least ~50px, and release with the pointer still over a card.
**Expect:** The rail scrolls and snaps. You stay on the home page.
**Fail:** You land on an event or hobby page. (Then click a card normally,
without moving — that *must* still open it. Losing the tap is as bad as the
accidental navigation.)

## 4. Arrows and dots track the real position

**Do:** Press › repeatedly on "Recommended hobbies" until it stops.
**Expect:** Cards advance about a screenful at a time. The filled dot moves
along. At the far right, › greys out, ‹ is live, and **the last dot is the
filled one**. Press the last dot from the start — it should jump to the very
end, not somewhere short of it.
**Fail:** The last dot never fills even when the rail is scrolled fully right,
or clicking it stops short. The rails scroll by a partial page at the end, and
paging by whole screen-widths used to overshoot and leave that dot dead.

## 5. Short rails stay quiet

**Do:** Narrow the browser to a phone width, or find a rail where every card
already fits (the hobby rail shows six; a logged-in quiz result may return
fewer).
**Expect:** When nothing is off-screen there are **no arrows, no dots and no
fade** — just the cards.
**Fail:** Dead arrows or a single lonely dot under a row that cannot scroll.

## 6. Keyboard and screen reader

**Do:** Tab until focus lands inside a rail, then press → and ←. With
VoiceOver/NVDA on, tab to the arrows and dots.
**Expect:** Arrow keys scroll the rail. The arrows read as "Scroll Featured this
week right"/"…left"; the dots read as "Go to page 2 of 3".
**Fail:** Arrow keys scrolling the whole page instead of the rail, or controls
that announce as unlabelled buttons.

---

## Signed-in pass

**Claude could not run this — it cannot log in, and the app does not start
locally without Supabase credentials. All of section 7 is unverified.**

## 7. The personalised hobby rail keeps its controls

**Do:** Sign in as an account that has completed the hobby quiz, and look at
"Recommended hobbies" on the home page.
**Expect:** A "✨ Based on your quiz" badge **and** the ‹ › arrows, both in the
heading row, with the dots underneath.
**Fail:** The badge replacing the arrows. In the old build the arrows were
rendered only in the *non*-personalised branch, so finishing the quiz silently
took them away — the users most likely to have a personalised rail were the ones
who never saw an arrow.

Also worth checking while signed in: a quiz that returns only two or three
recommendations should hit the section 5 "stays quiet" behaviour.

## What is shakiest

**The dot count.** Dots are a *position* indicator, not one-per-card: they are
derived from how many rail-widths of content there are, so eight events give
about three dots. That is deliberate. What would be a real bug is the count
changing while you scroll without the window resizing.

**Momentum scrolling on iOS.** Snapping happens after the flick settles, so on a
hard flick the rail can drift and then tug back to a card edge. Mild tug =
expected. Landing mid-card and staying there = a bug.

**The fade is invisible against pale cards.** Over the light event cards it is
nearly imperceptible and over a dark hobby photo it is obvious. That is the
gradient doing its job, not a rendering failure — judge discoverability on the
arrows, the dots and the cut-off card instead.

## Not covered

- **The testimonial carousel** (`TestimonialCarousel`, on the marketing/social
  surfaces) is untouched. It auto-rotates one quote at a time and has never been
  swipeable; it shares the dot styling but not the component. If "consistent
  across all carousels" is meant to include it, that is a separate change.
- The chip rows on `/events` and `/community` scroll horizontally but are
  filters, not carousels, and deliberately get no arrows or dots. They did pick
  up a one-word fix in this PR: they asked for a `scrollbar-none` class that
  does not exist in the stylesheet, so a scrollbar was showing on platforms that
  reserve space for one. They now use `scrollbar-hide`, like everything else.
- Nothing about which events or hobbies are chosen changed — same data, same
  weekly shuffle, same ordering.
