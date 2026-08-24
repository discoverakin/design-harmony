/**
 * Account-existence lookup for the sign-in page.
 *
 * Supabase deliberately returns the same "Invalid login credentials" error for
 * a wrong password and a nonexistent account, so the client cannot tell them
 * apart. This endpoint answers that question with the service-role key, letting
 * Login.tsx say "No account found for <email>" instead of a generic error.
 *
 * SECURITY: this is an account-enumeration oracle by design — it reveals
 * whether an email is registered. That is an accepted product tradeoff, made
 * deliberately to fix the sign-up dead end. Mitigations:
 *   - a shared, Postgres-backed rate limit (see below) that actually holds
 *     across serverless instances, unlike in-process counters;
 *   - the client only calls it after a failed sign-in, which Supabase itself
 *     rate-limits — note this is a UI convention, not enforcement, since the
 *     route can be called directly;
 *   - responses carry no detail beyond the boolean.
 *
 * TODO(verify): the GoTrue admin `filter` param is a fuzzy email match and is
 * not part of supabase-js's typed API. Results are exact-matched below, but the
 * param's behavior should be confirmed against this project's Supabase version.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const MAX_EMAIL_LENGTH = 254; // RFC 5321
const PRUNE_OLDER_THAN_MS = 60 * 60 * 1000;

function clientKey(req: any): string {
  const forwarded = req.headers?.["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return (raw?.split(",")[0] || req.socket?.remoteAddress || "unknown").trim();
}

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (!email || email.length > MAX_EMAIL_LENGTH) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

/**
 * Shared counter in Postgres so the limit holds across serverless instances.
 * Fails CLOSED: if the ledger can't be read, the request is refused rather
 * than allowed through unmetered.
 */
async function rateLimited(supabase: any, key: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  const { count, error } = await supabase
    .from("account_lookup_attempts")
    .select("id", { count: "exact", head: true })
    .eq("client_key", key)
    .gte("created_at", windowStart);

  if (error) return true;
  if ((count ?? 0) >= RATE_LIMIT_MAX_REQUESTS) return true;

  await supabase.from("account_lookup_attempts").insert({ client_key: key });

  // Opportunistic cleanup — cheap, and keeps the table from growing forever.
  if (Math.floor((count ?? 0)) === 0) {
    const cutoff = new Date(Date.now() - PRUNE_OLDER_THAN_MS).toISOString();
    await supabase.from("account_lookup_attempts").delete().lt("created_at", cutoff);
  }

  return false;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const email = normalizeEmail(req.body?.email);
  if (!email) {
    return res.status(400).json({ error: "Invalid email" });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(503).json({ error: "Lookup unavailable" });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  if (await rateLimited(supabase, clientKey(req))) {
    return res.status(429).json({ error: "Too many requests" });
  }

  try {
    const url = `${SUPABASE_URL}/auth/v1/admin/users?filter=${encodeURIComponent(email)}&per_page=50`;
    const lookup = await fetch(url, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });

    if (!lookup.ok) {
      return res.status(503).json({ error: "Lookup unavailable" });
    }

    const data = await lookup.json();
    const users = Array.isArray(data?.users) ? data.users : [];

    // `filter` is fuzzy, so never trust a non-empty result on its own —
    // "sue@example.com" would otherwise match "sue@example.com.au".
    const exists = users.some(
      (u: { email?: string }) => u?.email?.trim().toLowerCase() === email
    );

    return res.status(200).json({ exists });
  } catch {
    // Fail closed: the caller shows a generic error rather than wrongly
    // telling someone their account does not exist.
    return res.status(503).json({ error: "Lookup unavailable" });
  }
}
