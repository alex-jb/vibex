"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * /funeral/idea — Idea Funeral form (companion to /funeral for dead repos).
 *
 * Paste the startup idea you never built. AI writes a priest eulogy.
 *
 * Migration 066. Score surface=funeral_idea (delta 20).
 */
export default function IdeaFuneralLanding() {
  const [ideaText, setIdeaText] = useState("");
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<
    | null
    | {
        ok: true;
        eulogy: string;
        deceasedName: string;
        viewUrl: string;
        ashImageUrl: string | null;
      }
    | { ok: false; error: string }
  >(null);

  const charCount = ideaText.length;
  const canSubmit = charCount >= 20 && charCount <= 500 && !loading;

  async function bury(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch("/api/funeral/eulogize-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea_text: ideaText,
          mourner_name: name || undefined,
          is_public: isPublic,
          handle: name || undefined,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setResult({ ok: false, error: data.error || "Burial failed" });
      } else {
        setResult({
          ok: true,
          eulogy: data.eulogy,
          deceasedName: data.deceased_name,
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
        {/* Type tabs */}
        <nav className="mb-8 flex justify-center gap-2 text-sm">
          <Link
            href="/funeral"
            className="rounded-full px-4 py-2 text-zinc-400 ring-1 ring-zinc-800 hover:text-zinc-200"
          >
            🪦 Dead Repo
          </Link>
          <span className="rounded-full bg-orange-500 px-4 py-2 font-semibold text-black">
            💭 Dead Idea
          </span>
        </nav>

        <header className="mb-12 text-center">
          <div className="mb-3 text-6xl">💭</div>
          <h1 className="text-4xl font-serif font-bold leading-tight md:text-5xl">
            A Funeral for the Idea You Never Built
          </h1>
          <p className="mt-4 text-base text-zinc-400">
            For every project you shipped, there are 50 you only talked about.
            <br />
            Tell us about one. We&apos;ll give it the goodbye it deserves.
          </p>
        </header>

        <form
          onSubmit={bury}
          className="rounded-2xl bg-zinc-900/60 p-6 ring-1 ring-zinc-800"
        >
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            The idea that lived in your head
          </label>
          <textarea
            required
            minLength={20}
            maxLength={500}
            placeholder="e.g. I always wanted to build a way to make GitHub repo READMEs auto-translate. Started thinking about it after seeing a Chinese dev's repo in 2023. Never wrote a line of code."
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
            rows={5}
            className="mb-1 w-full resize-none rounded-xl bg-black/40 px-4 py-3 text-base outline-none ring-1 ring-zinc-700 focus:ring-orange-500"
          />
          <div className="mb-4 flex justify-end text-xs text-zinc-500">
            {charCount} / 500
            {charCount < 20 && " — at least 20 chars"}
          </div>

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
            Display on the public memorial wall
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-xl bg-orange-500 px-6 py-3 text-base font-semibold text-black transition hover:bg-orange-400 disabled:opacity-50"
          >
            {loading ? "Lighting the candle…" : "🕯️ Bury this idea"}
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
                  alt={`Memorial for ${result.deceasedName}`}
                  className="mx-auto max-w-md rounded-2xl ring-1 ring-zinc-800"
                />
              )}
              <div className="rounded-2xl bg-black/40 p-6 ring-1 ring-zinc-800">
                <p className="mb-3 text-center font-serif text-lg text-orange-400">
                  {result.deceasedName}
                </p>
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
                    Permanent memorial →
                  </Link>
                )}
                <Link
                  href="/validator"
                  className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-black hover:bg-orange-400"
                >
                  Validate the next one →
                </Link>
              </div>
            </div>
          )}
        </form>

        <section className="mt-12 text-center">
          <Link
            href="/funeral/wall"
            className="text-sm text-zinc-400 underline hover:text-orange-400"
          >
            🪦 Visit the public memorial wall →
          </Link>
        </section>

        <footer className="mt-16 text-center text-xs text-zinc-600">
          A side project of{" "}
          <Link href="/" className="text-orange-400 hover:underline">
            VibeXForge
          </Link>{" "}
          · Companion to{" "}
          <Link href="/validator" className="text-orange-400 hover:underline">
            /validator
          </Link>
          .
        </footer>
      </div>
    </main>
  );
}
