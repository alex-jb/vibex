"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import CountUp from "@/components/react-bits/CountUp";

/* ═══════════════════════════════════════════════════════════════════════════
   ForgeCounter — public social-proof strip on landing `/` mirroring the
   /home StatsStrip vocabulary so first-time PH visitors see the same
   momentum signal as logged-in users:

       15 HEROES FORGED · ▲ +1 THIS WEEK     |
       11 CREATORS SHIPPING · ▲ LIVE NOW      |  three tiles, big numbers,
       121.5K TOTAL PLAYS + SHARES · ▲ CLIMBING|  momentum chip per tile

   Pre-2026-04-25 the third tile showed "battles today" which read "0 TODAY"
   on quiet days — looked dead to PH visitors. Replaced with cumulative
   plays+upvotes+shares (always trending up). Format mirrors
   components/home/hq-chrome.tsx StatsStrip.

   Public read allowed on projects via RLS (migrations 001 + 027), so the
   anon-key supabase client is enough. We pull a thin slice of the projects
   table (id, plays, upvotes, views, shares, created_at) instead of three
   separate count queries because we need both total + weekly-delta + sum.
   ═══════════════════════════════════════════════════════════════════════════ */

const FORGE = "#F97316";
const CREAM = "#FFE27D";

type Counts = {
  forged: number;
  weeklyNew: number;
  creators: number;
  engagement: number;
};

// Previously formatted as "121K" / "5.2M"; replaced by CountUp with comma
// separator below. Kept here as a comment in case we want K/M back at scale.
// function formatCount(n: number): string { ... }

export function ForgeCounter({ delay = 5.0 }: { delay?: number }) {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const [projectsRes, creatorsRes] = await Promise.all([
          // Pull just the engagement columns we need + created_at for delta.
          // Capped at 5000 — enough for early-stage; if/when projects > 5K,
          // switch to a Postgres aggregate view.
          supabase
            .from("projects")
            .select("plays, upvotes, views, shares, created_at")
            .limit(5000),
          supabase.from("creators").select("*", { count: "exact", head: true }),
        ]);
        if (!alive) return;
        const rows: Array<{
          plays?: number | null;
          upvotes?: number | null;
          views?: number | null;
          shares?: number | null;
          created_at?: string | null;
        }> = projectsRes.data ?? [];
        const forged = rows.length;
        const weeklyNew = rows.filter(
          (r) => r.created_at && new Date(r.created_at) >= weekAgo,
        ).length;
        const engagement = rows.reduce(
          (sum, r) =>
            sum +
            (r.plays ?? 0) +
            (r.upvotes ?? 0) +
            (r.views ?? 0) +
            (r.shares ?? 0),
          0,
        );
        const creators = creatorsRes.count ?? 0;
        setCounts({ forged, weeklyNew, creators, engagement });
      } catch {
        // Silent fail — strip just doesn't render. Better than spamming console.
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Hide entirely until first forge — avoids a "0 · 0 · 0" strip on a
  // truly empty deploy. Once any project exists, the strip renders.
  if (!counts) return null;
  if (counts.forged === 0 && counts.creators === 0) return null;

  const tiles = [
    {
      num: counts.forged,
      label: "HEROES FORGED",
      delta:
        counts.weeklyNew > 0 ? `▲ +${counts.weeklyNew} THIS WEEK` : "· STANDING BY",
    },
    {
      num: counts.creators,
      label: "CREATORS SHIPPING",
      delta: counts.creators > 0 ? "▲ LIVE NOW" : "· WAITING FOR FIRST DROP",
    },
    {
      num: counts.engagement,
      label: "TOTAL PLAYS + SHARES",
      delta: counts.engagement > 0 ? "▲ CLIMBING" : "· NEW ARENA",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-wrap items-center justify-center mb-5 gap-x-5 gap-y-2"
      style={{
        fontFamily: "var(--font-press-start), monospace",
        color: CREAM,
        textShadow: `0 0 6px ${FORGE}AA, 1px 1px 0 #000`,
      }}
      aria-label={`${counts.forged} heroes forged, ${counts.creators} creators shipping, ${counts.engagement} total plays and shares`}
    >
      {tiles.map((tile, i) => (
        <span key={tile.label} className="flex items-baseline gap-2">
          {i > 0 ? (
            <span aria-hidden style={{ color: `${FORGE}66`, fontSize: 9 }}>
              ·
            </span>
          ) : null}
          {/* CountUp from react-bits — animates 0 → tile.num on first scroll
              into view. Comma separator beats K/M at our scale (raw "121,500"
              psychologically > "121K"). className passes through so the
              FORGE color + glow + tracking match the previous static render. */}
          <CountUp
            to={tile.num}
            duration={1.6}
            separator=","
            className="forge-counter-num"
          />
          <style jsx>{`
            :global(.forge-counter-num) {
              color: ${FORGE};
              font-size: 11px;
              text-shadow: 0 0 8px ${FORGE}, 1px 1px 0 #000;
              letter-spacing: 1px;
            }
          `}</style>
          <span style={{ fontSize: 9, letterSpacing: 2 }}>{tile.label}</span>
          <span
            aria-hidden
            style={{
              fontSize: 8,
              color: `${CREAM}99`,
              letterSpacing: 1.5,
            }}
          >
            {tile.delta}
          </span>
        </span>
      ))}
    </motion.div>
  );
}
