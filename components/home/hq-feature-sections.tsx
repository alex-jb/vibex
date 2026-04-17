"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════════════
   HQ Feature Sections — 5 variants showcasing VibeX's unique capabilities.
   Inspired by codedex.io's alternating "headline + screenshot" pattern.
   Each section has: copy column (eyebrow + h2 + p + learn link) and a
   framed mock UI column. Sections alternate copy-left / copy-right.
   ═══════════════════════════════════════════════════════════════════════════ */

type SectionProps = {
  reverse?: boolean;
  eyebrow: string;
  title: ReactNode;
  body: string;
  learnLabel: string;
  learnHref?: string;
  frame: ReactNode;
};

function Section({
  reverse = false,
  eyebrow,
  title,
  body,
  learnLabel,
  learnHref = "#",
  frame,
}: SectionProps) {
  return (
    <div
      className="mx-auto px-4 sm:px-8 md:px-10 mt-14 sm:mt-[72px]"
      style={{ maxWidth: 1440 }}
    >
      <div
        className="grid items-center grid-cols-1 md:grid-cols-2 gap-8 md:gap-12"
        style={{
          // reverse only kicks in on md+ where the 2-col layout exists; on
          // mobile we always show copy first, frame second.
          direction: reverse ? "rtl" : "ltr",
        }}
      >
        <div style={{ direction: "ltr" }}>
          <div
            className="font-ui text-[10px] sm:text-[11px]"
            style={{
              color: "var(--neon-green)",
              letterSpacing: 3,
              marginBottom: 14,
              textShadow: "0 0 4px rgba(57,255,20,0.6)",
            }}
          >
            {eyebrow}
          </div>
          <h2
            className="font-pixel text-[20px] sm:text-[24px] md:text-[26px]"
            style={{
              color: "var(--text)",
              letterSpacing: 2,
              lineHeight: 1.4,
              marginBottom: 16,
              textShadow:
                "3px 3px 0 rgba(0,0,0,0.8), 0 0 24px rgba(157,0,255,0.4)",
            }}
          >
            {title}
          </h2>
          <p
            className="font-retro text-[16px] sm:text-[19px] md:text-[21px]"
            style={{
              color: "var(--text-muted)",
              lineHeight: 1.5,
              marginBottom: 24,
              maxWidth: 520,
            }}
          >
            {body}
          </p>
          <Link
            href={learnHref}
            className="font-ui"
            style={{
              fontSize: 11,
              color: "var(--neon-cyan)",
              letterSpacing: 2,
              textDecoration: "none",
              borderBottom: "1.5px dashed rgba(6,182,212,0.4)",
              paddingBottom: 2,
            }}
          >
            {learnLabel}
          </Link>
        </div>
        <div
          className="relative"
          style={{
            direction: "ltr",
            background: "var(--bg-card)",
            border: "2px solid var(--border-bolt)",
            padding: 14,
            boxShadow: "6px 6px 0 #000",
            overflow: "hidden",
            minHeight: 300,
          }}
        >
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 right-0"
            style={{ height: 3, background: "var(--neon-yellow)" }}
          />
          <div
            className="relative"
            style={{
              background: "#0A0A0C",
              border: "1px solid var(--border-wire)",
              minHeight: 260,
              padding: 18,
            }}
          >
            {frame}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Shot 1: AI Review panel ─── */
function AiReviewShot() {
  const stats = [
    { label: "ORIGINALITY", pct: 94 },
    { label: "CRAFT", pct: 92 },
    { label: "MARKET FIT", pct: 88 },
    { label: "GROWTH", pct: 76 },
  ];
  return (
    <>
      <div
        className="font-ui"
        style={{
          fontSize: 9,
          color: "var(--text-muted)",
          letterSpacing: 2,
          marginBottom: 8,
        }}
      >
        ▸ VIBEX://AI_REVIEW · AGENTCRAFT
      </div>
      <div
        className="flex items-baseline gap-3.5 pb-3.5 mb-[18px]"
        style={{ borderBottom: "1px solid var(--border-hair)" }}
      >
        <div
          className="font-pixel"
          style={{
            fontSize: 42,
            color: "var(--neon-yellow)",
            textShadow:
              "0 0 18px rgba(250,204,21,0.7), 3px 3px 0 #000",
            letterSpacing: 1,
          }}
        >
          97
        </div>
        <div
          className="font-ui"
          style={{ fontSize: 12, color: "var(--text-muted)" }}
        >
          / 100
          <br />
          OVERALL
        </div>
        <div
          className="ml-auto font-ui"
          style={{
            fontSize: 9,
            color: "var(--neon-green)",
            padding: "4px 8px",
            border: "1px solid var(--neon-green)",
            letterSpacing: 1.5,
          }}
        >
          LEGENDARY
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-2.5 font-ui"
            style={{ fontSize: 10, color: "var(--text)", letterSpacing: 1 }}
          >
            <span style={{ width: 92, color: "var(--text-muted)" }}>{s.label}</span>
            <div
              className="flex-1 relative"
              style={{
                height: 8,
                background: "#0A0A0C",
                border: "1px solid var(--border-wire)",
              }}
            >
              <div
                className="absolute top-0 left-0 h-full"
                style={{
                  width: `${s.pct}%`,
                  background:
                    "linear-gradient(90deg, var(--neon-yellow), #F59E0B)",
                }}
              />
            </div>
            <span style={{ width: 24, textAlign: "right" }}>{s.pct}</span>
          </div>
        ))}
      </div>
      <div
        className="font-retro italic mt-[18px] pt-3.5"
        style={{
          borderTop: "1px solid var(--border-hair)",
          fontSize: 16,
          color: "var(--text-muted)",
          lineHeight: 1.4,
        }}
      >
        &ldquo;AgentCraft turns LLM orchestration into one-click delegation.{" "}
        <span
          style={{ color: "var(--neon-cyan)", fontStyle: "normal" }}
        >
          The multi-agent swarm UI is genuinely new
        </span>{" "}
        — most alternatives hide the agents. Expect viral traction once the
        demo GIF ships.&rdquo;
      </div>
    </>
  );
}

