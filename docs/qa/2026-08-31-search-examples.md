# Teaching what the search bar does — QA script

**PR:** #13 · **Shipped:** pending merge · **Test at:** the branch preview while
open; <https://design-harmony-ashen.vercel.app> once merged.

Open in a **fresh incognito window**. No login needed.

## What changed, in one paragraph

A tester read the search bar as an ordinary keyword box and never discovered it
understands phrases like "relaxing evening this weekend". The empty search page
— previously nothing but an input — now explains the difference in two lines
and offers five example phrases you can tap to run. The placeholder asks you to
describe rather than to search, and the two examples on the home search box are
tappable rather than decorative text.

---

## 1. The empty search page teaches, rather than sitting blank

**Do:** go to `/search` with no query (tap the search box on home, or open the
URL directly).
**Expect:** the heading "Say what you're in the mood for", a line explaining it
reads the whole phrase — a vibe, a night, a budget — and five tappable example
chips below it.
**Fail:** an empty page below the input, which is what was there before.

## 2. The examples are phrases, not keywords

**Do:** read the five chips.
**Expect:** things like "relaxing evening this weekend", "free, near downtown",
"meet people who like cooking" — each demonstrating something different (mood,
price, place, company, skill level).
**Fail:** a one-word example like "pottery". That teaches the exact habit this
change exists to break.

## 3. Tapping an example actually searches it

**Do:** tap **relaxing evening this weekend**.
**Expect:** it appears in the search box, the URL becomes
`/search?q=relaxing evening this weekend`, and real classes come back. The
teaching block disappears once results are on screen.
**Fail:** a chip that fills the box but does not search, or results that look
like a keyword match on the word "relaxing".

## 4. The results are worth the promise — the honest check

**Do:** tap two or three different examples and read what comes back.
**Expect:** results that plausibly answer the phrase. "free, near downtown"
should skew free and central; "beginner class next week" should skew soon and
beginner-friendly.
**Fail:** results that ignore the phrase entirely. Worth reporting with the
exact wording — a promise made in an example and broken by the results is worse
than no example, and it points at `api/search.ts` rather than this change.

## 5. The home search box invites the same thing

**Do:** on home, look under **Browse Hobbies** at the search box.
**Expect:** "Try:" followed by two tappable chips. Tapping one goes straight to
`/search` with that phrase and runs it.
**Fail:** plain grey text you cannot tap — that was the old hint, and the
tester's eye slid past it.

## 6. Typing a hobby name still filters hobbies

**Do:** on home, type `pottery` into that same box, slowly.
**Expect:** the hobby grid filters as you type — that box does two jobs, and
this one still works. Pressing **Search classes** hands the phrase to the AI
search instead.
**Fail:** the grid not filtering, or the button vanishing.

## 7. The dead end explains itself

**Do:** on home, type something no hobby matches, e.g. `something calming`.
**Expect:** a short block saying no hobby matches, and telling you the Search
classes button will read it as a description.
**Fail:** the old copy, which announced "Search classes with AI" without saying
what that buys you.

---

## Signed-in pass

Nothing here is auth-dependent. Worth one pass only to confirm the examples do
not push the layout around when the header shows a signed-in menu.

## What is shakiest

**Whether the examples are the right five.** They are a judgement call about
what a first-time user should be taught, not a correctness matter. If a tester
taps one and the results feel wrong for the phrase, that is the most useful
feedback this change can get — and it is a signal about the search parsing, not
about the chips.

## Not covered

The wording of the examples is not tested for result quality — only that
tapping one runs it. Search results depend on a live model call, so a chip that
returns something odd is a data or parsing issue, tracked separately in
[../known-issues.md](../known-issues.md).
