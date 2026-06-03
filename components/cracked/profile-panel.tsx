"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const TIER_EMOJI: Record<string, string> = {
  mythic: "👑",
  cracked: "⚡",
  solid: "💪",
  rising: "🌱",
  starting: "🥚",
};

interface Summary {
  handle: string;
  overall: number;
  tier: string;
  rank: number;
  total: number;
}

function extractHandle(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const m = raw.match(/github\.com\/([^/?#]+)/i);
  if (m) return m[1].trim();
  const clean = raw.replace(/^@/, "").trim();
  return /^[\w-]{1,39}$/.test(clean) ? clean : null;
}

export function CrackedProfilePanel({
  candidate,
  creatorHandle,
}: {
  candidate: string | null | undefined;
  creatorHandle: string;
}) {
  const handle = extractHandle(candidate);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    if (!handle) {
      setLoaded(true);
      return;
    }
    (async () => {
      const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!SUPA_URL || !SUPA_KEY) {
        if (active) setLoaded(true);
        return;
      }
      const supa = createClient(SUPA_URL, SUPA_KEY);
      const { data } = await supa
        .from("cracked_scores")
        .select("github_handle, overall, tier")
        .eq("github_handle", handle.toLowerCase())
        .maybeSingle();
      if (!active) return;
      if (!data) {
        setLoaded(true);
        return;
      }
      const [{ count: ahead }, { count: total }] = await Promise.all([
        supa.from("cracked_scores").select("*", { count: "exact", head: true }).gt("overall", data.overall as number),
        supa.from("cracked_scores").select("*", { count: "exact", head: true }),
      ]);
      if (!active) return;
      setSummary({
        handle: data.github_handle as string,
        overall: data.overall as number,
        tier: data.tier as string,
        rank: (ahead ?? 0) + 1,
        total: total ?? 0,
      });
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, [handle]);

  if (!loaded || !handle) return null;

  if (!summary) {
    return (
      <Link
        href={`/cracked/${handle}?as=${creatorHandle}`}
        className="mb-6 block rounded-2xl bg-orange-500/5 p-5 ring-1 ring-orange-500/20 hover:bg-orange-500/10"
      >
        <p className="text-xs uppercase tracking-widest text-orange-400">
          🧠 Get this dev&rsquo;s Cracked Score
        </p>
        <p className="mt-2 text-sm text-zinc-300">
          Score @{handle} on the 12-axis dev profile. +40 to Creator Score.
        </p>
        <p className="mt-2 text-xs text-orange-400">Score now →</p>
      </Link>
    );
  }

  return (
    <Link
      href={`/cracked/${summary.handle}?as=${creatorHandle}`}
      className="mb-6 block rounded-2xl bg-zinc-900/60 p-5 ring-1 ring-zinc-800 hover:ring-orange-500/40"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-orange-400">
            🧠 Cracked Score
          </p>
          <p className="mt-2 text-3xl font-bold text-zinc-100">
            {summary.overall}
            <span className="text-base text-zinc-500"> / 100</span>
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {TIER_EMOJI[summary.tier] || ""} {summary.tier} · Rank #{summary.rank} of {summary.total}
          </p>
        </div>
        <span className="text-sm text-orange-400">View →</span>
      </div>
    </Link>
  );
}