/* ─── Shot 2: Evolution timeline ─── */
function EvolutionShot() {
  const stages = [
    { label: "SEED", icon: "/generated/evo-1-seed.png", state: "done" },
    { label: "ACTIVE", icon: "/generated/evo-2-active.png", state: "done" },
    { label: "GROWING", icon: "/generated/evo-3-growing.png", state: "done" },
    { label: "BREAKOUT", icon: "/generated/evo-4-breakout.png", state: "active" },
    { label: "LEGEND", icon: "/generated/evo-5-legend.png", state: "" },
    { label: "MYTH", icon: "/generated/evo-6-myth.png", state: "" },
  ];
  return (
    <div className="flex flex-col gap-3.5">
      <div
        className="font-ui"
        style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: 2 }}
      >
        ▸ VIBEX://EVOLUTION · VIBETRANSLATE
      </div>
      <div className="flex items-center gap-1">
        {stages.map((s, i) => {
          const isActive = s.state === "active";
          const isDone = s.state === "done";
          return (
            <div key={s.label} className="flex items-center gap-1 flex-1">
              <div
                className="flex-1 flex flex-col items-center gap-1 font-ui"
                style={{
                  fontSize: 7,
                  letterSpacing: 1,
                  padding: "6px 2px 5px",
                  border: "1px solid var(--border-wire)",
                  color: isActive
                    ? "var(--neon-yellow)"
                    : isDone
                      ? "var(--neon-green)"
                      : "var(--text-muted)",
                  borderColor: isActive
                    ? "var(--neon-yellow)"
                    : isDone
                      ? "var(--neon-green)"
                      : "var(--border-wire)",
                  background: isActive
                    ? "rgba(250,204,21,0.08)"
                    : "rgba(0,0,0,0.4)",
                  boxShadow: isActive
                    ? "0 0 12px rgba(250,204,21,0.45)"
                    : isDone
                      ? "0 0 8px rgba(57,255,20,0.35)"
                      : "none",
                }}
              >
                <Image
                  src={s.icon}
                  alt=""
                  width={28}
                  height={28}
                  aria-hidden="true"
                  style={{
                    imageRendering: "pixelated",
                    opacity: s.state === "" ? 0.4 : 1,
                    filter: isActive
                      ? "drop-shadow(0 0 4px rgba(250,204,21,0.8))"
                      : isDone
                        ? "drop-shadow(0 0 3px rgba(57,255,20,0.6))"
                        : "grayscale(0.6)",
                  }}
                />
                <span>{s.label}</span>
              </div>
              {i < stages.length - 1 && (
                <div
                  className="font-pixel"
                  style={{ fontSize: 9, color: "var(--text-dim)" }}
                >
                  ▶
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex flex-col gap-2 mt-4">
        {[
          { k: "HP", pct: 88, grad: "linear-gradient(90deg, #4AFF2A, #1E9C00)" },
          { k: "MP", pct: 67, grad: "linear-gradient(90deg, #22D3EE, #0891B2)" },
          { k: "XP", pct: 51, grad: "linear-gradient(90deg, #C77DFF, #7B2FBE)" },
        ].map((b) => (
          <div
            key={b.k}
            className="flex items-center gap-2.5 font-ui"
            style={{ fontSize: 9 }}
          >
            <span
              style={{
                width: 36,
                color: "var(--text-muted)",
                letterSpacing: 1,
              }}
            >
              {b.k}
            </span>
            <div
              className="flex-1 relative"
              style={{
                height: 10,
                background: "#0A0A0C",
                border: "1px solid var(--border-wire)",
              }}
            >
              <div
                className="absolute top-0 left-0 h-full"
                style={{ width: `${b.pct}%`, background: b.grad }}
              />
            </div>
            <span
              style={{
                width: 26,
                textAlign: "right",
                color: "var(--text)",
              }}
            >
              {b.pct}
            </span>
          </div>
        ))}
      </div>
      <div
        className="font-retro pt-3 mt-1"
        style={{
          borderTop: "1px solid var(--border-hair)",
          fontSize: 15,
          color: "var(--text-muted)",
          lineHeight: 1.4,
        }}
      >
        ▸ 412 plays · 108 saves · 12 shares
        <br />
        <span style={{ color: "var(--neon-green)" }}>+50 HP</span> since last
        evolution · Next: Legend at 1K plays
      </div>
    </div>
  );
}

/* ─── Shot 3: Arena battle HUD ─── */
function ArenaShot() {
  return (
    <>
      <div
        className="font-ui mb-3.5"
        style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: 2 }}
      >
        ▸ VIBEX://ARENA · ROUND 3
      </div>
      <div
        className="grid items-center gap-3.5"
        style={{ gridTemplateColumns: "1fr auto 1fr" }}
      >
        {["AgentCraft", "LoopMaster"].flatMap((name, i) => {
          const row = (
            <div
              key={name}
              className="p-[10px_12px]"
              style={{
                background: "var(--bg-panel)",
                border: "2px solid var(--border-metal)",
              }}
            >
              <div
                className="font-ui mb-1.5"
                style={{
                  fontSize: 9,
                  color: "var(--text)",
                  letterSpacing: 1,
                }}
              >
                {name}
              </div>
              <div
                className="flex items-center gap-1.5 font-ui"
                style={{ fontSize: 7, color: "var(--text-muted)" }}
              >
                <span>HP</span>
                <div
                  className="flex-1 relative"
                  style={{
                    height: 8,
                    background: "#0A0A0C",
                    border: "1px solid var(--border-wire)",
                  }}
                >
                  <div
                    className="absolute top-0 left-0 h-full"
                    style={{
                      width: i === 0 ? "72%" : "48%",
                      background:
                        "linear-gradient(90deg, #4AFF2A, #1E9C00)",
                    }}
                  />
                </div>
                <span>{i === 0 ? 72 : 48}</span>
              </div>
              <div
                className="font-ui mt-1"
                style={{
                  fontSize: 7,
                  color: "var(--neon-purple)",
                  letterSpacing: 1,
                }}
              >
                ★ {i === 0 ? "ARCHITECT" : "TACTICIAN"}
              </div>
            </div>
          );
          if (i === 0) {
            return [
              row,
              <div
                key="vs"
                className="font-pixel"
                style={{
                  fontSize: 28,
                  color: "var(--neon-orange)",
                  textShadow:
                    "0 0 16px rgba(255,69,0,0.9), 3px 3px 0 #000",
                }}
              >
                VS
              </div>,
            ];
          }
          return [row];
        })}
      </div>
      <div
        className="font-pixel text-center"
        style={{
          fontSize: 32,
          color: "var(--neon-yellow)",
          margin: "18px 0 8px",
          textShadow:
            "0 0 20px rgba(250,204,21,0.9), 4px 4px 0 #000",
          letterSpacing: 2,
        }}
      >
        - 42
      </div>
      <div
        className="text-center font-ui mb-3"
        style={{
          fontSize: 9,
          color: "var(--neon-pink)",
          letterSpacing: 3,
          textShadow: "0 0 8px rgba(236,72,153,0.8)",
        }}
      >
        ★ CRITICAL HIT ★
      </div>
      <div
        className="text-center font-ui pt-2.5"
        style={{
          fontSize: 10,
          color: "var(--text)",
          letterSpacing: 2,
          borderTop: "1px solid var(--border-hair)",
        }}
      >
        ▸ <span style={{ color: "var(--neon-green)" }}>MULTI-AGENT SWARM</span>{" "}
        · POWER 180
      </div>
    </>
  );
}

/* ─── Shot 4: Buddy stage ─── */
function BuddyShot() {
  return (
    <div className="text-center" style={{ padding: 6 }}>
      <div
        className="relative w-full mb-3.5 overflow-hidden"
        style={{
          height: 140,
          background:
            "linear-gradient(180deg, #1a0a3a 0%, #3d0a4a 70%, #0C0C14 100%)",
          border: "1px solid var(--border-wire)",
        }}
      >
        <div
          className="absolute"
          style={{
            bottom: 8,
            left: "50%",
            transform: "translateX(-50%)",
            width: 70,
            height: 6,
            background: "rgba(0,0,0,0.5)",
            borderRadius: "50%",
            filter: "blur(3px)",
          }}
        />
        <svg
          viewBox="0 0 32 32"
          shapeRendering="crispEdges"
          className="absolute"
          style={{
            bottom: 10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 96,
            height: 96,
          }}
        >
          <rect x="10" y="14" width="12" height="10" fill="#1E9C00" />
          <rect x="8" y="16" width="16" height="6" fill="#1E9C00" />
          <rect x="9" y="15" width="14" height="8" fill="#39FF14" />
          <rect x="10" y="14" width="12" height="2" fill="#8EFF6F" />
          <rect x="12" y="17" width="2" height="2" fill="#FFF" />
          <rect x="18" y="17" width="2" height="2" fill="#FFF" />
          <rect x="13" y="18" width="1" height="1" fill="#000" />
          <rect x="19" y="18" width="1" height="1" fill="#000" />
          <rect x="14" y="21" width="4" height="1" fill="#0a2a0a" />
          <rect x="15" y="10" width="2" height="4" fill="#9D00FF" />
          <rect x="14" y="9" width="4" height="1" fill="#9D00FF" />
          <rect x="11" y="24" width="3" height="2" fill="#0a2a0a" />
          <rect x="18" y="24" width="3" height="2" fill="#0a2a0a" />
          <rect x="22" y="10" width="2" height="2" fill="#FACC15" />
          <rect x="6" y="12" width="2" height="2" fill="#FACC15" opacity="0.6" />
        </svg>
      </div>
      <div
        className="font-pixel mb-1.5"
        style={{
          fontSize: 11,
          color: "var(--neon-yellow)",
          letterSpacing: 2,
          textShadow: "0 0 8px rgba(250,204,21,0.6)",
        }}
      >
        LEAFSPARK LV.14
      </div>
      <div
        className="font-ui mb-2.5"
        style={{
          fontSize: 8,
          color: "var(--text-muted)",
          letterSpacing: 1.5,
        }}
      >
        ★ NATURE CLASS · STARTER BUDDY
      </div>
      <div
        className="flex gap-2.5 justify-center font-ui"
        style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: 1 }}
      >
        <span>
          HP <b style={{ color: "var(--neon-green)", fontWeight: "normal" }}>78</b>
        </span>
        <span>
          MP <b style={{ color: "var(--neon-green)", fontWeight: "normal" }}>54</b>
        </span>
        <span>
          XP <b style={{ color: "var(--neon-green)", fontWeight: "normal" }}>41</b>
        </span>
        <span>
          BOND <b style={{ color: "var(--neon-green)", fontWeight: "normal" }}>92</b>
        </span>
      </div>
    </div>
  );
}

