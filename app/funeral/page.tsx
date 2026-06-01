"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * /funeral — AI Side Project Funeral landing.
 *
 * Paste your dead GitHub repo URL → get a 250-word eulogy + ash image.
 * Spec: alex-brain research/2026-05-31-vibecoding-viral-tracks.md (#1)
 */
export default function FuneralLanding() {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<
    | null
    | {
        ok: true;
        eulogy: string;
        viewUrl: string;
        ashImageUrl: string | null;
      }
    | { ok: false; error: string }
  >(null);

  async function bury(e: React.FormEvent) {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch("/api/funeral/eulogize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          github_url: url,
          mourner_name: name || undefined,
          is_public: isPublic,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setResult({ ok: false, error: data.error || "Burial failed" });
      } else {
        setResult({
          ok: true,
          eulogy: data.eulogy,
          viewUrl: data.view_url || "",
          ashImageUrl: data.ash_image_url || null,
        });
      }
    } catch (err) {
      setResult({ ok: false, error: String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-200 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Hero */}
        <header className="mb-12 text-center">
          <div className="mb-3 text-6xl">🕯️</div>
          <h1 className="text-4xl font-serif font-bold leading-tight md:text-5xl">
            A Funeral for Your Side Project
          </h1>
          <p className="mt-4 text-base text-zinc-400">
            Every developer has 5 dead repos. They deserve a proper goodbye.
            <br />
            Paste the GitHub URL. We&apos;ll write the eulogy.
          </p>
        </header>

        {/* Form */}
        <form
          onSubmit={bury}
          className="rounded-2xl bg-zinc-900/60 p-6 ring-1 ring-zinc-800"
        >
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            The deceased&apos;s GitHub URL
          </label>
          <input
            type="url"
            required
            placeholder="https://github.com/you/that-app-you-stopped-shipping"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mb-4 w-full rounded-xl bg-black/40 px-4 py-3 text-base outline-none ring-1 ring-zinc-700 focus:ring-orange-500"
          />

          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Your name (the mourner) — optional
          </label>
          <input
            type="text"
            placeholder="Anon"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-4 w-full rounded-xl bg-black/40 px-4 py-3 text-base outline-none ring-1 ring-zinc-700 focus:ring-orange-500"
          />

          <label className="mb-6 flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-700"
            />
            Display on the public memorial wall (helps other mourners find peace)
          </label>

          <button
            type="submit"
            disabled={loading || !url}
            className="w-full rounded-xl bg-orange-500 px-6 py-3 text-base font-semibold text-black transition hover:bg-orange-400 disabled:opacity-50"
          >
            {loading ? "Lighting the candle…" : "🕯️ Bury this project"}
          </button>

          {result && !result.ok && (
            <div className="mt-4 rounded-xl bg-red-500/10 p-4 text-sm text-red-300 ring-1 ring-red-500/30">
              ❌ {result.error}
            </div>
          )}
          {result && result.ok && (
            <div className="mt-6 space-y-4">
              {result.ashImageUrl && (
                <img
                  src={result.ashImageUrl}
                  alt="Ash spreading"
                  className="mx-auto max-w-md rounded-2xl ring-1 ring-zinc-800"
                />
              )}
              <div className="rounded-2xl bg-black/40 p-6 ring-1 ring-zinc-800">
                <p className="whitespace-pre-wrap font-serif text-base leading-7 text-zinc-100">
                  {result.eulogy}
                </p>
              </div>
              <div className="flex gap-3">
                {result.viewUrl && (
                  <Link
                    href={result.viewUrl}
                    className="flex-1 rounded-xl bg-zinc-800 px-4 py-3 text-center text-sm font-semibold text-white ring-1 ring-zinc-700 hover:bg-zinc-700"
                  >
                    Permanent memorial page →
                  </Link>
                )}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `RIP ${url.split("/").pop()}. I just gave it a proper funeral.`,
                  )}&url=${encodeURIComponent(
                    typeof window !== "undefined"
                      ? `${window.location.origin}${result.viewUrl}`
                      : "",
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-black hover:bg-orange-400"
                >
                  Share on X
                </a>
              </div>
            </div>
          )}
        </form>

        {/* Public wall link */}
        <section className="mt-12 text-center">
          <Link
            href="/funeral/wall"
            className="text-sm text-zinc-400 underline hover:text-orange-400"
          >
            🪦 Visit the public memorial wall →
          </Link>
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-zinc-600">
          A side project of{" "}
          <Link href="/" className="text-orange-400 hover:underline">
            VibeXForge
          </Link>{" "}
          · Built with grief and{" "}
          <a
            href="https://anthropic.com"
            className="text-orange-400 hover:underline"
          >
            Claude
          </a>
          .
        </footer>
      </div>
    </main>
  );
}
