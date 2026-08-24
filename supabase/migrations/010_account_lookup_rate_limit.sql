-- ============================================================
-- Rate-limit ledger for /api/account-exists
--
-- The sign-in page asks the server whether an email has an account so it can
-- say "No account found" instead of a generic error. That endpoint is an
-- account-enumeration oracle by design, so it must be throttled.
--
-- Serverless instances do not share memory, so an in-process limiter is
-- unenforceable. This table is the shared counter.
--
-- Only the service-role key touches this table (RLS is enabled with NO
-- policies, so anon/authenticated clients cannot read or write it).
--
-- WHY POSTGRES, AND WHEN TO REPLACE IT
-- Three options were considered for the shared counter:
--   1. In-process Map        — rejected: serverless instances do not share
--                              memory, so the limit is unenforceable.
--   2. Vercel WAF rate limit — the best option (enforced at the edge, no
--                              table, no round trips), but configurable rate
--                              limit rules require a Vercel Pro plan. This
--                              project is not on one.
--   3. Vercel KV / Upstash   — rejected: adds a dependency and provisioned
--                              infrastructure for the same job this does.
-- Postgres won because the endpoint already holds a service-role client, so
-- it needs no new infrastructure at all.
--
-- IF THIS PROJECT MOVES TO VERCEL PRO: replace this with a WAF rate-limit rule
-- on /api/account-exists, delete rateLimited() from api/account-exists.ts, and
-- drop this table. The edge rule is strictly better — it runs before the
-- function and costs no database round trips.
--
-- WHAT IT ACTUALLY BUYS: 10 requests/minute per IP stops casual probing. It
-- does NOT stop a determined attacker rotating IPs. It raises the cost of
-- enumeration; it does not prevent it.
--
-- THIS FILE MUST BE RUN BY HAND in the Supabase SQL editor — this repo has no
-- migration runner. If it is not applied, rateLimited() fails closed, every
-- lookup returns 429, and the sign-in page silently falls back to its generic
-- error message.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.account_lookup_attempts (
  id          bigserial PRIMARY KEY,
  client_key  text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_account_lookup_attempts_key_time
  ON public.account_lookup_attempts (client_key, created_at DESC);

ALTER TABLE public.account_lookup_attempts ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies: service_role bypasses RLS, everyone else is denied.

-- Housekeeping: the endpoint prunes opportunistically, but this makes a manual
-- sweep easy if the table ever grows.
--   DELETE FROM public.account_lookup_attempts WHERE created_at < now() - interval '1 day';
