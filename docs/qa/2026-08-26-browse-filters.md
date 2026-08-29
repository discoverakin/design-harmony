# Browse filters on /events — QA script

**PR:** #4 · **Shipped:** 2026-08-26 · **Test at:**
<https://design-harmony-ashen.vercel.app/events>

Open in a **fresh incognito window**. No login needed — these work logged out.

## What changed, in one paragraph

`/events` has always-visible filters above the list: date presets (Today,
Tomorrow, This week, Next week, This month), a calendar for one specific day,
and Free/Paid. They are instant and involve no typing and no AI search. The
choice lives in the URL, so a tap into an event and back keeps it. Distance
chips are **deliberately switched off** until the catalogue is geocoded.

---

## 1. The controls are there without typing anything

**Do:** open `/events`.
**Expect:** two rows of chips above the list — dates plus "Pick a date", then
Any price / Free / Paid. No search box needed.
**Fail:** filters hidden behind a button or requiring a query first.

## 2. Each filter narrows the list, and the section is renamed

**Do:** tap **Tomorrow**.
**Expect:** one section headed **Tomorrow** with only tomorrow's events, plus an
**Ongoing** section (recurring classes whose dates cannot be checked — they
carry a note saying so).
**Fail:** events from other days, or a heading that contradicts the filter
("This Week" while Next week is selected).

## 3. Free and Paid mean exactly that

**Do:** tap **Free**, then **Paid**.
**Expect:** Free shows only $0 classes; Paid shows only priced ones.
**Fail:** anything reading "See details" appearing under either — an unknown
price is neither free nor paid.

## 4. Hidden events are declared — the honesty check

**Do:** with **Free** selected, read the line under the chips.
**Expect:** "Not shown: N with no listed price." With a date filter on, an
equivalent line about events with no confirmed date. Both together compose with
a `·` separator.
**Fail:** no line at all. A third of upcoming events have no price; filtering
them away silently is the failure mode this line exists to prevent.

## 5. Pick a specific day

**Do:** tap **Pick a date**, choose a day a week out.
**Expect:** the chip reads that date, the section is headed with it, and every
card shows that date. Past days are greyed out and unselectable.

## 6. The choice survives a round trip

**Do:** with two filters on, tap an event, press back.
**Expect:** the same filters still applied, URL intact.

## 7. Getting back out

**Do:** with filters on, tap **Clear filters (N)**.
**Expect:** the full list returns. If a combination empties the list, the empty
state offers the same escape.

---

## Signed-in pass

Filters behave identically logged in; the only difference is that Saved and
Past tabs populate. Worth one pass to confirm the filter bar does not appear on
those tabs — it applies to Upcoming only.

## What is shakiest

**Ongoing/recurring events under a date filter.** They appear in their own
section with a note, because their stored date is not a date they happen on.
That is intentional. Whether it reads as *helpful* or as *noise* is a judgement
call worth a tester's opinion.

## Not covered

**Distance filtering is built but switched off** (`DISTANCE_FILTER_ENABLED`).
116 of 174 upcoming events have no coordinates, so a radius returned almost
only recurring classes. There are no distance chips to test; when the geocode
backfill lands, this script needs a section for them. See
[../data-quality.md](../data-quality.md) §4.
