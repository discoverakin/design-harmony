# Price on the events list cards — QA script

**PR:** #10 · **Shipped:** pending merge · **Test at:** the branch preview while
open; <https://design-harmony-ashen.vercel.app/events> once merged.

Open in a **fresh incognito window**. No login needed. No DevTools required for
this one — everything here is visible on the page.

## What changed, in one paragraph

Every card in the `/events` list now carries a price. It used to render one
only when the price was greater than zero, so free classes and the scraped
listings that keep their price as free text showed nothing at all — 41% of the
upcoming list, which is why a tester said the cards were emoji and little else.
Free now reads **Free**, a scraped price reads what the listing says ("$80",
"from $35"), and a genuinely unknown price reads **See details**. The featured
cards already worked this way; the two now share one rule.

---

## 1. Every card shows a price

**Do:** open `/events` and scroll the Upcoming list.
**Expect:** every card has a price badge beside its title. No card shows a
title, emoji and date with no price.
**Fail:** any card with no badge at all.

## 2. The four kinds of price each read correctly

**Do:** use the **Free** and **Paid** filters to find examples of each, then
clear the filters and look for the rest.

| Card | Expect |
|---|---|
| A paid class | the amount, e.g. **$85.00** |
| A free class (try the `Free` filter) | **Free** |
| A scraped listing with a text price | what the listing says, condensed — **$80**, or **from $35** for a range |
| A class with no price on record | **See details** |

**Fail:** anything that is not free reading "Free" — telling someone a paid
class is free is the one mistake this must not make. Report it immediately if
you see it.

## 3. It matches the featured cards

**Do:** compare a card on home ("Featured this week") with the same class in
the `/events` list.
**Expect:** the same price text in both places.
**Fail:** a class showing a price on home and none — or a different one — in
the list. That divergence is what this change removes.

## 4. Nothing else on the card moved

**Do:** look at a card with several badges — one you are attending, or one
marked Ongoing.
**Expect:** price sits beside the title with the Going/Attended and Ongoing
badges as before; long titles still truncate; the layout does not wrap oddly on
a narrow phone.
**Fail:** badges overflowing the card or pushing the save bookmark out of line.

---

## Signed-in pass

Repeat step 4 while logged in, where the **Going** and **Attended** badges
actually render next to the price. Also check the **Saved** tab: those are the
same cards, so prices should appear there too.

## What is shakiest

**"See details" on a narrow screen.** It is the longest of the four labels and
sits in a small badge next to a truncated title. If it wraps badly on a
particular phone width, that is worth a screenshot — the logic is deterministic
but the layout is a judgement call.

## Not covered

The underlying data problem is untouched: 55 of 174 upcoming events have no
price on record, so "See details" is common by design. Sizing and options are
in [../data-quality.md](../data-quality.md) §2. This change makes that gap
visible rather than blank.
