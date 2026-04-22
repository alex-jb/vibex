"use client";

import { use, useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  ChevronUp,
  Trophy,
  Share2,
  Calendar,
  User,
} from "lucide-react";

import { useLang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useProjects } from "@/lib/use-data";
import type { AIReview, EvolutionStage } from "@/lib/types";
import { EVOLUTION_CONFIG } from "@/lib/rpg-utils";
import { HeroCard } from "@/components/home/hero-card";
import { projectsToCards } from "@/components/home/hero-card-grid";
import { FeedbackPanel } from "@/components/launch-feedback/feedback-panel";
import { Button } from "@/components/ui/button";
import PlayableDemo from "@/components/playable-demo";
import { HudBars } from "@/components/rpg/hud-bars";
import { ExpBar } from "@/components/rpg/exp-bar";
import { AttributeRadar } from "@/components/rpg/attribute-radar";
import { ShareModal } from "@/components/share-modal";
import { GrowthRadar } from "@/components/project/growth-radar";
import { ForkTree } from "@/components/project/fork-tree";
import { EvolutionProgress } from "@/components/project/evolution-progress";
import { EvolutionBurst, useEvolutionDetector } from "@/components/rpg/evolution-burst";
import { SkillTree } from "@/components/rpg/skill-tree";
import { ClassIcon } from "@/components/rpg/class-icon";
import { EvolutionBadge } from "@/components/rpg/evolution-badge";
import { RareCandyButton } from "@/components/rpg/rare-candy-button";
import { RealtimeChat } from "@/components/realtime-chat";
import { Swords } from "lucide-react";

function formatProjectDate(raw: string): string {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Deterministic 32-bit string hash (djb2-ish). Used for seeding stable
// shuffles that would otherwise use Math.random (impure during render).
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return h;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ═══════════════════════════════════════════════════════════════════════════
   AI Review Panel — Direction A: Character Sheet / Hero Stat Card
   Replaces the old ScoreBar + AIReviewPanel. Token discipline:
   purple primary (bars + quests), green supporting (Claude header /
   byline / combos), yellow compound score only, orange L-corners +
   hits-taken. No shadcn, no blur, no gradient fills. nes-overrides.css
   forces border-radius: 0 globally, so we don't set it here.
   Hi-fi source: claude.ai/design · Direction A (2026-04-19 mockup).
   ═══════════════════════════════════════════════════════════════════════════ */

/* ---------- L-corner brackets (orange, 4 per panel) ---------- */
function LCorner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const SIZE = 14;
  const col = "var(--neon-orange)";
  const base: React.CSSProperties = {
    position: "absolute",
    width: SIZE,
    height: SIZE,
    zIndex: 2,
    pointerEvents: "none",
  };
  const edges: Record<typeof pos, React.CSSProperties> = {
    tl: { top: -2, left: -2, borderTop: `3px solid ${col}`, borderLeft: `3px solid ${col}` },
    tr: { top: -2, right: -2, borderTop: `3px solid ${col}`, borderRight: `3px solid ${col}` },
    bl: { bottom: -2, left: -2, borderBottom: `3px solid ${col}`, borderLeft: `3px solid ${col}` },
    br: { bottom: -2, right: -2, borderBottom: `3px solid ${col}`, borderRight: `3px solid ${col}` },
  };
  return <div style={{ ...base, ...edges[pos] }} aria-hidden="true" />;
}

/* ---------- Tiny 5×5 pixel "C" — decorative Claude sigil ---------- */
function ClaudeSigil({ color = "var(--neon-green)" }: { color?: string }) {
  const grid = [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ];
  return (
    <div
      aria-hidden="true"
      style={{
        width: 15,
        height: 15,
        display: "grid",
        gridTemplateColumns: "repeat(5, 3px)",
        gridTemplateRows: "repeat(5, 3px)",
        flexShrink: 0,
      }}
    >
      {grid.flat().map((on, i) => (
        <div key={i} style={{ width: 3, height: 3, background: on ? color : "transparent" }} />
      ))}
    </div>
  );
}

