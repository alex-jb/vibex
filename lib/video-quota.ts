/**
 * Free-tier quota tracking for /tools/video-decode.
 *
 * Strategy: 3 free decodes/browser/day, then Stripe Payment Link redirect
 * for a $5 pack of 100 credits. localStorage-only — no auth required, no
 * DB. Sufficient for v1; pivots to per-account when we add auth gating.
 *
 * Why localStorage and not server-side:
 *   - V1 is anonymous (no signup required = lower friction = more decodes)
 *   - Server-side per-IP gate gets defeated by VPN/incognito in 5 seconds
 *   - $0.015 Gemini cost per decode means 3 free/day = $0.045/day worst-case
 *     per user, ≤$1/mo even if everyone abuses. Tolerable for v1.
 *   - When we add auth, swap this for a `users.video_decode_credits` column
 *     and a real server-side gate.
 *
 * Pack-purchase flow:
 *   - User exceeds free → modal → Stripe Payment Link button
 *   - Alex creates ONE Stripe Payment Link in Dashboard ($5 → 100 credits)
 *   - Success URL redirects to /tools/video-decode?pack=100&session={SID}
 *   - We grant 100 credits in localStorage. (Yes, this is forgeable — see
 *     reasoning above. v1 trades trust for friction.)
 */

const STORAGE_KEY = "vibex:video-decode-quota:v1";
const FREE_PER_DAY = 3;

interface QuotaState {
  date: string; // YYYY-MM-DD (browser local time)
  free_used: number; // resets daily
  paid_credits: number; // never resets, granted by pack purchase
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function read(): QuotaState {
  if (typeof window === "undefined") {
    return { date: today(), free_used: 0, paid_credits: 0 };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: today(), free_used: 0, paid_credits: 0 };
    const parsed = JSON.parse(raw) as QuotaState;
    // Roll over on day boundary
    if (parsed.date !== today()) {
      return { date: today(), free_used: 0, paid_credits: parsed.paid_credits ?? 0 };
    }
    return parsed;
  } catch {
    return { date: today(), free_used: 0, paid_credits: 0 };
  }
}

function write(s: QuotaState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export interface QuotaStatus {
  free_remaining: number;
  free_per_day: number;
  paid_credits: number;
  can_decode: boolean;
}

export function checkQuota(): QuotaStatus {
  const s = read();
  const free_remaining = Math.max(0, FREE_PER_DAY - s.free_used);
  return {
    free_remaining,
    free_per_day: FREE_PER_DAY,
    paid_credits: s.paid_credits,
    can_decode: free_remaining > 0 || s.paid_credits > 0,
  };
}

/**
 * Consume one decode. Spends paid credits first if any, else burns a free
 * slot. No-op if neither is available (caller should check first).
 */
export function consumeDecode(): QuotaStatus {
  const s = read();
  if (s.paid_credits > 0) {
    s.paid_credits -= 1;
  } else if (s.free_used < FREE_PER_DAY) {
    s.free_used += 1;
  }
  write(s);
  return checkQuota();
}

/**
 * Grant a pack of credits — called from the success page after Stripe
 * webhook redirect. Caller should also verify the session_id via server
 * lookup before granting, but v1 trusts the URL parameter for speed.
 */
export function grantPack(credits: number): QuotaStatus {
  const s = read();
  s.paid_credits = (s.paid_credits ?? 0) + Math.max(0, Math.floor(credits));
  write(s);
  return checkQuota();
}
