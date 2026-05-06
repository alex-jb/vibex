"use client";

/**
 * PH-day live banner.
 *
 * Three states, decided by current time vs `featuredAt`:
 *   1. > 24h before PH      → countdown ("PH launch in 2d 14h")
 *   2. < 24h before, or LIVE → live vote count + rank + CTA
 *   3. > 24h after           → null (auto-hides; we don't linger)
 *
 * Defensive defaults:
 *   • API not configured (no PH_DEV_TOKEN) → null
 *   • Network error → null (never an error UI on PH-day; silence is safer)
 *   • Polls every 60s when LIVE, 5min otherwise
 *   • A user can dismiss; dismissal persists in sessionStorage only (resets daily)
 */
import { useEffect, useState } from "react";

const DISMISS_KEY = "vibex:ph-banner-dismissed";

interface PHState {
  configured?: boolean;
  error?: string;
  url?: string;
  votes?: number;
  comments?: number;
  rank?: number | null;
  featuredAt?: string | null;
}

function classify(state: PHState | null, now: Date):
  | { mode: "hidden" }
  | { mode: "countdown"; targetMs: number }
  | { mode: "live"; data: Required<Pick<PHState, "url" | "votes" | "comments">> & { rank: number | null } } {
  if (!state || !state.configured || state.error) return { mode: "hidden" };
  if (!state.featuredAt) {
    // Configured but no featuredAt → schedule unknown; show countdown to a default
    // env-overridable date. Fall back to hidden if no default either.
    const defaultDate = process.env.NEXT_PUBLIC_PH_LAUNCH_DATE;
    if (!defaultDate) return { mode: "hidden" };
    const targetMs = Date.parse(defaultDate);
    if (Number.isNaN(targetMs)) return { mode: "hidden" };
    return { mode: "countdown", targetMs };
  }
  const launchedMs = Date.parse(state.featuredAt);
  if (Number.isNaN(launchedMs)) return { mode: "hidden" };
  const hoursSince = (now.getTime() - launchedMs) / 3_600_000;
  if (hoursSince < -24) {
    // > 24h before launch → countdown mode
    return { mode: "countdown", targetMs: launchedMs };
  }
  if (hoursSince > 24) return { mode: "hidden" };
  // Within ±24h → LIVE
  return {
    mode: "live",
    data: {
      url: state.url ?? "",
      votes: state.votes ?? 0,
      comments: state.comments ?? 0,
      rank: state.rank ?? null,
    },
  };
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "now";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

export function PHDayBanner() {
  const [state, setState] = useState<PHState | null>(null);
  const [now, setNow] = useState<Date>(new Date());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDismissed(window.sessionStorage.getItem(DISMISS_KEY) === "1");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchState = async () => {
      try {
        const r = await fetch("/api/ph-state", { cache: "no-store" });
        if (!r.ok) throw new Error(`${r.status}`);
        const data = (await r.json()) as PHState;
        if (!cancelled) setState(data);
      } catch {
        if (!cancelled) setState({ configured: true, error: "fetch_failed" });
      }
    };
    fetchState();
    // Poll cadence depends on classification — heavier when live
    const tick = setInterval(() => setNow(new Date()), 1000);
    const poll = setInterval(fetchState, 60_000);
    return () => {
      cancelled = true;
      clearInterval(tick);
      clearInterval(poll);
    };
  }, []);

  if (dismissed) return null;
  const cls = classify(state, now);
  if (cls.mode === "hidden") return null;

  const dismiss = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    }
    setDismissed(true);
  };

  if (cls.mode === "countdown") {
    const remainingMs = cls.targetMs - now.getTime();
    return (
      <div
        role="status"
        aria-live="polite"
        className="mx-auto mb-4 flex max-w-3xl items-center justify-between gap-3 border border-white/[0.06] px-4 py-3"
        style={{ background: "rgba(57, 255, 20, 0.04)" }}
      >
        <div className="flex items-center gap-3">
          <span aria-hidden className="font-pixel text-[10px]" style={{ color: "#39FF14" }}>🔨</span>
          <span className="font-pixel text-[10px] tracking-widest uppercase" style={{ color: "#39FF14" }}>
            VibeXForge launches on Product Hunt in {formatCountdown(remainingMs)}
          </span>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss banner"
          className="font-pixel text-[9px] uppercase tracking-widest transition-colors hover:text-foreground"
          style={{ color: "var(--text-muted)" }}
        >
          ×
        </button>
      </div>
    );
  }

  // LIVE
  const { url, votes, rank } = cls.data;
  const rankLabel = rank ? `#${rank} on PH today` : "live on Product Hunt";
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mx-auto mb-4 flex max-w-3xl items-center justify-between gap-3 border border-[#39FF14]/40 px-4 py-3 transition-colors hover:bg-[#39FF14]/[0.08]"
      style={{ background: "rgba(57, 255, 20, 0.06)" }}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="relative inline-flex h-2 w-2"
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39FF14] opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#39FF14]" />
        </span>
        <span className="font-pixel text-[10px] tracking-widest uppercase" style={{ color: "#39FF14" }}>
          We&apos;re {rankLabel}
        </span>
        <span className="font-pixel text-[10px]" style={{ color: "var(--text-muted)" }}>
          · {votes.toLocaleString()} upvotes
        </span>
      </div>
      <span className="font-pixel text-[9px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        Tap to upvote →
      </span>
    </a>
  );
}