/* ---------- Pixel bar (solid purple fill, no gradient) ---------- */
function PixelBar({ value, animate, delay = 0 }: { value: number; animate: boolean; delay?: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        height: 10,
        background: "var(--bg-deep)",
        border: "1px solid var(--border-hair)",
        boxShadow: "inset 0 0 0 1px #000",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: animate ? `${v}%` : 0 }}
        transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
        style={{
          height: "100%",
          background: "var(--neon-purple)",
          boxShadow: "2px 0 0 #000",
          position: "relative",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(90deg, transparent 0 4px, rgba(0,0,0,0.28) 4px 6px)",
          }}
        />
      </motion.div>
    </div>
  );
}

/* ---------- Attribute row ---------- */
function AttrRow({
  code,
  label,
  value,
  index,
  inView,
  forging = false,
}: {
  code: string;
  label: string;
  value: number;
  index: number;
  inView: boolean;
  forging?: boolean;
}) {
  const delay = forging ? 1.8 + index * 0.25 : index * 0.06;
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : -6 }}
      transition={{ delay, duration: 0.35 }}
      style={{
        display: "grid",
        gridTemplateColumns: "52px 1fr 34px",
        alignItems: "center",
        columnGap: 12,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span
          className="font-ui"
          style={{ fontSize: 14, color: "var(--neon-purple)", letterSpacing: 1, lineHeight: 1 }}
        >
          {code}
        </span>
        <span
          className="font-ui"
          style={{ fontSize: 8, color: "var(--text-muted)", letterSpacing: 0.5, lineHeight: 1.2 }}
        >
          {label}
        </span>
      </div>
      <PixelBar value={value} animate={inView} delay={delay} />
      <span
        className="font-pixel"
        style={{
          fontSize: 12,
          color: "var(--neon-purple)",
          textAlign: "right",
          textShadow: "0 0 6px rgba(157,0,255,0.5)",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
    </motion.div>
  );
}

/* ---------- Evolution sigil (large square; pairs with EvolutionBadge pill) ---------- */
function EvoSigil({ stage, forging = false }: { stage: EvolutionStage; forging?: boolean }) {
  const cfg = EVOLUTION_CONFIG[stage];
  const spriteIndex: Record<EvolutionStage, string> = {
    Seed: "1-seed",
    Active: "2-active",
    Growing: "3-growing",
    Breakout: "4-breakout",
    Legend: "5-legend",
    Myth: "6-myth",
  };
  // Forge unveil: frame color + glow + corner dots + sprite filter all start as
  // Seed grey (#d4d4d8) and animate to the real stage color over 1.2s.
  const SEED = "#d4d4d8";
  return (
    <motion.div
      initial={forging ? { borderColor: SEED, boxShadow: `4px 4px 0 #000, 0 0 12px ${SEED}66` } : false}
      animate={{
        borderColor: cfg.color,
        boxShadow: `4px 4px 0 #000, 0 0 24px ${cfg.color}66`,
      }}
      transition={{ duration: 1.2, delay: forging ? 0.6 : 0, ease: [0.22, 1, 0.36, 1] }}
      style={{
        width: 96,
        height: 96,
        flexShrink: 0,
        background: "var(--bg-deep)",
        borderWidth: 3,
        borderStyle: "solid",
        position: "relative",
        display: "grid",
        placeItems: "center",
      }}
    >
      {(["tl", "tr", "bl", "br"] as const).map((p) => (
        <motion.div
          key={p}
          aria-hidden="true"
          initial={forging ? { background: SEED } : false}
          animate={{ background: cfg.color }}
          transition={{ duration: 1.2, delay: forging ? 0.6 : 0 }}
          style={{
            position: "absolute",
            width: 6,
            height: 6,
            top: p.startsWith("t") ? 2 : "auto",
            bottom: p.startsWith("b") ? 2 : "auto",
            left: p.endsWith("l") ? 2 : "auto",
            right: p.endsWith("r") ? 2 : "auto",
          }}
        />
      ))}
      <motion.div
        initial={forging ? { filter: `drop-shadow(0 0 10px ${SEED}99)` } : false}
        animate={{ filter: `drop-shadow(0 0 10px ${cfg.color}99)` }}
        transition={{ duration: 1.2, delay: forging ? 0.6 : 0 }}
      >
        <Image
          src={`/generated/evo-${spriteIndex[stage]}.png`}
          alt=""
          width={72}
          height={72}
          unoptimized
          style={{ imageRendering: "pixelated" }}
        />
      </motion.div>
    </motion.div>
  );
}

/* ---------- Stars (1–5 by stage ordinal; Myth shows 5 filled) ---------- */
const STAGE_ORDINAL: Record<EvolutionStage, number> = {
  Seed: 1,
  Active: 2,
  Growing: 3,
  Breakout: 4,
  Legend: 5,
  Myth: 5,
};

/* ---------- Battle-log column ---------- */
function LogColumn({
  glyph,
  label,
  items,
  color,
  itemAttrs,
}: {
  glyph: string;
  label: string;
  items: string[];
  color: string;
  itemAttrs?: (i: number) => React.LiHTMLAttributes<HTMLLIElement>;
}) {
  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <span
          className="font-ui"
          style={{ fontSize: 10, letterSpacing: 2, color, textTransform: "uppercase" }}
        >
          <span style={{ marginRight: 6, fontFamily: "Menlo, Monaco, monospace" }}>{glyph}</span>
          {label}
        </span>
        <span
          className="font-pixel"
          style={{
            marginLeft: "auto",
            fontSize: 8,
            color,
            border: `2px solid ${color}`,
            padding: "3px 6px",
            background: "var(--bg-deep)",
            lineHeight: 1,
          }}
        >
          {items.length.toString().padStart(2, "0")}
        </span>
      </div>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {items.map((it, i) => (
          <li
            key={i}
            {...(itemAttrs ? itemAttrs(i) : {})}
            className="font-retro"
            style={{
              fontSize: 16,
              lineHeight: 1.4,
              color: "#c8c8d4",
              display: "flex",
              gap: 8,
            }}
          >
            <span
              className="font-ui"
              style={{
                color,
                fontSize: 12,
                flexShrink: 0,
                lineHeight: 1.5,
                fontFamily: "Menlo, Monaco, monospace",
              }}
              aria-hidden="true"
            >
              {glyph}
            </span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- AI Review Panel ---------- */
function AIReviewPanel({
  review,
  compound,
  evolutionStage,
  projectId,
  forging = false,
}: {
  review: AIReview;
  compound: number;
  evolutionStage: EvolutionStage;
  projectId: string;
  forging?: boolean;
}) {
  const { t } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const cfg = EVOLUTION_CONFIG[evolutionStage];

  // Compound count-up: when forging, ramp from 0 → compound over 1.8s
  // starting at delay 1.4s (so the frame color reveal happens first).
  const [compoundDisplay, setCompoundDisplay] = useState(forging ? 0 : compound);
  useEffect(() => {
    if (!forging) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCompoundDisplay(compound);
      return;
    }
    let rafId: number | undefined;
    let started: number | null = null;
    const start = setTimeout(() => {
      const step = (ts: number) => {
        if (started === null) started = ts;
        const t = Math.min(1, (ts - started) / 1800);
        const eased = 1 - Math.pow(1 - t, 3);
        setCompoundDisplay(Math.round(eased * compound));
        if (t < 1) rafId = requestAnimationFrame(step);
      };
      rafId = requestAnimationFrame(step);
    }, 1400);
    return () => {
      clearTimeout(start);
      if (rafId !== undefined) cancelAnimationFrame(rafId);
    };
  }, [forging, compound]);
  const stars = STAGE_ORDINAL[evolutionStage];
  const filledStars = evolutionStage === "Myth" ? 5 : stars;

  const metrics: {
    key: keyof Pick<
      AIReview,
      "originality" | "clarity" | "uxPotential" | "viralityPotential" | "investorCuriosity"
    >;
    code: string;
    label: string;
  }[] = [
    { key: "originality",       code: "ORG", label: t("project.originality") },
    { key: "clarity",           code: "CLR", label: t("project.clarity") },
    { key: "uxPotential",       code: "UXP", label: t("project.uxPotential") },
    { key: "viralityPotential", code: "VIR", label: t("project.viralityPotential") },
    { key: "investorCuriosity", code: "INV", label: t("project.investorCuriosity") },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "relative",
        background: "var(--bg-panel)",
        border: "3px solid var(--border-bolt)",
        boxShadow: "4px 4px 0 #000",
        padding: 24,
        color: "var(--text, #E8E8EC)",
      }}
    >
      <LCorner pos="tl" />
      <LCorner pos="tr" />
      <LCorner pos="bl" />
      <LCorner pos="br" />

      {/* 1. HEADER STRIP */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "1px solid var(--border-hair)",
          paddingBottom: 10,
          marginBottom: 18,
          minHeight: 32,
        }}
      >
        <ClaudeSigil color="var(--neon-green)" />
        <div
          className="font-ui"
          style={{
            fontSize: 10,
            letterSpacing: 3,
            color: "var(--neon-green)",
            textShadow: "0 0 4px rgba(57,255,20,0.6)",
          }}
        >
          {t("project.reviewBoard")}
        </div>
        <div
          className="font-code"
          style={{
            marginLeft: "auto",
            fontSize: 9,
            color: "rgba(136,136,160,0.7)",
            letterSpacing: 0.5,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "45%",
            flexShrink: 0,
          }}
        >
          {/* Truncate long ids (e.g. proj-mo3bo8p1-i8k8 → proj-mo3b…)
              so the header doesn't wrap to 2 lines inside the ~380px
              sidebar. Seed ids like "2" stay untouched. */}
          VIBEX://PROJECT/{projectId.length > 10 ? projectId.slice(0, 8) + "…" : projectId}
        </div>
      </div>

      {/* 2. VERDICT CALLOUT */}
      <div
        style={{
          position: "relative",
          background: "var(--bg-card)",
          border: "3px solid var(--border-bolt)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)",
          padding: "18px 20px",
          display: "flex",
          alignItems: "center",
          gap: 20,
          minHeight: 120,
          overflow: "hidden",
        }}
      >
        {/* scanline overlay */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,0.25) 2px 3px)",
            pointerEvents: "none",
            opacity: 0.6,
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <EvoSigil stage={evolutionStage} forging={forging} />
        </div>
        <div style={{ position: "relative", zIndex: 1, flex: 1, minWidth: 0 }}>
          <div
            className="font-ui"
            style={{
              fontSize: 9,
              letterSpacing: 3,
              color: "var(--text-muted)",
              marginBottom: 8,
            }}
          >
            {t("project.overallVerdict")}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              marginBottom: 10,
              flexWrap: "wrap",
            }}
          >
            <span
              className="font-pixel"
              style={{
                fontSize: 52,
                color: "var(--neon-yellow)",
                lineHeight: 1,
                textShadow: "4px 4px 0 #000, 0 0 18px rgba(250,204,21,0.45)",
              }}
            >
              {compoundDisplay}
            </span>
            <span
              className="font-retro"
              style={{ fontSize: 22, color: "var(--text-muted)", lineHeight: 1 }}
            >
              / 100
            </span>
            <span style={{ marginLeft: "auto" }}>
              <EvolutionBadge stage={evolutionStage} size="lg" />
            </span>
          </div>
          <div
            className="font-pixel"
            style={{
              fontSize: 11,
              color: cfg.color,
              letterSpacing: 2,
              textShadow: `0 0 8px ${cfg.color}88`,
            }}
          >
            {t("project.tierLabel").replace("{STAGE}", cfg.label.toUpperCase())}{" "}
            <span style={{ letterSpacing: 2 }}>
              {Array.from({ length: 5 }, (_, i) => (i < filledStars ? "★" : "☆")).join("")}
            </span>
          </div>
        </div>
      </div>

      {/* 3. ATTRIBUTE BREAKDOWN */}
      <div style={{ marginTop: 22 }}>
        <div
          className="font-ui"
          style={{
            fontSize: 10,
            letterSpacing: 3,
            color: "var(--neon-green)",
            marginBottom: 14,
          }}
        >
          {t("project.attributeBreakdown")}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {metrics.map((m, i) => (
            <AttrRow
              key={m.key}
              code={m.code}
              label={m.label}
              value={review[m.key]}
              index={i}
              inView={inView}
              forging={forging}
            />
          ))}
        </div>
        <div
          className="font-ui"
          style={{
            fontSize: 7,
            letterSpacing: 2,
            color: "var(--text-dim, #555)",
            marginTop: 10,
            textAlign: "right",
          }}
        >
          {t("project.attributeDiscipline")}
        </div>
      </div>

      {/* 4. PIXEL DIVIDER */}
      <div
        aria-hidden="true"
        style={{
          height: 2,
          margin: "20px 0",
          backgroundImage:
            "repeating-linear-gradient(90deg, var(--border-bolt) 0 4px, transparent 4px 8px)",
        }}
      />

      {/* 5. BATTLE LOG — single column stack.
          The panel lives in a ~380px-wide right-sidebar cell. Three
          horizontal columns there give each log ~120px, which pushes
          VT323 copy into 3-word-per-line breaks (observed on prod
          2026-04-20 with AgentForge's suggestions). Keep the Claude
          Design hi-fi's 3-col feel for a future wider layout by
          switching to container queries; for now, stack vertically —
          item legibility > the row aesthetic. */}
      <div
        className="flex flex-col gap-6"
      >
        <LogColumn
          glyph="⚔"
          label={t("project.combosLanded")}
          items={review.strengths}
          color="var(--neon-green)"
        />
        <LogColumn
          glyph="✦"
          label={t("project.hitsTaken")}
          items={review.weaknesses}
          color="var(--neon-orange)"
        />
        <LogColumn
          glyph="▸"
          label={t("project.nextQuests")}
          items={review.suggestions}
          color="var(--neon-purple)"
          itemAttrs={() =>
            ({ "data-quest": "pending" } as React.LiHTMLAttributes<HTMLLIElement>)
          }
        />
      </div>

      {/* 6. BYLINE */}
      <div
        style={{
          marginTop: 22,
          paddingTop: 14,
          borderTop: "1px solid var(--border-hair)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <ClaudeSigil color="var(--neon-green)" />
        <span
          className="font-ui"
          style={{ fontSize: 9, letterSpacing: 2, color: "var(--neon-green)" }}
        >
          {t("project.judgedBy")}
        </span>
        <span
          className="font-ui"
          style={{
            marginLeft: "auto",
            fontSize: 9,
            letterSpacing: 1,
            color: "rgba(136,136,160,0.6)",
          }}
        >
          {t("project.aiDisclaimer")}
        </span>
      </div>
    </motion.div>
  );
}

/* ---------- Related Project Card ---------- */
/* ---------- Main Page ---------- */
export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: projects, loading: projectsLoading } = useProjects();
  const project = projects.find((p) => p.id === id);
  const { t } = useLang();
  const { user } = useAuth();
  const [shareOpen, setShareOpen] = useState(false);
  const { burstStage, clearBurst } = useEvolutionDetector(project?.hero?.evolutionStage);
  const viewPingedRef = useRef(false);

  // Forge unveil: when the user lands here from /launch with ?forged=1, play a
  // one-shot 3.5s animation (frame color reveal + compound count-up + staggered
  // bar fill), then strip the param so a refresh doesn't replay.
  const [forging, setForging] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("forged") !== "1") return;
    setForging(true);
    const timer = setTimeout(() => {
      setForging(false);
      const url = new URL(window.location.href);
      url.searchParams.delete("forged");
      window.history.replaceState(null, "", url.toString());
    }, 3600);
    return () => clearTimeout(timer);
  }, []);

  // Fire view pingback once per page mount. POSTs to /api/projects/:id/view
  // which bumps projects.views via the SECURITY DEFINER increment_view RPC
  // (migration 041). Before 2026-04-17 nothing incremented this counter, so
  // the "Views" HUD field on every project page was permanently stuck at
  // whatever the seed set (0 for user-submitted projects).
  useEffect(() => {
    if (!project?.id || viewPingedRef.current) return;
    viewPingedRef.current = true;
    fetch(`/api/projects/${encodeURIComponent(project.id)}/view`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {
      // fire-and-forget; no user-facing consequence if it fails
    });
  }, [project?.id]);

  const relatedProjects = useMemo(() => {
    if (!project) return [];
    // Deterministic shuffle seeded by current project id — avoids Math.random
    // in a useMemo (would produce a different order on every re-render + cause
    // SSR hydration mismatch). Pairs each candidate with a stable hash of
    // `(candidate.id ^ project.id)` and sorts by that hash.
    const seed = hashString(project.id);
    return projects
      .filter((p) => p.id !== project.id)
      .map((p) => ({ p, k: hashString(p.id) ^ seed }))
      .sort((a, b) => a.k - b.k)
      .slice(0, 3)
      .map((x) => x.p);
  }, [project, projects]);

  if (!project) {
    // Still fetching — show a lightweight skeleton instead of the 404 flash.
    if (projectsLoading) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <div className="text-sm text-[color:var(--text-muted)] font-ui">LOADING HERO…</div>
        </div>
      );
    }
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">{t("project.notFound")}</h1>
        <p className="text-[color:var(--text-muted)]">
          {t("project.notFoundDesc")}
        </p>
        <Link href="/home">
          <Button variant="outline">
            <ArrowLeft className="size-4" />
            {t("project.backToExplore")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6"
    >
      {/* ===== Hero Header ===== */}
      <motion.div variants={fadeIn} className="relative mb-12 overflow-hidden">
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-72 w-72 rounded-full bg-violet-600/20 blur-[120px] animate-pulse-slow" />
        <div className="pointer-events-none absolute -top-20 right-10 h-56 w-56 rounded-full bg-fuchsia-600/15 blur-[100px] animate-pulse-slow" style={{ animationDelay: "2s" }} />

        <div className="relative space-y-5">
          {/* Breadcrumb nav */}
          <nav aria-label="Breadcrumb">
            <Link
              href="/home"
              className="inline-flex items-center gap-1.5 text-sm text-[color:var(--text-muted)] transition-colors hover:text-[var(--neon-yellow)]"
            >
              <ArrowLeft className="size-4" />
              {t("project.backToExplore")}
            </Link>
          </nav>

          {/* Pixel eyebrow — matches /home HQ aesthetic. Shows the category
              and featured flag as a single machine-readout line. */}
          <div
            className="font-ui"
            style={{
              fontSize: 11,
              color: "var(--neon-green)",
              letterSpacing: 3,
              textShadow: "0 0 4px rgba(57,255,20,0.8)",
            }}
          >
            ▸ VIBEX://PROJECT ·{" "}
            <span style={{ color: "var(--neon-cyan)" }}>
              {project.category.toUpperCase()}
            </span>
            {project.featured && (
              <>
                {" · "}
                <span style={{ color: "var(--neon-yellow)" }}>★ FEATURED</span>
              </>
            )}
          </div>

          {/* Title — short titles get the big pixel game-title; long
              titles (>20 chars) drop to font-retro which stays readable
              at large sizes without ugly line breaks. */}
          <h1
            className={`${project.title.length > 20 ? "font-retro" : "font-pixel font-pixel-hero"} mt-2 text-[28px] sm:text-[38px] md:text-[48px]`}
            style={{
              color: "#FFFCEB",
              letterSpacing: project.title.length > 20 ? 1 : 3,
              lineHeight: 1.25,
              textShadow:
                "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 3px 3px 0 #000, 4px 4px 0 #000, 5px 5px 0 #1a0a3a, 0 0 32px rgba(157,0,255,0.5)",
            }}
          >
            <span
              style={{
                background:
                  "linear-gradient(180deg, #FFE27D 0%, #FFD700 40%, #B8860B 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {project.title}
            </span>
          </h1>

          {/* Tagline — font-retro to mirror the HQ hero subtitle rhythm. */}
          <p
            className="font-retro text-[17px] sm:text-[20px] md:text-[22px] mt-3 max-w-2xl"
            style={{
              color: "rgba(232,232,236,0.85)",
              textShadow: "0 2px 0 rgba(0,0,0,0.7)",
            }}
          >
            {project.tagline}
          </p>

          {/* Stats strip — font-ui pixel chrome so the numbers read like
              a game HUD rather than shadcn metadata. */}
          <div
            className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 font-ui"
            style={{ fontSize: 10, letterSpacing: 1.5 }}
          >
            <span
              className="flex items-center gap-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              <User className="size-3.5" />
              <b style={{ color: "var(--text)", fontWeight: "normal" }}>
                @{project.creatorName}
              </b>
            </span>
            <span
              className="flex items-center gap-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              <Calendar className="size-3.5" />
              <time dateTime={project.createdAt}>{formatProjectDate(project.createdAt)}</time>
            </span>
            <span
              className="flex items-center gap-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              <Eye className="size-3.5" />
              <b style={{ color: "var(--text)", fontWeight: "normal" }}>
                {project.views.toLocaleString()}
              </b>{" "}
              VIEWS
            </span>
            <span
              className="flex items-center gap-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              <ChevronUp className="size-3.5" style={{ color: "var(--neon-purple)" }} />
              <b style={{ color: "var(--neon-purple)", fontWeight: "normal" }}>
                {project.upvotes.toLocaleString()}
              </b>{" "}
              UPVOTES
            </span>
            <span
              className="flex items-center gap-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              <Trophy
                className="size-3.5"
                style={{ color: "var(--neon-yellow)" }}
              />
              SCORE{" "}
              <b
                className="font-pixel"
                style={{
                  color: "var(--neon-yellow)",
                  fontWeight: "normal",
                  fontSize: 13,
                  textShadow: "0 0 8px rgba(250,204,21,0.6)",
                }}
              >
                {project.score}
              </b>
            </span>
          </div>
        </div>
      </motion.div>

      {/* ===== Main Grid ===== */}
      <article className="grid grid-cols-1 gap-10 lg:grid-cols-3" itemScope itemType="https://schema.org/SoftwareApplication">
        {/* Left Column */}
        <div className="space-y-10 lg:col-span-2">
          {/* Demo Panel */}
          <motion.div variants={fadeIn}>
            <PlayableDemo
              demoType={project.demoType}
              demoUrl={project.demoUrl}
              demoContent={project.demoContent}
              projectTitle={project.title}
              projectId={project.id}
              initialPlays={project.plays}
            />
          </motion.div>

          {/* Description */}
          <motion.div variants={fadeIn} className="space-y-3">
            <h2 className="text-xl font-semibold">{t("project.about")}</h2>
            <p className="leading-relaxed text-[color:var(--text-muted)]">
              {project.description}
            </p>
          </motion.div>

          {/* Tags */}
          <motion.div variants={fadeIn} className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="glass-card rounded-full px-3.5 py-1.5 text-xs font-medium text-[color:var(--text-muted)] transition-colors hover:text-[var(--neon-yellow)] hover:border-white/15"
              >
                {tag}
              </span>
            ))}
          </motion.div>

          {/* Launch Feedback Loop — owner-only in Phase 2, logged-in-only in Phase 1 */}
          {user && (
            <motion.div variants={fadeIn}>
              <FeedbackPanel projectId={project.id} />
            </motion.div>
          )}

          {/* Fork Tree — Remix Guild */}
          <ForkTree project={project} allProjects={projects} />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Action Buttons */}
          <motion.div variants={fadeIn} className="flex gap-3">
            <Button className="flex-1 gap-2 bg-violet-600 hover:bg-violet-500 text-white" variant="default">
              <ChevronUp className="size-4" />
              {t("project.upvote")}
            </Button>
            <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/5" onClick={() => setShareOpen(true)}>
              <Share2 className="size-4" />
              {t("project.share")}
            </Button>
          </motion.div>

          {/* Evolution Progress */}
          <motion.div variants={fadeIn} className="rpgui-container framed" style={{ padding: 16 }}>
            <EvolutionProgress project={project} />
          </motion.div>

          {/* Growth Radar */}
          <motion.div variants={fadeIn} className="rpgui-container framed" style={{ padding: 16 }}>
            <GrowthRadar project={project} size={180} />
          </motion.div>

          {/* RPG Hero Panel */}
          {project.hero && (
            <motion.div variants={fadeIn} className="rpgui-container framed space-y-4" style={{ padding: 16 }}>

              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Swords className="size-4 text-violet-400" />
                  <h3 className="font-pixel text-[9px] uppercase tracking-wider text-foreground">
                    {t("project.heroStats")}
                  </h3>
                </div>
                <EvolutionBadge stage={project.hero.evolutionStage} size="sm" />
              </div>

              {/* Class + Level */}
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 flex items-center justify-center retro-border sprite-float"
                  style={{
                    background: `oklch(0.15 0.02 280)`,
                  }}
                >
                  <ClassIcon heroClass={project.hero.heroClass} size={24} />
                </div>
                <div>
                  <ClassIcon heroClass={project.hero.heroClass} showLabel />
                  <ExpBar hero={project.hero} className="mt-1" />
                </div>
              </div>

              {/* HUD Bars */}
              <HudBars hero={project.hero} />

              {/* Attribute Radar */}
              <div className="flex justify-center pt-2">
                <AttributeRadar attributes={project.hero.attributes} size={200} />
              </div>

              {/* Skill Tree */}
              <div className="pt-2">
                <h4 className="font-pixel text-[7px] text-[color:var(--text-muted)] uppercase tracking-widest mb-3">
                  {t("project.skillTree")}
                </h4>
                <SkillTree skills={project.hero.skillTree} />
              </div>

              {/* Battle + Donate Actions */}
              <div className="flex items-center justify-between pt-2">
                <Link href={`/arena`}>
                  <button className="nes-btn is-error" style={{ fontSize: 9, padding: "6px 14px" }}>
                    <span className="rpgui-icon sword small" style={{ width: 14, height: 14, display: "inline-block", verticalAlign: "middle", marginRight: 4 }} />
                    {t("project.battle")}
                  </button>
                </Link>
                <RareCandyButton
                  projectTitle={project.title}
                  currentDonors={Math.floor(project.upvotes * 0.3)}
                />
              </div>
              <hr className="rpgui-hr" />
            </motion.div>
          )}

          {/* AI Review Panel */}
          <AIReviewPanel
            review={project.aiReview}
            compound={project.score}
            evolutionStage={project.hero?.evolutionStage ?? "Seed"}
            projectId={project.id}
            forging={forging}
          />
        </div>
      </article>

      {/* ===== Comments ===== */}
      <motion.div variants={fadeIn} className="mt-16">
        <RealtimeChat projectId={project.id} />
      </motion.div>

      {/* ===== Related Projects ===== */}
      <motion.div variants={fadeIn} className="mt-20">
        <div
          className="font-ui mb-4"
          style={{
            fontSize: 11,
            color: "var(--neon-green)",
            letterSpacing: 3,
            textShadow: "0 0 4px rgba(57,255,20,0.6)",
          }}
        >
          ▸ RELATED HEROES
        </div>
        <h2
          className="font-pixel font-pixel-hero mb-6 text-[20px] sm:text-[24px] md:text-[28px]"
          style={{
            color: "var(--text)",
            letterSpacing: 2,
            textShadow: "3px 3px 0 rgba(0,0,0,0.7)",
          }}
        >
          {t("project.relatedProjects")}
        </h2>
        <div className="grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
          {projectsToCards(relatedProjects).map((card) => (
            <HeroCard key={card.id} data={card} />
          ))}
        </div>
      </motion.div>

      {/* Share Modal */}
      <ShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        project={{
          id: project.id,
          title: project.title,
          tagline: project.tagline,
          category: project.category,
          creatorName: project.creatorName,
        }}
      />

      {/* Evolution burst animation */}
      <EvolutionBurst stage={burstStage} onComplete={clearBurst} />
    </motion.div>
  );
}
