"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

/* ═══════════════════════════════════════════════════════════════════════════
   ForgeCounter — live social-proof strip between the landing hero card and
   the headline. Queries projects/creators/battle_history counts at mount,
   renders a pixel-font line ("47 FORGED · 23 CREATORS · 3 TODAY") once
   the first two numbers arrive and forged ≥ 1 (avoids showing "0 FORGED"
   during a fresh deploy with no data).

   Public read is allowed on all three tables per the 2026 RLS policies
   (migrations 001 + 027), so anon key + ANON client is enough.
   ═══════════════════════════════════════════════════════════════════════════ */

const FORGE = "#FF4500";
const CREAM = "#FFE27D";

type Counts = { forged: number; creators: number; battles: number };

export function ForgeCounter({ delay = 5.0 }: { delay?: number }) {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const todayUtc = new Date();
        todayUtc.setUTCHours(0, 0, 0, 0);
        const [p, c, b] = await Promise.all([
          supabase.from("projects").select("*", { count: "exact", head: true }),
          supabase.from("creators").select("*", { count: "exact", head: true }),
          supabase
            .from("battle_history")
            .select("*", { count: "exact", head: true })
            .gte("created_at", todayUtc.toISOString()),
        ]);
        if (!alive) return;
        setCounts({
          forged: p.count ?? 0,
          creators: c.count ?? 0,
          battles: b.count ?? 0,
        });
      } catch {
        // Silent fail — landing page shouldn't break on a count error.
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Don't render embarrassing "0 FORGED" on an empty deploy — wait until
  // there's at least one project. Keeps landing clean pre-first-forge.
  if (!counts || counts.forged < 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-wrap items-center justify-center mb-5"
      style={{
        fontFamily: "var(--font-press-start), monospace",
        fontSize: 9,
        letterSpacing: 2.5,
        color: CREAM,
        textShadow: `0 0 6px ${FORGE}AA, 1px 1px 0 #000`,
        gap: 14,
      }}
      aria-label={`${counts.forged} projects forged, ${counts.creators} creators, ${counts.battles} battles today`}
    >
      <span>
        <span style={{ color: FORGE, textShadow: `0 0 6px ${FORGE}` }}>
          {counts.forged}
        </span>{" "}
        FORGED
      </span>
      <span aria-hidden style={{ color: `${FORGE}66` }}>
        ·
      </span>
      <span>
        <span style={{ color: FORGE, textShadow: `0 0 6px ${FORGE}` }}>
          {counts.creators}
        </span>{" "}
        CREATORS
      </span>
      <span aria-hidden style={{ color: `${FORGE}66` }}>
        ·
      </span>
      <span>
        <span style={{ color: FORGE, textShadow: `0 0 6px ${FORGE}` }}>
          {counts.battles}
        </span>{" "}
        TODAY
      </span>
    </motion.div>
  );
}
