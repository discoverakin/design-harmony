# <Feature name> — QA script

**PR:** #NN · **Shipped:** YYYY-MM-DD · **Test at:** <production or preview URL>

Open in a **fresh incognito window** (no service worker, and you start logged
out). Open **DevTools → Network**, filter `<term>`, tick Fetch/XHR — <why they
need it, or delete this line>.

## What changed, in one paragraph

<What a tester needs to know to judge whether it works. The user-visible
behaviour, not the implementation.>

---

## 1. <Scenario name — the most important one first>

**Do:** <exact steps, including the URL to start from>
**Expect:** <observable result>
**Fail:** <what the broken version looks like — the old behaviour, if there was one>

## 2. <Next scenario>

**Do:**
**Expect:**
**Fail:**

---

## Signed-in pass

<What to repeat while logged in, and why it differs. Everything here is
unverified by the author if it needed credentials.>

## What is shakiest

<The part most likely to break in the wild, and how to tell a known limitation
from a real bug.>

## Not covered

<Anything deliberately out of scope, so the gap is visible rather than assumed.>
