"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";

interface Builder {
  id: string;
  title: string;
  creator: string;
  thumbnail: string;
  views: number;
  upvotes: number;
  category: string;
}

/**
 * TopBuilders — "this week's top 5 makers" social proof rail on /learn.
 *
 * Pulls from /api/learn/top-builders (10-min cache). Skeleton on first
 * paint, gracefully hides if empty (no error UI — sidebar should never
 * scream "broken" on a free funnel page).
 *
 * Why a horizontal scroll on mobile and grid on desktop: Codedex shows
 * Builds as a vertical list; we already have a chapter-card grid above,
 * so a horizontal scroll reads as a different rhythm and matches /home
 * "Recently Active" widget pattern from 2026-04-25.
 */
export function TopBuilders() {
  const { lang } = useLang();
  const isZh = lang === "zh";
  const [builders, setBuilders] = useState<Builder[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let live = true;
    fetch("/api/learn/top-builders")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (!live) return;
        setBuilders(Array.isArray(data?.top) ? data.top : []);
      })
      .catch(() => {
        if (live) setError(true);
      });
    return () => {
      live = false;
    };
  }, []);

  // Hide gracefully on error; first-mount skeleton, otherwise nothing.
  if (error) return null;
  if (builders && builders.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            {isZh ? "本期作品 · 来自 VibeXForge" : "This week's builders · from VibeXForge"}
          </div>
          <h2 className="mt-2 text-xl font-bold">
            {isZh
              ? "AICG 学员把作品发到这里"
              : "Where AICG learners ship their work"}
          </h2>
        </div>
        <Link
          href="/home"
          className="hidden text-xs text-[var(--accent-indigo)] hover:underline md:inline"
        >
          {isZh ? "看全部 →" : "See all →"}
        </Link>
      </div>

      <div className="-mx-6 mt-5 overflow-x-auto px-6 pb-2 md:mx-0 md:px-0">
        <div className="flex min-w-max gap-3 md:grid md:min-w-0 md:grid-cols-5 md:gap-4">
          {builders === null ? (
            // Skeleton — 5 placeholder cards while loading
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-40 shrink-0 rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-3 md:w-auto"
              >
                <div className="aspect-square w-full animate-pulse rounded-md bg-[var(--bg-deep)]" />
                <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-[var(--bg-deep)]" />
                <div className="mt-1 h-3 w-1/2 animate-pulse rounded bg-[var(--bg-deep)]" />
              </div>
            ))
          ) : (
            builders.map((b) => (
              <Link
                key={b.id}
                href={`/project/${b.id}`}
                className="group w-40 shrink-0 rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-3 transition hover:border-[var(--accent-indigo)] md:w-auto"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-md bg-[var(--bg-deep)]">
                  {b.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={b.thumbnail}
                      alt={b.title}
                      className="block h-full w-full object-cover transition group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl">
                      🎨
                    </div>
                  )}
                </div>
                <div className="mt-2 truncate text-sm font-semibold text-zinc-100">
                  {b.title}
                </div>
                <div className="mt-0.5 truncate font-mono text-[10px] text-zinc-500">
                  {b.creator}
                </div>
                <div className="mt-1.5 flex items-center gap-2 font-mono text-[10px] text-zinc-500">
                  <span>⬆ {b.upvotes}</span>
                  <span>· 👁 {b.views}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
