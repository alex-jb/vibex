"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * /launchkit — LaunchKit landing page + paste-URL form.
 *
 * MVP path (2026-05-31):
 *   - User pastes URL + 1-line positioning
 *   - We call /api/launchkit/generate (which wraps draft-generator)
 *   - Free during beta. Stripe paywall added in Phase 2 once 5 paying
 *     beta users validate willingness-to-pay.
 *
 * Reuses VibeXForge's existing draft-generator.ts (12 platforms,
 * EN+ZH, Sonnet 4.6, prompt caching).
 *
 * Spec: alex-brain research/projects-2026-06/01-launchkit-spec.md
 */
export default function LaunchKitPage() {
  const [url, setUrl] = useState("");
  const [positioning, setPositioning] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<
    null | { ok: true; jobId: string } | { ok: false; error: string }
  >(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!url || !positioning || !email) return;
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch("/api/launchkit/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, positioning, email }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setResult({ ok: false, error: data.error || "Generation failed" });
      } else {
        setResult({ ok: true, jobId: data.jobId });
      }
    } catch (err) {
      setResult({ ok: false, error: String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white px-6 py-12">
      <div className="mx-auto max-w-3xl">
        {/* Hero */}
        <header className="mb-12 text-center">
          <p className="mb-3 text-sm uppercase tracking-widest text-orange-400">
            LaunchKit · Free during beta
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Paste your URL.
            <br />
            <span className="text-orange-400">
              Get 24 launch drafts in 60 seconds.
            </span>
          </h1>
          <p className="mt-6 text-lg text-zinc-400">
            X · Reddit · HN · Dev.to · LinkedIn · Bluesky · Threads · PH ·
            小红书 · 即刻 · 知乎 · B 站. Platform-native voice. Edit, copy,
            ship.
          </p>
        </header>

        {/* Form */}
        <form
          onSubmit={submit}
          className="rounded-2xl bg-zinc-900/60 p-6 ring-1 ring-zinc-800"
        >
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Your product URL
          </label>
          <input
            type="url"
            required
            placeholder="https://yourproduct.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mb-4 w-full rounded-xl bg-zinc-800 px-4 py-3 text-base outline-none ring-1 ring-zinc-700 focus:ring-orange-500"
          />

          <label className="mb-2 block text-sm font-medium text-zinc-300">
            One-line positioning
          </label>
          <input
            type="text"
            required
            placeholder="The Cursor for indie game devs"
            value={positioning}
            onChange={(e) => setPositioning(e.target.value)}
            className="mb-4 w-full rounded-xl bg-zinc-800 px-4 py-3 text-base outline-none ring-1 ring-zinc-700 focus:ring-orange-500"
            maxLength={140}
          />

          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Where to email your drafts
          </label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-6 w-full rounded-xl bg-zinc-800 px-4 py-3 text-base outline-none ring-1 ring-zinc-700 focus:ring-orange-500"
          />

          <button
            type="submit"
            disabled={loading || !url || !positioning || !email}
            className="w-full rounded-xl bg-orange-500 px-6 py-3 text-base font-semibold text-black transition hover:bg-orange-400 disabled:opacity-50"
          >
            {loading ? "Drafting…" : "Generate 24 drafts (Free beta)"}
          </button>

          {result && result.ok && (
            <div className="mt-4 rounded-xl bg-green-500/10 p-4 text-sm text-green-300 ring-1 ring-green-500/30">
              ✅ Drafting started. Job ID:{" "}
              <code className="font-mono">{result.jobId}</code>. We&apos;ll
              email <code className="font-mono">{email}</code> with the link
              in ~60 seconds.
              <br />
              <Link
                href={`/launchkit/drafts/${result.jobId}`}
                className="mt-2 inline-block text-orange-400 hover:underline"
              >
                Or view live →
              </Link>
            </div>
          )}
          {result && !result.ok && (
            <div className="mt-4 rounded-xl bg-red-500/10 p-4 text-sm text-red-300 ring-1 ring-red-500/30">
              ❌ {result.error}
            </div>
          )}
        </form>

        {/* Pricing teaser */}
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">After beta</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-zinc-900/60 p-6 ring-1 ring-zinc-800">
              <p className="text-sm uppercase tracking-wider text-orange-400">
                Single launch
              </p>
              <p className="mt-2 text-3xl font-bold">$49</p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                <li>· 24 platform drafts</li>
                <li>· EN + ZH</li>
                <li>· Bandit-ranked variants</li>
                <li>· 12-month archive access</li>
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
                <li>· 5 launches / month</li>
                <li>· Weekly trending hook digest</li>
                <li>· Bandit feedback on past launches</li>
                <li>· Priority Claude (no wait)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="mt-12 text-center text-sm text-zinc-500">
          Powered by{" "}
          <a
            href="https://github.com/alex-jb/orallexa-marketing-agent"
            className="text-orange-400 hover:underline"
          >
            orallexa-marketing-agent
          </a>{" "}
          · MIT · Same engine that runs{" "}
          <Link href="/" className="text-orange-400 hover:underline">
            VibeXForge.com
          </Link>
          .
        </section>
      </div>
    </main>
  );
}
