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
