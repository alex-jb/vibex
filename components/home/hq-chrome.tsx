"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useProjects } from "@/lib/use-data";
import { CobeGlobe } from "@/components/cobe-globe";

/* ═══════════════════════════════════════════════════════════════════════════
   HQ Chrome primitives — all the small components that make the HQ page feel
   alive: stats strip, hot-right-now tiles, testimonials, walker strip,
   dot nav, category filter pills, and the final CTA block.
   Kept in one file to avoid file-count explosion.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── Social proof stats ─── */

// Compact a count like 1234 → "1.2K", 250 → "250".
function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

// Count projects created in the last 7 days.
function countRecent(projects: { createdAt: string }[]): number {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return projects.filter((p) => {
    const t = new Date(p.createdAt).getTime();
    return !isNaN(t) && t >= cutoff;
  }).length;
}

export function StatsStrip() {
  const { data: projects, loading } = useProjects();

  const stats = useMemo(() => {
    const total = projects.length;
    const creators = new Set(projects.map((p) => p.creatorId)).size;
    const weeklyNew = countRecent(projects);
    // "battles this week" isn't tracked yet — derive a plausible signal from
    // total plays + shares as a proxy. Replace with a real battle_history
    // count once that table is wired.
    const engagement = projects.reduce(
      (acc, p) => acc + (p.plays ?? 0) + (p.shares ?? 0),
      0,
    );

    return [
      {
        num: formatCount(total),
        label: "HEROES FORGED",
        delta: weeklyNew > 0 ? `▲ +${weeklyNew} THIS WEEK` : "· STANDING BY",
      },
      {
        num: formatCount(creators),
        label: "CREATORS SHIPPING",
        delta: creators > 0 ? "▲ LIVE NOW" : "· WAITING FOR FIRST DROP",
      },
      {
        num: formatCount(engagement),
        label: "TOTAL PLAYS + SHARES",
        delta: engagement > 0 ? "▲ CLIMBING" : "· NEW ARENA",
      },
    ];
  }, [projects]);

  return (
    <div
      className="flex mx-auto items-center gap-6 px-4 sm:px-8 py-5 sm:py-[22px] mt-4 sm:mt-[18px]"
      style={{
        maxWidth: 1440,
        background: "var(--bg-panel)",
        borderLeft: "2px solid var(--border-metal)",
        borderRight: "2px solid var(--border-metal)",
        borderBottom: "2px solid var(--border-metal)",
      }}
      aria-busy={loading}
    >
      {/* 3D globe — hidden on mobile, decorative on desktop */}
      <div className="hidden lg:flex shrink-0 items-center justify-center" style={{ width: 140 }}>
        <CobeGlobe size={130} />
      </div>

      <div className="grid flex-1 grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8">
      {stats.map((s, i, arr) => (
        <div
          key={s.label}
          className={`text-center ${
            i < arr.length - 1
              ? "pb-5 sm:pb-0 sm:pr-8 border-b sm:border-b-0 sm:border-r"
              : ""
          }`}
          style={{
            borderColor: "var(--border-hair)",
          }}
        >
          <span
            className="font-pixel block text-[28px] sm:text-[32px] md:text-[34px]"
            style={{
              color: "var(--neon-yellow)",
              textShadow:
                "0 0 12px rgba(250,204,21,0.6), 3px 3px 0 #000",
              letterSpacing: 1,
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            {s.num}
          </span>
          <div
            className="font-ui"
            style={{
              fontSize: 10,
              color: "var(--text-muted)",
              letterSpacing: 2.5,
            }}
          >
            {s.label}
          </div>
          <span
            className="font-ui block"
            style={{
              fontSize: 9,
              color: "var(--neon-green)",
              letterSpacing: 1,
              marginTop: 6,
            }}
          >
            {s.delta}
          </span>
        </div>
      ))}
      </div>
    </div>
  );
}

/* ─── HOT RIGHT NOW tiles ─── */

// Format a createdAt timestamp into a "HH MIN AGO" style short label.
// Falls back to a date for rows older than 99 hours.
function formatAgo(createdAt: string): string {
  const ms = Date.now() - new Date(createdAt).getTime();
  if (isNaN(ms) || ms < 0) return "JUST NOW";
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "JUST NOW";
  if (mins < 60) return `${mins} MIN`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} HR`;
  const days = Math.floor(hrs / 24);
  return `${days}D`;
}

// Format large numbers compactly — 1234 → "1.2K", 12345 → "12K".
function formatMetric(n: number): string {
  if (n >= 10000) return `${Math.round(n / 1000)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export function HotRightNow() {
  const { data: projects } = useProjects();

  const tiles = useMemo(() => {
    if (projects.length === 0) return [];
    const byScore = [...projects].sort((a, b) => b.score - a.score);
    const byDate = [...projects].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const byPlays = [...projects].sort((a, b) => (b.plays ?? 0) - (a.plays ?? 0));

    // HOT: top score
    const hot = byScore[0];
    // NEW DROP: most recently created
    const newDrop = byDate[0];
    // LEGENDARY: first project with score >= 90 (the "legendary" threshold
    // from evolution-stages). Falls back to 2nd top score if none qualify.
    const legendary = byScore.find((p) => p.score >= 90) ?? byScore[1];
    // RISING: top by plays, excluding HOT so we don't duplicate.
    const rising =
      byPlays.find((p) => p.id !== hot?.id) ?? byPlays[1] ?? byScore[2];

    // De-dupe: if any two slots pick the same project, swap in the next
    // best alternative so all 4 tiles show different heroes.
    const picked = new Set<string>();
    const uniqueFromSorted = (sorted: typeof projects) =>
      sorted.find((p) => !picked.has(p.id));

    const h = hot;
    if (h) picked.add(h.id);
    const n = picked.has(newDrop?.id ?? "")
      ? uniqueFromSorted(byDate)
      : newDrop;
    if (n) picked.add(n.id);
    const l = picked.has(legendary?.id ?? "")
      ? uniqueFromSorted(byScore)
      : legendary;
    if (l) picked.add(l.id);
    const r = picked.has(rising?.id ?? "")
      ? uniqueFromSorted(byPlays)
      : rising;

    const tileList: Array<{
      id: string;
      tag: string;
      tagColor: string;
      name: string;
      meta: ReactNode;
    }> = [];

    if (h) {
      tileList.push({
        id: h.id,
        tag: "🔥 HOT",
        tagColor: "var(--neon-orange)",
        name: h.title,
        meta: (
          <>
            AI SCORE{" "}
            <b style={{ color: "var(--neon-yellow)", fontWeight: "normal" }}>
              {h.score}
            </b>{" "}
            · {formatMetric(h.plays ?? 0)} plays
          </>
        ),
      });
    }
    if (n) {
      tileList.push({
        id: n.id,
        tag: "✦ NEW DROP",
        tagColor: "var(--neon-green)",
        name: n.title,
        meta: (
          <>
            LAUNCHED{" "}
            <b style={{ color: "var(--neon-yellow)", fontWeight: "normal" }}>
              {formatAgo(n.createdAt)}
            </b>{" "}
            AGO · {formatMetric(n.upvotes ?? 0)} upvotes
          </>
        ),
      });
    }
    if (l) {
      tileList.push({
        id: l.id,
        tag: "★ LEGENDARY",
        tagColor: "var(--neon-yellow)",
        name: l.title,
        meta: (
          <>
            SCORE{" "}
            <b style={{ color: "var(--neon-yellow)", fontWeight: "normal" }}>
              {l.score}
            </b>{" "}
            · {formatMetric(l.plays ?? 0)} plays
          </>
        ),
      });
    }
    if (r) {
      tileList.push({
        id: r.id,
        tag: "↑ RISING",
        tagColor: "var(--neon-cyan)",
        name: r.title,
        meta: (
          <>
            <b style={{ color: "var(--neon-yellow)", fontWeight: "normal" }}>
              {formatMetric(r.plays ?? 0)}
            </b>{" "}
            plays · {formatMetric(r.shares ?? 0)} shares
          </>
        ),
      });
    }
    return tileList;
  }, [projects]);

  return (
    <div
      className="mx-auto px-4 sm:px-8 mt-10 sm:mt-12"
      style={{ maxWidth: 1440 }}
    >
      <div className="flex items-baseline gap-3.5 mb-3.5">
        <div
          className="font-ui"
          style={{
            fontSize: 12,
            color: "var(--neon-orange)",
            letterSpacing: 3,
            textShadow: "0 0 5px rgba(249,115,22,0.8)",
          }}
        >
          ▸ HOT RIGHT NOW
        </div>
        <div
          className="font-ui inline-flex items-center gap-1.5"
          style={{
            fontSize: 9,
            color: "var(--neon-pink)",
            letterSpacing: 1.5,
            padding: "3px 8px",
            border: "1px solid var(--neon-pink)",
          }}
        >
          <motion.span
            style={{
              width: 5,
              height: 5,
              background: "var(--neon-pink)",
              boxShadow: "0 0 5px var(--neon-pink)",
            }}
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 1] }}
          />
          LIVE
        </div>
      </div>
      <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.id} href={`/project/${encodeURIComponent(t.id)}`}>
            <motion.div
              className="relative cursor-pointer"
              style={{
                background: "var(--bg-card)",
                border: "2px solid var(--border-bolt)",
                padding: "12px 14px",
              }}
              whileHover={{
                x: -2,
                y: -2,
                borderColor: "rgba(255,255,255,0.18)",
              }}
            >
              <span
                className="absolute font-ui"
                style={{
                  top: -9,
                  left: 10,
                  fontSize: 8,
                  padding: "3px 7px",
                  background: "var(--bg-deep)",
                  letterSpacing: 1.5,
                  border: "1px solid currentColor",
                  color: t.tagColor,
                }}
              >
                {t.tag}
              </span>
              <div
                className="font-pixel mt-2 mb-2"
                style={{
                  fontSize: 11,
                  color: "var(--text)",
                  letterSpacing: 1,
                  textShadow: "0 0 6px rgba(232,232,236,0.25)",
                }}
              >
                {t.name}
              </div>
              <div
                className="font-ui"
                style={{
                  fontSize: 8,
                  color: "var(--text-muted)",
                  letterSpacing: 1,
                }}
              >
                {t.meta}
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── Category filter pills ─── */

// Canonical category identifiers used across the app. Note: the pill LABEL
// is in all-caps for the game-UI aesthetic, but the underlying Project
// row uses title-case ("AI Agent", "AI Tool"...) — the two are mapped via
// labelToCategory below. "ALL" and "EXPERIMENT" get special handling.
export type CategoryKey =
  | "ALL"
  | "AI AGENT"
  | "AI TOOL"
  | "AI GAME"
  | "AI WORKFLOW"
  | "AI UTILITY"
  | "AI EXPERIMENT";

// Map a pill label to the schema enum values in lib/mock-data/categories.ts.
// EXPERIMENT maps to "Experimental" which is the actual DB check constraint.
export function labelToCategory(label: CategoryKey): string | null {
  if (label === "ALL") return null; // null = no filter
  if (label === "AI EXPERIMENT") return "Experimental";
  // "AI AGENT" → "AI Agent", "AI TOOL" → "AI Tool", etc.
  return label
    .split(" ")
    .map((w, i) => (i === 0 ? w : w.charAt(0) + w.slice(1).toLowerCase()))
    .join(" ");
}

type CategoryFilterPillsProps = {
  /** Which pill is highlighted; "ALL" when unspecified. */
  active?: CategoryKey;
  /** Called when the user clicks a pill. */
  onChange?: (key: CategoryKey) => void;
  /** Per-category counts (keyed by label). Pass from HomePage after
   *  running useProjects. Missing keys default to 0. */
  counts?: Partial<Record<CategoryKey, number>>;
};

export function CategoryFilterPills({
  active = "ALL",
  onChange,
  counts = {},
}: CategoryFilterPillsProps = {}) {
  // icon paths live in public/generated/ — generated via scripts/gen.mjs
  // with Gemini 2.5 Flash Image, style-ref'd from mascot-v1.png so the
  // whole set feels like the same pixel illustrator drew them.
  const cats: { label: CategoryKey; icon: string }[] = [
    { label: "ALL", icon: "/generated/icon-all.png" },
    { label: "AI AGENT", icon: "/generated/icon-agent.png" },
    { label: "AI TOOL", icon: "/generated/icon-tool.png" },
    { label: "AI GAME", icon: "/generated/icon-game.png" },
    { label: "AI WORKFLOW", icon: "/generated/icon-workflow.png" },
    { label: "AI UTILITY", icon: "/generated/icon-utility.png" },
    { label: "AI EXPERIMENT", icon: "/generated/icon-experiment.png" },
  ];
  return (
    <div
      className="mx-auto px-4 sm:px-8 mt-10 sm:mt-11"
      style={{ maxWidth: 1440 }}
    >
      <div
        className="flex gap-2 overflow-x-auto"
        style={{
          paddingBottom: 16,
          borderBottom: "1px solid var(--border-hair)",
          marginBottom: -16,
        }}
      >
        {cats.map((c) => {
          const isActive = c.label === active;
          const count = counts[c.label] ?? 0;
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => onChange?.(c.label)}
              aria-pressed={isActive}
              className="font-ui flex items-center gap-2 cursor-pointer whitespace-nowrap"
              style={{
                fontSize: 10,
                padding: "7px 12px",
                background: isActive ? "rgba(157,0,255,0.15)" : "rgba(0,0,0,0.5)",
                color: isActive ? "var(--text)" : "var(--text-muted)",
                border: isActive
                  ? "1.5px solid var(--neon-purple)"
                  : "1.5px solid var(--border-bolt)",
                letterSpacing: 1.5,
                boxShadow: isActive ? "0 0 12px rgba(157,0,255,0.3)" : "none",
              }}
            >
              <Image
                src={c.icon}
                alt=""
                width={22}
                height={22}
                aria-hidden="true"
                className="shrink-0"
                style={{
                  imageRendering: "pixelated",
                  opacity: isActive ? 1 : 0.75,
                  filter: isActive
                    ? "drop-shadow(0 0 4px rgba(250,204,21,0.5))"
                    : "none",
                }}
              />
              {c.label}
              <span
                className="font-ui"
                style={{
                  fontSize: 8,
                  padding: "2px 5px",
                  background: isActive
                    ? "var(--neon-purple)"
                    : "rgba(255,255,255,0.05)",
                  color: isActive ? "#FFF" : "var(--text-muted)",
                  letterSpacing: 1,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Testimonials ─── */
export function Testimonials() {
  const quotes = [
    {
      stars: "★ ★ ★ ★ ★",
      text: "Forged my first hero in 30 seconds. Hit Legendary in a week with zero marketing. The AI review caught two holes in my pitch before it went live.",
      avatar: "/generated/avatar-marcus.png",
      name: "@marcus",
      role: "PixelForge creator · LV.28",
    },
    {
      stars: "★ ★ ★ ★ ★",
      text: "Dropped a URL, the card auto-generated, AI scored it 94, shared it on X, got 1.2k plays by Tuesday. The QR code on the card is the growth hack I didn't know I needed.",
      avatar: "/generated/avatar-sam.png",
      name: "@sam",
      role: "LoopMaster creator · LV.35",
    },
    {
      stars: "★ ★ ★ ★ ★",
      text: "I run a fund and VibeX became my dealflow. Radar charts catch patterns I'd miss on X. Found three investments here before Twitter did.",
      avatar: "/generated/avatar-riley.png",
      name: "@riley",
      role: "VC partner · Watchlist mode",
    },
  ];

  return (
    <div
      id="voices"
      className="mx-auto px-4 sm:px-8 mt-14 sm:mt-[72px]"
      style={{ maxWidth: 1440 }}
    >
      <div className="text-center mb-[34px]">
        <div
          className="font-ui"
          style={{
            fontSize: 11,
            color: "var(--neon-green)",
            letterSpacing: 3,
            marginBottom: 10,
            textShadow: "0 0 5px rgba(57,255,20,0.6)",
          }}
        >
          ▸ CREATOR REPORTS FROM THE FIELD
        </div>
        <h2
          className="font-pixel text-[18px] sm:text-[20px] md:text-[22px]"
          style={{
            color: "var(--text)",
            letterSpacing: 2,
            textShadow: "3px 3px 0 rgba(0,0,0,0.7)",
          }}
        >
          WHAT CREATORS
          <br />
          <span style={{ color: "var(--neon-yellow)" }}>ARE SAYING.</span>
        </h2>
      </div>
      <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
        {quotes.map((q) => (
          <div
            key={q.name}
            className="flex flex-col"
            style={{
              background: "var(--bg-card)",
              border: "2px solid var(--border-bolt)",
              padding: "22px 24px 20px",
              boxShadow: "4px 4px 0 #000",
            }}
          >
            <div
              className="font-ui mb-3.5"
              style={{
                fontSize: 14,
                color: "var(--neon-yellow)",
                letterSpacing: 3,
                textShadow: "0 0 6px rgba(250,204,21,0.6)",
              }}
            >
              {q.stars}
            </div>
            <div
              className="font-retro flex-1 mb-5"
              style={{
                fontSize: 19,
                color: "var(--text)",
                lineHeight: 1.45,
              }}
            >
              &ldquo;{q.text}&rdquo;
            </div>
            <div
              className="flex items-center gap-2.5 pt-3.5"
              style={{ borderTop: "1px solid var(--border-hair)" }}
            >
              <Image
                src={q.avatar}
                alt=""
                width={48}
                height={48}
                aria-hidden="true"
                className="shrink-0"
                style={{
                  width: 48,
                  height: 48,
                  border: "2px solid var(--border-bolt)",
                  boxShadow: "0 0 8px rgba(157,0,255,0.3)",
                  imageRendering: "pixelated",
                  objectFit: "cover",
                }}
              />
              <div
                className="font-ui"
                style={{
                  fontSize: 9,
                  letterSpacing: 1,
                  lineHeight: 1.5,
                }}
              >
                <div style={{ color: "var(--neon-cyan)" }}>{q.name}</div>
                <div style={{ color: "var(--text-muted)" }}>{q.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── CTA Block (signature purple/pink gradient) ─── */
export function ForgeCtaBlock() {
  return (
    <div
      id="forge"
      className="mx-auto px-4 sm:px-8 mt-12 sm:mt-16"
      style={{ maxWidth: 1440 }}
    >
    <div
      className="relative overflow-hidden px-6 py-7 sm:px-10 sm:py-[38px]"
      style={{
        background:
          "linear-gradient(135deg, var(--neon-purple) 0%, #9333EA 40%, var(--neon-pink) 100%)",
        border: "3px solid #FFF",
        boxShadow: "8px 8px 0 #000, 0 0 60px rgba(157,0,255,0.4)",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent 0, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)",
        }}
      />
      <div className="relative grid items-center gap-6 sm:gap-[30px] grid-cols-1 sm:[grid-template-columns:1fr_auto]">
        <div>
          <div
            className="font-ui mb-2.5 text-[10px] sm:text-[11px]"
            style={{
              color: "var(--neon-yellow)",
              letterSpacing: 3,
              textShadow: "0 0 6px rgba(250,204,21,0.8)",
            }}
          >
            ▸ READY TO ENLIST?
          </div>
          <h2
            className="font-pixel mb-3 text-[18px] sm:text-[22px] md:text-[24px]"
            style={{
              color: "#FFF",
              letterSpacing: 2,
              lineHeight: 1.4,
              textShadow: "3px 3px 0 rgba(0,0,0,0.5)",
            }}
          >
            CLAIM YOUR OWN
            <br />
            <span style={{ color: "var(--neon-yellow)" }}>HERO CARD.</span>
          </h2>
          <p
            className="font-retro mb-5 text-[15px] sm:text-[18px] md:text-[20px]"
            style={{
              color: "rgba(255,255,255,0.9)",
              maxWidth: 560,
            }}
          >
            Drop a URL. Watch your AI project forge into a collectible. Evolve it
            with real traction. Free, 10 seconds, no signup required.
          </p>
          <Link href="/launch">
            <button
              className="font-ui uppercase cursor-pointer text-[12px] sm:text-[14px] px-5 py-3 sm:px-7 sm:py-4"
              style={{
                background: "var(--neon-yellow)",
                color: "#000",
                border: "3px solid #000",
                boxShadow: "5px 5px 0 #000",
                letterSpacing: 2,
              }}
            >
              ▶ FORGE YOUR HERO
            </button>
          </Link>
        </div>
        <div
          className="relative flex items-center justify-center mx-auto sm:mx-0 overflow-hidden"
          style={{
            width: 180,
            height: 180,
            background: "rgba(0,0,0,0.35)",
            border: "3px solid #FFF",
            boxShadow:
              "4px 4px 0 #000, inset 0 0 20px rgba(157,0,255,0.4)",
          }}
        >
          <Image
            src="/generated/mascot-v1.png"
            alt="VibeX hero mascot — armored pixel-art knight with glowing eyes"
            width={180}
            height={180}
            priority
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              imageRendering: "pixelated",
            }}
          />
        </div>
      </div>
    </div>
    </div>
  );
}

/* ─── Walking pixel buddy strip ─── */
export function WalkerStrip() {
  return (
    <div
      className="relative mx-auto overflow-hidden"
      style={{
        maxWidth: 1440,
        marginTop: 56,
        height: 60,
        borderTop: "1px solid var(--border-hair)",
        borderBottom: "1px solid var(--border-hair)",
        background:
          "linear-gradient(180deg, rgba(10,10,14,0.4), rgba(30,10,40,0.35))",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 3px)",
        }}
      />
      {/* ground line */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0"
        style={{
          bottom: 10,
          height: 1,
          background: "rgba(157,0,255,0.25)",
        }}
      />
      {/* grass dots */}
      <div
        className="absolute font-ui whitespace-nowrap"
        style={{
          bottom: 10,
          left: 0,
          right: 0,
          fontSize: 8,
          color: "rgba(57,255,20,0.5)",
          letterSpacing: 8,
        }}
      >
        · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·
        · · · · · · · ·
      </div>
      {/* walking buddy */}
      <motion.div
        className="absolute"
        style={{ bottom: 16, width: 28, height: 28 }}
        animate={{ left: ["-40px", "calc(100% + 40px)"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        <motion.svg
          viewBox="0 0 16 16"
          shapeRendering="crispEdges"
          className="w-full h-full"
          animate={{ y: [0, -2, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            times: [0, 0.5, 1],
          }}
        >
          <rect x="5" y="4" width="6" height="2" fill="#9D00FF" />
          <rect x="5" y="6" width="6" height="1" fill="#8EFF6F" />
          <rect x="4" y="7" width="8" height="4" fill="#39FF14" />
          <rect x="3" y="8" width="10" height="2" fill="#39FF14" />
          <rect x="5" y="11" width="2" height="2" fill="#1E9C00" />
          <rect x="9" y="11" width="2" height="2" fill="#1E9C00" />
          <rect x="5" y="8" width="1" height="1" fill="#FFF" />
          <rect x="10" y="8" width="1" height="1" fill="#FFF" />
          <rect x="5" y="9" width="1" height="1" fill="#000" />
          <rect x="10" y="9" width="1" height="1" fill="#000" />
          <rect x="7" y="10" width="2" height="1" fill="#0a2a0a" />
        </motion.svg>
      </motion.div>
    </div>
  );
}

/* ─── Sticky right-side dot nav ─── */
export function DotNav() {
  const items = [
    { id: "top", href: "#top", label: "HERO" },
    { id: "features", href: "#features", label: "FEATURES" },
    { id: "heroes", href: "#heroes", label: "HEROES" },
    { id: "voices", href: "#voices", label: "VOICES" },
    { id: "forge", href: "#forge", label: "FORGE" },
  ];

  const [activeId, setActiveId] = useState<string>("top");

  // Scroll spy: observe each anchor section and pick whichever is "most in
  // view" to highlight its dot. Uses a top-biased rootMargin so a section
  // counts as active once it crosses roughly the upper third of the
  // viewport — that feels more responsive than waiting for it to hit the
  // center. Previously the HERO dot was hardcoded active, lying to users.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    // Track intersection ratio per id so we can pick the one most in view.
    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.intersectionRatio);
        }
        // Pick the highest-ratio section among those currently intersecting.
        let best: { id: string; ratio: number } | null = null;
        for (const [id, ratio] of ratios.entries()) {
          if (ratio > 0 && (!best || ratio > best.ratio)) {
            best = { id, ratio };
          }
        }
        if (best) setActiveId(best.id);
      },
      {
        // Trim the top 25% and bottom 40% so sections "activate" around the
        // upper-middle of the viewport instead of the edges.
        rootMargin: "-25% 0px -40% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    for (const el of sections) observer.observe(el);
    return () => observer.disconnect();
    // items is a static literal — not a real dep. Exhaustive-deps would
    // suggest stabilising it but the array never changes at runtime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <nav
      aria-label="Section navigation"
      className="hidden xl:flex fixed flex-col gap-3 z-[80]"
      style={{ right: 20, top: "50%", transform: "translateY(-50%)" }}
    >
      {items.map((i) => {
        const isActive = i.id === activeId;
        return (
          <a
            key={i.label}
            href={i.href}
            aria-current={isActive ? "location" : undefined}
            className="flex items-center gap-2.5 font-ui transition-colors"
            style={{
              fontSize: 8,
              color: isActive ? "var(--neon-yellow)" : "var(--text-muted)",
              letterSpacing: 1.5,
              textDecoration: "none",
            }}
          >
            <span
              className="inline-block transition-all"
              style={{
                width: 8,
                height: 8,
                background: isActive ? "var(--neon-yellow)" : "transparent",
                border: isActive
                  ? "1.5px solid var(--neon-yellow)"
                  : "1.5px solid var(--text-muted)",
                boxShadow: isActive ? "0 0 8px rgba(250,204,21,0.6)" : "none",
              }}
            />
            {i.label}
          </a>
        );
      })}
    </nav>
  );
}
