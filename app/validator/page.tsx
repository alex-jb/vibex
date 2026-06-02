"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ValidatorLanding() {
  const [idea, setIdea] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [carryNote, setCarryNote] = useState<string | null>(null);

  // Carry-over from /funeral/[id] Revival Judge "Try Again on Validator" CTA.
  // The Revival panel builds /validator?from_funeral=<id>&prefill=<pitch>
  // so we pre-fill the idea textarea and show a small "from funeral" banner.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const prefill = params.get("prefill");
    const fromFuneral = params.get("from_funeral");
    if (prefill) {
      setIdea(prefill.slice(0, 1000));
    }
    if (fromFuneral) {
      setCarryNote(fromFuneral);
    }
  }, []);
  const [result, setResult] = useState<
    null | { ok: true; viewUrl: string; score: number; recommendation: string }
    | { ok: false; error: string }
  >(null);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    if (!idea || idea.length < 20) return;
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch("/api/validator/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          email: email || undefined,
          is_public: isPublic,
          handle: name || undefined,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setResult({ ok: false, error: data.error || "Validation failed" });
      } else {
        setResult({
          ok: true,
          viewUrl: data.view_url || "",
          score: data.report?.verdict?.pmf_score ?? 0,
          recommendation: data.report?.verdict?.recommendation ?? "?",
        });
      }
    } catch (err) {
      setResult({ ok: false, error: String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <header className="mb-12 text-center">
          <p className="mb-3 text-sm uppercase tracking-widest text-orange-400">
            Idea Validator · Free during beta
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Should you build it?
            <br />
            <span className="text-orange-400">We&apos;ll tell you in 30s.</span>
          </h1>
          <p className="mt-6 text-base text-zinc-400">
            We scan GitHub · HN · Reddit r/SideProject + r/Entrepreneur ·
            then Claude writes a 5-section PMF report.
            <br />
            Brutally honest. 0-100 score. Recommendation: BUILD / ITERATE / SKIP.
          </p>
        </header>

        {carryNote && (
          <div className="mb-6 rounded-xl bg-orange-500/10 p-4 text-sm text-orange-300 ring-1 ring-orange-500/30">
            🔄 Carried over from a funeral. Pre-filled the Revival Judge&apos;s
            relaunch pitch. Tweak then validate.{" "}
            <Link
              href={`/funeral/${carryNote}`}
              className="underline hover:text-orange-200"
            >
              Back to memorial →
            </Link>
          </div>
        )}

        <form
          onSubmit={check}
          className="rounded-2xl bg-zinc-900/60 p-6 ring-1 ring-zinc-800"
        >
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Your idea (20-1000 chars)
          </label>
          <textarea
            required
            placeholder="A side-project for solo founders that lets them paste a GitHub URL and get a brutally honest funeral for their dead repos."
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={5}
            minLength={20}
            maxLength={1000}
            className="mb-4 w-full rounded-xl bg-zinc-800 px-4 py-3 text-base outline-none ring-1 ring-zinc-700 focus:ring-orange-500"
          />
          <p className="mb-4 text-right text-xs text-zinc-500">
            {idea.length}/1000
          </p>

          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Your handle (optional — used as your Creator Score name)
          </label>
          <input
            type="text"
            placeholder="alex"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={64}
            className="mb-4 w-full rounded-xl bg-zinc-800 px-4 py-3 text-base outline-none ring-1 ring-zinc-700 focus:ring-orange-500"
          />

          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Email (optional — for follow-up monitoring)
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-full rounded-xl bg-zinc-800 px-4 py-3 text-base outline-none ring-1 ring-zinc-700 focus:ring-orange-500"
          />

          <label className="mb-6 flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-700"
            />
            Make my validation public (good for credibility, anonymized)
          </label>

          <button
            type="submit"
            disabled={loading || idea.length < 20}
            className="w-full rounded-xl bg-orange-500 px-6 py-3 text-base font-semibold text-black transition hover:bg-orange-400 disabled:opacity-50"
          >
            {loading ? "Scanning…" : "Validate this idea (Free beta)"}
          </button>

          {result && !result.ok && (
            <div className="mt-4 rounded-xl bg-red-500/10 p-4 text-sm text-red-300 ring-1 ring-red-500/30">
              ❌ {result.error}
            </div>
          )}
          {result && result.ok && (
            <div className="mt-6 rounded-2xl bg-orange-500/10 p-6 ring-1 ring-orange-500/30 text-center">
              <p className="text-sm uppercase tracking-wider text-orange-400">
                Verdict
              </p>
              <p className="mt-2 text-5xl font-bold">{result.score}/100</p>
              <p className="mt-2 text-lg font-semibold">
                {result.recommendation}
              </p>
              {result.viewUrl && (
                <Link
                  href={result.viewUrl}
                  className="mt-4 inline-block rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-black hover:bg-orange-400"
                >
                  Read full 5-section report →
                </Link>
              )}
            </div>
          )}
        </form>

        <section className="mt-16">
          <h2 className="mb-4 text-2xl font-bold">What you get</h2>
          <ul className="space-y-3 text-sm text-zinc-300">
            <li>🔍 <b>Existing competitors</b> — GitHub top 5 by stars, with differentiation analysis</li>
            <li>📊 <b>Demand signals</b> — Reddit + HN post counts + Google Trends momentum</li>
            <li>🏗️ <b>What&apos;s already built</b> — missing features, pain points, pricing distribution</li>
            <li>💡 <b>White space</b> — 3 differentiation angles you could attack from</li>
            <li>🎯 <b>PMF verdict</b> — 0-100 score across 4 axes + 🟢 BUILD / 🟡 ITERATE / 🔴 SKIP</li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-bold">After beta</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-zinc-900/60 p-6 ring-1 ring-zinc-800">
              <p className="text-sm uppercase tracking-wider text-orange-400">
                Single
              </p>
              <p className="mt-2 text-3xl font-bold">$5</p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                <li>· 1 full report</li>
                <li>· PDF + archive link</li>
                <li>· No expiration</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-orange-500/10 p-6 ring-1 ring-orange-500/30">
              <p className="text-sm uppercase tracking-wider text-orange-400">
                Pro · subscription
              </p>
              <p className="mt-2 text-3xl font-bold">
                $19<span className="text-base text-zinc-400">/mo</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                <li>· Unlimited validations</li>
                <li>· Idea evolution tracking</li>
                <li>· Weekly &quot;trending opportunities&quot; digest</li>
                <li>· Cancel anytime</li>
              </ul>
            </div>
          </div>
        </section>

        <footer className="mt-12 text-center text-xs text-zinc-600">
          A side project of{" "}
          <Link href="/" className="text-orange-400 hover:underline">
            VibeXForge
          </Link>{" "}
          ·{" "}
          <Link href="/funeral" className="text-orange-400 hover:underline">
            See also: AI Side Project Funeral
          </Link>
        </footer>
      </div>
    </main>
  );
}
