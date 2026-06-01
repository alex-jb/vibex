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

        {/* Pricing — pay to skip beta wait */}
        <section className="mt-16">
          <h2 className="mb-2 text-2xl font-bold">
            Need more than 1/day?
          </h2>
          <p className="mb-6 text-sm text-zinc-400">
            Free beta is 1 launch per email per 24h. Skip the wait:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <PricingCard
              title="Single launch"
              price="$49"
              cta="Buy now"
              features={[
                "24 platform drafts",
                "EN + ZH",
                "Bandit-ranked variants",
                "12-month archive access",
                "Instant — skip rate limit",
              ]}
              mode="single"
              email={email}
              url={url}
              positioning={positioning}
            />
            <PricingCard
              title="Pro · subscription"
              price="$19/mo"
              cta="Subscribe"
              accent
              features={[
                "5 launches / month",
                "Weekly trending hook digest",
                "Bandit feedback on past launches",
                "Priority Claude (no wait)",
                "Cancel anytime",
              ]}
              mode="subscription"
              email={email}
              url={url}
              positioning={positioning}
            />
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

interface PricingCardProps {
  title: string;
  price: string;
  cta: string;
  features: string[];
  mode: "single" | "subscription";
  email: string;
  url?: string;
  positioning?: string;
  accent?: boolean;
}

function PricingCard({
  title,
  price,
  cta,
  features,
  mode,
  email,
  url,
  positioning,
  accent,
}: PricingCardProps) {
  const [loading, setLoading] = useState(false);

  async function buy() {
    if (!email) {
      alert("Enter your email above first — we'll send your receipt there.");
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch("/api/launchkit/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, email, url, positioning }),
      });
      const data = await resp.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(`Checkout failed: ${data.error || "unknown"}`);
      }
    } catch (err) {
      alert(`Checkout failed: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={
        accent
          ? "rounded-2xl bg-orange-500/10 p-6 ring-1 ring-orange-500/30"
          : "rounded-2xl bg-zinc-900/60 p-6 ring-1 ring-zinc-800"
      }
    >
      <p className="text-sm uppercase tracking-wider text-orange-400">{title}</p>
      <p className="mt-2 text-3xl font-bold">
        {price}
        {mode === "subscription" && (
          <span className="text-base text-zinc-400"></span>
        )}
      </p>
      <ul className="mt-4 space-y-2 text-sm text-zinc-300">
        {features.map((f) => (
          <li key={f}>· {f}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={buy}
        disabled={loading}
        className="mt-6 w-full rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-orange-400 disabled:opacity-50"
      >
        {loading ? "…" : cta}
      </button>
    </div>
  );
}
