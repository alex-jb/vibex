"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * <RevivalPanel> — AI Revival Judge sidebar on /funeral/[id].
 *
 * Two states:
 *   1. Initial: "Should this be resurrected?" button. Click → fetch judgment.
 *   2. Loaded: show judgment + "Try again on Validator" button.
 *
 * The Validator CTA carries the funeral id + revival prompt as query params so
 * Validator can pre-fill the form with the new framing. Score bumps on click.
 *
 * Spec: 2026-06-02 brainstorm thread (#11 AI Revival Judge).
 */

interface Judgment {
  worth_reviving: boolean;
  confidence: number;
  pivot_angles: string[];
  rename_suggestion: string;
  vibex_relaunch_prompt: string;
  one_line_verdict: string;
}

interface Props {
  funeralId: string;
  prefetched?: Judgment | null;
}

export function RevivalPanel({ funeralId, prefetched }: Props) {
  const [judgment, setJudgment] = useState<Judgment | null>(prefetched ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function judge() {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/funeral/revive/${funeralId}`, {
        method: "POST",
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.error || "Judge unavailable");
      } else {
        setJudgment(data.judgment);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  async function trackRevivalClick() {
    try {
      const handle =
        typeof window !== "undefined"
          ? localStorage.getItem("vibex.handle") || "anon"
          : "anon";
      await fetch("/api/score/revival-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ funeral_id: funeralId, handle }),
      });
    } catch {
      // best-effort
    }
  }

  if (!judgment && !loading && !error) {
    return (
      <aside className="mt-8 rounded-2xl bg-zinc-900/40 p-6 ring-1 ring-zinc-800">
        <h2 className="mb-2 font-serif text-lg text-zinc-200">
          🔄 Wait — should this have died?
        </h2>
        <p className="mb-4 text-sm text-zinc-400">
          AI judge reads the eulogy and tells you whether this project deserves
          a second life with a different angle.
        </p>
        <button
          onClick={judge}
          className="w-full rounded-xl bg-zinc-800 px-4 py-3 text-sm font-semibold text-orange-400 ring-1 ring-zinc-700 hover:bg-zinc-700"
        >
          Ask the Revival Judge
        </button>
      </aside>
    );
  }

  if (loading) {
    return (
      <aside className="mt-8 rounded-2xl bg-zinc-900/40 p-6 text-center text-sm text-zinc-400 ring-1 ring-zinc-800">
        Reading the eulogy...
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="mt-8 rounded-2xl bg-red-500/10 p-6 text-sm text-red-300 ring-1 ring-red-500/30">
        ❌ {error}
      </aside>
    );
  }

  if (!judgment) return null;

  const validatorHref = `/validator?from_funeral=${encodeURIComponent(
    funeralId,
  )}&prefill=${encodeURIComponent(judgment.vibex_relaunch_prompt)}`;

  return (
    <aside className="mt-8 rounded-2xl bg-zinc-900/40 p-6 ring-1 ring-zinc-800">
      <h2 className="mb-1 font-serif text-lg text-zinc-200">
        🔄 The Revival Judge says
      </h2>
      <p className="mb-4 text-sm italic text-orange-400">
        &ldquo;{judgment.one_line_verdict}&rdquo;
      </p>

      {judgment.worth_reviving && (
        <>
          <p className="mb-3 text-xs uppercase tracking-wider text-zinc-500">
            Confidence: {judgment.confidence}/100
          </p>

          {judgment.pivot_angles.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
                Pivot angles
              </p>
              <ul className="space-y-1 text-sm text-zinc-300">
                {judgment.pivot_angles.map((angle, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-orange-400">→</span>
                    <span>{angle}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {judgment.rename_suggestion && (
            <div className="mb-4">
              <p className="mb-1 text-xs uppercase tracking-wider text-zinc-500">
                Maybe call it
              </p>
              <p className="text-sm font-medium text-zinc-200">
                {judgment.rename_suggestion}
              </p>
            </div>
          )}

          <Link
            href={validatorHref}
            onClick={trackRevivalClick}
            className="block w-full rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-black hover:bg-orange-400"
          >
            🔄 Try Again on Validator →
          </Link>
        </>
      )}

      {!judgment.worth_reviving && (
        <p className="text-sm text-zinc-400">
          Even the priest agrees — let it rest. The eulogy is enough.
        </p>
      )}
    </aside>
  );
}
