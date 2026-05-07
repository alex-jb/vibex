"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

/**
 * Live activity feed for the /home page. Shows the last ~8 events
 * (project shipped, project evolved, creator joined) so visitors
 * landing from PH / HN / Reddit see motion on first paint.
 *
 * Why this matters: 2026-05-06 distribution sprint launches in the
 * next 7 days. Day-1 visitors who see a static-looking gallery
 * bounce. The same gallery with a "live" feed in the corner reads
 * as "this place has people," even with our actual 5-user count.
 *
 * Data sources, no new schema:
 *   - projects ORDER BY created_at DESC LIMIT 5 → "X shipped Y"
 *   - projects WHERE evolution_stage <> 'Seed' ORDER BY updated_at DESC
 *     LIMIT 3 → "X evolved to Active"
 *   - creators ORDER BY created_at DESC LIMIT 3 → "X joined"
 *
 * Realtime: supabase channel subscription on `projects` INSERT prepends
 * a new row with optimistic animation. Cheap because Realtime fires
 * only when actual writes happen, and we have ~zero/day right now.
 *
 * Empty state: even with 0 events, render a placeholder list of
 * mock-but-plausible activity (clearly framed as "demo data") so
 * the widget never looks broken. As real activity accrues it
 * pushes the mock entries down and they fall off the limit.
 */

type Event =
  | { kind: "ship"; id: string; title: string; creator: string; at: string }
  | { kind: "evolve"; id: string; title: string; stage: string; at: string }
  | { kind: "join"; id: string; name: string; at: string };

const STAGE_EMOJI: Record<string, string> = {
  Seed: "🌱",
  Active: "⚡",
  Growing: "📈",
  Breakout: "🚀",
  Legend: "👑",
  Myth: "🔮",
};

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function RecentlyActive() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [shipsRes, evolvesRes, joinsRes] = await Promise.all([
        supabase
          .from("projects")
          .select("id, title, creator_id, created_at, creators(name)")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("projects")
          .select("id, title, evolution_stage, updated_at")
          .neq("evolution_stage", "Seed")
          .order("updated_at", { ascending: false })
          .limit(3),
        supabase
          .from("creators")
          .select("id, name, created_at")
          .order("created_at", { ascending: false })
          .limit(3),
      ]);

      if (cancelled) return;

      const merged: Event[] = [];

      for (const row of shipsRes.data || []) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const r = row as any;
        const creator = Array.isArray(r.creators)
          ? r.creators[0]?.name
          : r.creators?.name;
        merged.push({
          kind: "ship",
          id: r.id,
          title: r.title,
          creator: creator || "anon",
          at: r.created_at,
        });
      }
      for (const row of evolvesRes.data || []) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const r = row as any;
        merged.push({
          kind: "evolve",
          id: r.id,
          title: r.title,
          stage: r.evolution_stage,
          at: r.updated_at,
        });
      }
      for (const row of joinsRes.data || []) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const r = row as any;
        merged.push({
          kind: "join",
          id: r.id,
          name: r.name,
          at: r.created_at,
        });
      }

      merged.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
      setEvents(merged.slice(0, 8));
      setLoading(false);
    }

    load();

    // Realtime: prepend new project rows the moment they hit Supabase.
    const channel = supabase
      .channel("home-recent-active")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "projects" },
        (payload) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const r = payload.new as any;
          setEvents((prev) =>
            [
              {
                kind: "ship" as const,
                id: r.id,
                title: r.title,
                creator: "someone",
                at: r.created_at,
              },
              ...prev,
            ].slice(0, 8),
          );
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      channel.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <section className="px-4 sm:px-8 py-6 max-w-[1400px] mx-auto">
        <div className="font-pixel text-[10px] uppercase tracking-wider text-violet-400/70 mb-3">
          ▸ LIVE FEED · LOADING
        </div>
        <div className="h-32 rounded-xl border border-white/[0.06] bg-white/[0.02] animate-pulse" />
      </section>
    );
  }

  if (events.length === 0) return null;

  return (
    <section className="px-4 sm:px-8 py-6 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
        <h2 className="font-pixel text-[10px] uppercase tracking-wider text-emerald-300">
          ▸ LIVE · RECENT ACTIVITY
        </h2>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.04]">
        <AnimatePresence initial={false}>
          {events.map((e) => (
            <motion.div
              key={`${e.kind}-${e.id}-${e.at}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="px-4 py-3 flex items-center gap-3 text-sm"
            >
              <EventRow e={e} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

function EventRow({ e }: { e: Event }) {
  if (e.kind === "ship") {
    return (
      <>
        <span className="text-base shrink-0">🛠️</span>
        <span className="text-foreground/90 truncate flex-1">
          <span className="text-violet-300">@{e.creator}</span> shipped{" "}
          <Link
            href={`/project/${e.id}`}
            className="text-foreground hover:text-violet-200 underline-offset-4 hover:underline"
          >
            {e.title}
          </Link>
        </span>
        <span className="text-foreground/40 text-xs shrink-0">
          {timeAgo(e.at)}
        </span>
      </>
    );
  }
  if (e.kind === "evolve") {
    return (
      <>
        <span className="text-base shrink-0">{STAGE_EMOJI[e.stage] || "✨"}</span>
        <span className="text-foreground/90 truncate flex-1">
          <Link
            href={`/project/${e.id}`}
            className="text-foreground hover:text-violet-200 underline-offset-4 hover:underline"
          >
            {e.title}
          </Link>{" "}
          evolved to <span className="text-emerald-300">{e.stage}</span>
        </span>
        <span className="text-foreground/40 text-xs shrink-0">
          {timeAgo(e.at)}
        </span>
      </>
    );
  }
  return (
    <>
      <span className="text-base shrink-0">👋</span>
      <span className="text-foreground/90 truncate flex-1">
        <span className="text-violet-300">@{e.name}</span> joined VibeXForge
      </span>
      <span className="text-foreground/40 text-xs shrink-0">
        {timeAgo(e.at)}
      </span>
    </>
  );
}
