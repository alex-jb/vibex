"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * /cracked — Cracked Score (viral track #2 scaffold).
 *
 * Real flow (Phase 2): GitHub OAuth → score 0-100 across 12 axes
 * (shipping velocity, language depth, OSS contribution, PR review quality,
 * etc.) → branded share card. Reuses creator_scores infra + Satori OG
 * template.
 *
 * Phase 1 (this scaffold): coming-soon landing + email waitlist that drops
 * into the existing Resend send list. Validates demand before building the
 * scoring engine.
 */
export default function CrackedScoreLanding() {
  const [email, setEmail] = useState("");
  const [github, setGithub] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  async function joinWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !github) return;
    setStatus("submitting");
    try {
      // Reuses the Resend pattern. Phase 1 just persists to a row.
      const resp = await fetch("/api/cracked/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, github_handle: github }),
      });
      if (!resp.ok) throw new Error("waitlist submit failed");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-16 text-zinc-100">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-3 text-6xl">🧠</div>
        <p className="text-xs uppercase tracking-widest text-orange-400">
          Cracked Score · coming soon
        </p>
        <h1 className="mt-3 text-5xl font-bold leading-tight">
          How <span className="text-orange-400">cracked</span> are you, really?
        </h1>
        <p className="mt-5 text-base text-zinc-400">
          Paste your GitHub handle. We score 0-100 across 12 dimensions —
          shipping velocity, language depth, OSS contribution, PR review
          quality, issue triage rate, code review tone, README discipline,
          breadth, depth, signal-to-noise, and 2 secret axes.
          <br />
          <br />
          You get a single number + a share card. The card hits harder than a
          resume.
        </p>

        <form
          onSubmit={joinWaitlist}
          className="mt-10 rounded-2xl bg-zinc-900/60 p-6 ring-1 ring-zinc-800 text-left"
        >
          <label className="mb-2 block text-xs uppercase tracking-widest text-zinc-400">
            Your GitHub handle
          </label>
          <input
            type="text"
            required
            placeholder="@alex-jb"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            className="mb-4 w-full rounded-xl bg-black/40 px-4 py-3 text-base outline-none ring-1 ring-zinc-700 focus:ring-orange-500"
          />
          <label className="mb-2 block text-xs uppercase tracking-widest text-zinc-400">
            Email for the early-access drop
          </label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-6 w-full rounded-xl bg-black/40 px-4 py-3 text-base outline-none ring-1 ring-zinc-700 focus:ring-orange-500"
          />
          <button
            type="submit"
            disabled={status === "submitting" || status === "done"}
            className="w-full rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-black hover:bg-orange-400 disabled:opacity-50"
          >
            {status === "submitting"
              ? "Joining…"
              : status === "done"
                ? "✓ You're in. We'll email when scoring opens."
                : "Get my Cracked Score early"}
          </button>
          {status === "error" && (
            <p className="mt-3 text-center text-xs text-red-400">
              Submit failed. Try again in a sec.
            </p>
          )}
        </form>

        <p className="mt-10 text-xs text-zinc-500">
          Built on the same{" "}
          <Link href="/score/alex" className="text-orange-400 hover:underline">
            Creator Score
          </Link>{" "}
          infra. Phase 2 ships when 200 waitlist emails come in.
        </p>

        <footer className="mt-16 text-xs text-zinc-600">
          A side project of{" "}
          <Link href="/" className="text-orange-400 hover:underline">
            VibeXForge
          </Link>
        </footer>
      </div>
    </main>
  );
}
