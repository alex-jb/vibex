import { createServerSupabase } from "@/lib/supabase-server";
import { serverLog } from "@/lib/logger";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

/**
 * Postgres-backed rate limit (fixed window).
 * Uses the `check_rate_limit` RPC defined in
 * .private/migrations/036_rate_limit.sql.
 *
 * Why async: the previous in-memory Map was broken on Vercel
 * serverless (per-instance state, bursts bypassed it). This call
 * goes through Supabase so all instances share a single counter.
 *
 * Fails open on DB error — a rate limiter that blocks every
 * request when Postgres hiccups is worse than none.
 */
export async function checkRateLimit(
  key: string,
  limit: number = 100,
  windowMs: number = 60_000,
): Promise<RateLimitResult> {
  const windowSeconds = Math.max(1, Math.floor(windowMs / 1000));

  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_key: key,
      p_max_requests: limit,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      serverLog.error("rate-limit-rpc", "check_rate_limit RPC failed", error);
      return { allowed: true, remaining: limit };
    }

    const row = data as { allowed: boolean; remaining: number } | null;
    if (!row) {
      return { allowed: true, remaining: limit };
    }
    return { allowed: row.allowed, remaining: row.remaining };
  } catch (err) {
    serverLog.error("rate-limit-catch", "check_rate_limit threw", err);
    return { allowed: true, remaining: limit };
  }
}