/* ─── Shot 5: VC Dashboard (deal flow + radar) ─── */
function VcShot() {
  const deals = [
    { rank: "01", name: "AgentCraft", score: 97, status: "▲ HOT", c: "var(--neon-green)", rc: "var(--neon-yellow)" },
    { rank: "02", name: "LoopMaster", score: 94, status: "◆ TRACK", c: "var(--neon-cyan)", rc: "var(--neon-yellow)" },
    { rank: "03", name: "CodeSage", score: 91, status: "◆ TRACK", c: "var(--neon-cyan)", rc: "var(--text)" },
    { rank: "04", name: "PixelForge", score: 85, status: "▲ NEW", c: "var(--neon-pink)", rc: "var(--text)" },
    { rank: "05", name: "Hyperdrive", score: 81, status: "— HOLD", c: "var(--text-muted)", rc: "var(--text)" },
  ];
  return (
    <div style={{ padding: 4 }}>
      <div
        className="font-ui mb-3"
        style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: 2 }}
      >
        ▸ VIBEX://VC · DEAL FLOW · WEEK 16
      </div>
      <div className="flex flex-col gap-1.5">
        <div
          className="grid items-center gap-2.5 font-ui pb-1.5"
          style={{
            gridTemplateColumns: "20px 1fr 40px 60px",
            fontSize: 9,
            color: "var(--text-muted)",
            letterSpacing: 1,
            borderBottom: "1px solid var(--border-hair)",
          }}
        >
          <span>#</span>
          <span>HERO</span>
          <span className="text-right">AI</span>
          <span className="text-right">STATUS</span>
        </div>
        {deals.map((d) => (
          <div
            key={d.rank}
            className="grid items-center gap-2.5 font-ui"
            style={{
              gridTemplateColumns: "20px 1fr 40px 60px",
              fontSize: 10,
              color: "var(--text)",
            }}
          >
            <span style={{ color: d.rc }}>{d.rank}</span>
            <span>{d.name}</span>
            <span
              className="text-right"
              style={{ color: d.rc === "var(--neon-yellow)" ? "var(--neon-yellow)" : "var(--text)" }}
            >
              {d.score}
            </span>
            <span
              className="text-right"
              style={{ color: d.c, fontSize: 8 }}
            >
              {d.status}
            </span>
          </div>
        ))}
      </div>
      <div
        className="flex gap-3.5 mt-4 pt-3.5"
        style={{ borderTop: "1px solid var(--border-hair)" }}
      >
        <svg
          viewBox="0 0 100 100"
          width="92"
          height="92"
          className="shrink-0"
        >
          <polygon
            points="50,12 84,32 84,68 50,88 16,68 16,32"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
          <polygon
            points="50,24 74,38 74,62 50,76 26,62 26,38"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />
          <polygon
            points="50,36 64,44 64,56 50,64 36,56 36,44"
            fill="none"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="1"
          />
          <polygon
            points="50,16 82,40 76,70 50,84 28,66 24,36"
            fill="rgba(157,0,255,0.35)"
            stroke="#9D00FF"
            strokeWidth="1.5"
          />
          {[
            [50, 16],
            [82, 40],
            [76, 70],
            [50, 84],
            [28, 66],
            [24, 36],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="2" fill="#FACC15" />
          ))}
        </svg>
        <div className="flex-1">
          <div
            className="font-ui mb-1.5"
            style={{
              fontSize: 9,
              color: "var(--text-muted)",
              letterSpacing: 1.5,
            }}
          >
            ▸ AGENTCRAFT · 6-ATTR
          </div>
          <div
            className="font-ui"
            style={{ fontSize: 8, lineHeight: 1.8, letterSpacing: 0.5 }}
          >
            {[
              ["POWER", 94, "var(--neon-yellow)"],
              ["ORIGINALITY", 97, "var(--neon-yellow)"],
              ["MARKET FIT", 88, "var(--neon-green)"],
              ["TRACTION", 91, "var(--neon-green)"],
              ["CRAFT", 92, "var(--neon-yellow)"],
              ["TEAM", 76, "var(--text-muted)"],
            ].map(([k, v, c]) => (
              <div key={String(k)} style={{ color: "var(--text)" }}>
                {String(k)} ·{" "}
                <span style={{ color: String(c) }}>{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Public component ─── */
export function HqFeatureSections() {
  return (
    <>
      <Section
        eyebrow="▸ CLAUDE-POWERED · ZERO CONFIG"
        title={
          <>
            97 OR IT
            <br />
            <span style={{ color: "var(--neon-yellow)" }}>DOESN&apos;T SHIP.</span>
          </>
        }
        body="Claude reviews every hero. Originality, craft, market fit, growth. One score, one verdict."
        learnLabel="▸ SEE AN EXAMPLE REVIEW"
        learnHref="/project/2"
        frame={<AiReviewShot />}
      />
      <Section
        reverse
        eyebrow="▸ REAL TRACTION, NO VANITY METRICS"
        title={
          <>
            REAL PLAYS.
            <br />
            <span style={{ color: "var(--neon-yellow)" }}>REAL LEVELS.</span>
          </>
        }
        body="Every hero levels up on real plays, saves, and shares. Seed to Myth in 6 stages."
        learnLabel="▸ WATCH ONE EVOLVE"
        learnHref="/insights"
        frame={<EvolutionShot />}
      />
      <Section
        eyebrow="▸ HERO VS HERO · REAL COMBAT MATH"
        title={
          <>
            6 STATS.
            <br />
            <span style={{ color: "var(--neon-yellow)" }}>ONE WINNER.</span>
          </>
        }
        body="Battle other heroes in the Arena. Real crit math, elemental types, weekly ranks."
        learnLabel="▸ ENTER THE ARENA"
        learnHref="/arena"
        frame={<ArenaShot />}
      />
      <Section
        reverse
        eyebrow="▸ EVERY CREATOR GETS ONE"
        title={
          <>
            YOUR PIXEL
            <br />
            <span style={{ color: "var(--neon-yellow)" }}>BUDDY.</span>
          </>
        }
        body="A pet that grows with your projects. 12 classes, 6 stages, unique passives."
        learnLabel="▸ PICK YOUR STARTER"
        learnHref="/launch"
        frame={<BuddyShot />}
      />
      <Section
        eyebrow="▸ INVESTORS, MEET YOUR DEAL FLOW"
        title={
          <>
            DISCOVER AI
            <br />
            <span style={{ color: "var(--neon-yellow)" }}>BEFORE TWITTER.</span>
          </>
        }
        body="Radar charts, talent graphs, deal flow ranked by Claude. VC mode turns the codex into a watchlist."
        learnLabel="▸ SEE THE VC DASHBOARD"
        learnHref="/insights"
        frame={<VcShot />}
      />
    </>
  );
}
