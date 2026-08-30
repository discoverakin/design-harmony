# How long an event runs — QA script

**PR:** #12 · **Shipped:** pending merge · **Test at:** the branch preview while
the PR is open, then <https://design-harmony-ashen.vercel.app>

Open in a **fresh incognito window** (no service worker, and you start logged
out). No DevTools needed. Everything here is on the **event detail page**;
nothing on the lists or cards changed.

## What changed, in one paragraph

A tester wanted to know how long a workshop runs so she could plan the rest of
her day. `events.time` only ever held a start. The end is usually already in
the record — the scout captured the whole span and dropped half of it on the
way in — so the detail page now recovers it and shows
**"10:30 AM – 5:00 PM · 6h 30m"** where it can. It resolves for roughly a
**third of events (16 of a 58-row sample)**; everything else shows the start
alone, exactly as before. The bar is deliberately high, because a wrong end
time is worse than none when someone is planning around it — see section 4 for
what it refuses on purpose. Separately, this page used to print the
`2099-01-01` placeholder date as a literal "Thursday, January 1, 2099"; it now
says "Schedule varies", which is what both card types have always said.

Concrete events to test with are named below. If a listing has been re-scraped
since 2026-08-30 its text may have changed — check the event's own description
before calling a missing span a bug.

---

## 1. A span the description spells out

**Do:** Open **Art Quilt – Photo (Final Sessions)** (Ann Arbor Sewing Center).
**Expect:** Beside the clock icon, **"10:30 AM – 5:00 PM · 6h 30m"**, the
duration in lighter grey than the times.
**Fail:** "10:30 AM" alone — the old behaviour.

Note the "Dates:" row above it still shows the raw scraped text, which repeats
the span. That is expected: the Dates row says *which days*, the clock row says
*how long*.

## 2. A span recovered where there was no time at all

**Do:** Open **Family Pottery Wheel Taster Class** (Parkdale Pottery, Toronto).
**Expect:** **"10:00 AM – 11:30 AM · 1h 30m"**. This event stores the literal
string "See details" in its time field, so before this change the page showed
"See details" and nothing else. The span comes from its schedule note.
**Fail:** "See details" still showing on the clock row.

## 3. Events with nothing to recover are untouched

**Do:** Open **Pottery Fundamentals – 8-Week Course** (stores "See details",
no span anywhere) and **Pottery Fundamentals | 8 Weeks — Fall 2026** (a normal
"10:00 AM" start, no end stated).
**Expect:** Exactly what they showed before — "See details" and "10:00 AM"
respectively. No invented end time, no "0m", no empty dash.
**Fail:** Any duration appearing on an event whose listing never states one.
That is the failure mode that matters most here.

## 4. What it refuses on purpose

These are the cases that make a parsed end time dangerous, and all of them
should show **no** span. Worth a spot check if you are reviewing the logic
rather than the feature.

**Do:** Find a listing whose description offers several different times — e.g.
one saying "Multiple days/times available (Mon–Fri AM and PM)".
**Expect:** Start time only. When a listing advertises more than one span there
is no way to know which one this row is.
**Fail:** One of the several times being picked and presented as *the* answer.

Also silently excluded, and none of them should ever produce a duration: date
ranges ("Sep 10–Oct 29"), price ranges ("$35–$325"), age ranges ("grades 1–7"),
and course lengths ("10-week"). A span only counts if its **end** carries an
AM/PM.

## 5. The placeholder date

**Do:** Open any event whose cards read "Schedule varies" in the list — the
Toronto pottery listings are the easiest to find.
**Expect:** The detail page's date row also reads **"Schedule varies"**.
**Fail:** "Thursday, January 1, 2099". That is the sentinel this page used to
print verbatim while every card in the app hid it.

---

## Signed-in pass

Nothing here is behind auth — the detail page renders the same meta block to
everyone, so **the whole script above can be run logged out**, and was.

One signed-in surface did change by inheritance and is **unverified**: the
"Log Your Attendance" sheet (RSVP an event, then "Mark as Attended & Log
Hours") prints the date and time at the top. On a placeholder-dated event that
line now reads "Schedule varies · See details" instead of
"Thursday, January 1, 2099 · See details". It is cosmetic, and the hours you
type are unaffected.

## What is shakiest

**Coverage is a third, and that is the honest ceiling.** Two-thirds of events
genuinely do not state an end anywhere in their record. A tester expecting
durations everywhere will read that as broken; it is not. The fix for the rest
is `duration_minutes`, a column that already exists on the table and is filled
in on about 1 event in 58 — see [../data-quality.md](../data-quality.md) §6.

**Prose durations are deliberately ignored.** Listings that say "2.5 hrs of
hands-on wheel time" or "6 to 8 classes (3 hrs each)" get nothing, on purpose:
the first one follows an instructor demo, so it is explicitly *not* the length
of the class. Do not file those as misses.

**Meridiem inheritance is the fiddliest part.** "6:30-7:30 PM" has no AM/PM on
the start and has to borrow the end's; "10:30–12:00 PM" has to *not* borrow it,
or it becomes a half-past-ten-at-night start. If you see a span that runs
backwards or lands 12 hours out, that is where it broke.

## Not covered

- **The list and featured cards still show the start only.** They are tight on
  space and the ticket was about the detail page. Adding the span there is a
  separate call.
- **No schema change.** Nothing was backfilled and no migration was added; this
  reads what is already in `description` and `schedule_note`.
- The `Dates:` row, the price, the RSVP flow and everything below the meta
  block are untouched.
