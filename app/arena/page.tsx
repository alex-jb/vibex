"use client";

import { useState, useCallback, useEffect } from "react";
import { useLang } from "@/lib/i18n";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useProjects } from "@/lib/use-data";
import type { Project, BattleResult } from "@/lib/types";
import { simulateBattle, getBattleSummary } from "@/lib/battle-engine";
import { SeasonLeaderboard } from "@/components/arena/season-leaderboard";
import { onBattleWon } from "@/lib/feed-events";
import { FighterPanel } from "@/components/arena/battle-hud-display";
import { ProjectRoster } from "@/components/arena/project-roster";
import { BattlePhase } from "@/components/arena/battle-result";
import { CriticalHitOverlay, FlashOverlay } from "@/components/arena/battle-narrative";

const C = {
  BG: "#0D0D0D",
  PANEL: "#111114",
  CARD: "#161619",
  BORDER: "#3A3A42",
  TEXT: "#E8E8EC",
  MUTED: "#8B7AA0",
  DIM: "#8A7B9A",
  FORGE: "#FF4500",
  CREAM: "#FFE27D",
  GREEN: "#39FF14",
  RED: "#EF4444",
  YELLOW: "#FACC15",
  CYAN: "#06B6D4",
  PURPLE: "#9D00FF",
  FLOOR_TOP: "#5B3A14",
  FLOOR_BOT: "#2A1A0A",
};

const EVO_SPRITES = [
  "/generated/evo-1-seed.png",
  "/generated/evo-2-active.png",
  "/generated/evo-3-growing.png",
  "/generated/evo-4-breakout.png",
  "/generated/evo-5-legend.png",
  "/generated/evo-6-myth.png",
] as const;

/* Pick a sprite deterministically based on project id */
function spriteFor(projectId: string): string {
  let h = 0;
  for (const ch of projectId) h = ((h << 5) - h + ch.charCodeAt(0)) | 0;
  return EVO_SPRITES[Math.abs(h) % EVO_SPRITES.length];
}

/* ─── HP strip at top (SF-style) ─── */
function HPStrip({
  label,
  name,
  hp,
  side,
  color,
  attacking,
}: {
  label: string;
  name: string;
  hp: number; // 0-100
  side: "left" | "right";
  color: string;
  attacking: boolean;
}) {
  const fill = Math.max(0, Math.min(100, hp));
  return (
    <div
      style={{
        display: "flex",
        flexDirection: side === "left" ? "row" : "row-reverse",
        alignItems: "center",
        gap: 12,
        flex: 1,
      }}
    >
      <div
        className="font-pixel"
        style={{
          fontSize: 9,
          color,
          letterSpacing: 3,
          textShadow: `0 0 8px ${color}66`,
          minWidth: 40,
          textAlign: side === "left" ? "left" : "right",
        }}
      >
        {label}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="font-pixel"
          style={{
            fontSize: 10,
            color: C.CREAM,
            letterSpacing: 2,
            marginBottom: 4,
            textAlign: side === "left" ? "left" : "right",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textShadow: "2px 2px 0 #000",
          }}
        >
          {name}
        </div>
        <div
          style={{
            position: "relative",
            height: 18,
            background: "#0A0A0C",
            border: `2px solid ${color}`,
            boxShadow: `inset 0 0 0 1px #000, 3px 3px 0 #000${attacking ? `, 0 0 16px ${color}` : ""}`,
            transition: "box-shadow 0.2s",
          }}
        >
          {/* Fill */}
          <motion.div
            initial={false}
            animate={{ width: `${fill}%` }}
            transition={{ duration: 0.4 }}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              [side === "left" ? "left" : "right"]: 0,
              background: `linear-gradient(180deg, ${color}, ${color}99 100%)`,
            }}
          />
          {/* Tick segments overlay */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "repeating-linear-gradient(90deg, transparent 0 8px, rgba(0,0,0,0.3) 8px 9px)",
              pointerEvents: "none",
            }}
          />
          <span
            className="font-pixel"
            style={{
              position: "absolute",
              [side === "left" ? "right" : "left"]: 6,
              top: 1,
              fontSize: 9,
              color: "#000",
              textShadow: `1px 1px 0 ${color}66`,
            }}
          >
            {Math.round(fill)}
          </span>
        </div>
      </div>
    </div>
  );
}

function PortraitTile({ project, side, color }: { project: Project; side: "left" | "right"; color: string }) {
  return (
    <div
      style={{
        width: 96,
        height: 96,
        background: `radial-gradient(closest-side, ${color}33, ${C.BG} 70%)`,
        border: `3px solid ${color}`,
        boxShadow: `3px 3px 0 #000, 0 0 16px ${color}55`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: side === "right" ? "scaleX(-1)" : undefined,
      }}
    >
      <Image
        src={spriteFor(project.id)}
        alt=""
        width={72}
        height={72}
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}

export default function ArenaPage() {
  const { data: projects } = useProjects();
  const [challenger, setChallenger] = useState<Project | null>(null);
  const [defender, setDefender] = useState<Project | null>(null);
  const [phase, setPhase] = useState<"select" | "flash" | "battle" | "result">("select");
  const [result, setResult] = useState<BattleResult | null>(null);
  const [currentRound, setCurrentRound] = useState(-1);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [showCrit, setShowCrit] = useState(false);
  const [attackingSide, setAttackingSide] = useState<"left" | "right" | null>(null);
  const [, setAiNarrative] = useState<{
    intro: string;
    roundNarratives: string[];
    conclusion: string;
    mvpComment: string;
  } | null>(null);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [showSplash, setShowSplash] = useState<"ready" | "fight" | null>(null);
  const { t } = useLang();

  const available = projects.filter((p) => p.hero);

  const pickRandom = (exclude?: string) => {
    const pool = exclude ? available.filter((p) => p.id !== exclude) : available;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  /* Compute HP bars from round outcomes so far */
  const computeHP = (): { p1: number; p2: number } => {
    if (!result || currentRound < 0) return { p1: 100, p2: 100 };
    let p1 = 100;
    let p2 = 100;
    const perRound = 100 / Math.max(1, result.rounds.length);
    for (let i = 0; i <= currentRound; i++) {
      const r = result.rounds[i];
      if (!r) break;
      if (r.winner === "challenger") p2 -= perRound;
      else if (r.winner === "defender") p1 -= perRound;
    }
    if (phase === "result" && result.winner) {
      if (result.winner === challenger?.id) p2 = 0;
      else p1 = 0;
    }
    return { p1: Math.max(0, p1), p2: Math.max(0, p2) };
  };
  const hp = computeHP();

  const startBattle = useCallback(() => {
    if (!challenger || !defender) return;
    const res = simulateBattle(challenger, defender);
    setResult(res);
    setAiNarrative(null);

    if (res.winner) {
      const winner = res.winner === challenger.id ? challenger : defender;
      const loser = res.winner === challenger.id ? defender : challenger;
      onBattleWon(
        winner.creatorId ?? "system",
        winner.creatorName ?? winner.title,
        winner.title,
        loser.title,
        winner.id,
      ).catch(() => {});
    }
    setCurrentRound(-1);
    setBattleLog([
      `[SYSTEM] Battle initiated: ${challenger.title} vs ${defender.title}`,
      `[SYSTEM] Scanning attributes...`,
    ]);

    setPhase("flash");
    setShowSplash("ready");
    setTimeout(() => setShowSplash("fight"), 600);
    setTimeout(() => setShowSplash(null), 1400);

    setTimeout(() => {
      setPhase("battle");
      let idx = 0;
      const playRound = () => {
        if (idx >= res.rounds.length) {
          const summary = getBattleSummary(res, { challenger, defender });
          setBattleLog((l) => [
            ...l,
            ``,
            `═══════════════════════════════`,
            summary,
            `[SYSTEM] EXP awarded: ${challenger.title} +${res.expGained.challenger} | ${defender.title} +${res.expGained.defender}`,
          ]);
          setPhase("result");
          setAttackingSide(null);

          fetch("/api/ai/battle-narrative", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              challengerTitle: challenger.title,
              defenderTitle: defender.title,
              rounds: res.rounds,
              winner: res.winner === challenger.id ? "challenger" : "defender",
            }),
          })
            .then((r) => {
              if (!r.ok) throw new Error("AI narrative failed");
              return r.json();
            })
            .then((data) => {
              setAiNarrative(data);
              const narr: string[] = [
                ``,
                `═══ AI Battle Commentary ═══`,
                data.intro,
                ...data.roundNarratives,
                data.conclusion,
                data.mvpComment,
              ];
              setBattleLog((l) => [...l, ...narr]);
            })
            .catch(() => {});
          return;
        }

        const round = res.rounds[idx];
        setCurrentRound(idx);
        setAttackingSide(round.winner === "challenger" ? "left" : round.winner === "defender" ? "right" : null);

        setBattleLog((l) => [
          ...l,
          ``,
          `── Round ${idx + 1}: ${round.attribute.toUpperCase()} ──`,
          `${challenger.title}: ${round.challengerValue}  vs  ${defender.title}: ${round.defenderValue}`,
        ]);

        setTimeout(() => {
          setBattleLog((l) => [...l, round.narrative]);
          if (round.isCritical) {
            setShowCrit(true);
            setBattleLog((l) => [...l, `>>> CRITICAL HIT! <<<`]);
            setTimeout(() => setShowCrit(false), 1200);
          }
          setAttackingSide(null);
          idx++;
          setTimeout(playRound, 1800);
        }, 600);
      };
      setTimeout(playRound, 800);
    }, 1400);
  }, [challenger, defender]);

  useEffect(() => {
    if (phase === "select") {
      setShowSplash(null);
    }
  }, [phase]);

  const handleRosterSelect = (p: Project) => {
    if (!challenger) setChallenger(p);
    else if (!defender) setDefender(p);
    else {
      setChallenger(p);
      setDefender(null);
    }
  };
  const handleRematch = () => {
    setPhase("select");
    setResult(null);
    setBattleLog([]);
    setCurrentRound(-1);
  };
  const handleNewMatch = () => {
    handleRematch();
    setChallenger(null);
    setDefender(null);
  };

  const inBattle = phase === "battle" || phase === "result";

  return (
    <div
      className="relative min-h-full overflow-hidden"
      style={{ background: C.BG, color: C.TEXT }}
    >
      <CriticalHitOverlay show={showCrit} />
      <FlashOverlay show={phase === "flash"} />

      {/* READY? / FIGHT! splash with smith mascot */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4"
            style={{ background: "rgba(0,0,0,0.6)" }}
          >
            <Image
              src={showSplash === "ready" ? "/generated/smith-idle.png" : "/generated/smith-happy.png"}
              alt=""
              width={192}
              height={192}
              unoptimized
              style={{
                imageRendering: "pixelated",
                filter: `drop-shadow(0 0 16px ${showSplash === "ready" ? C.YELLOW : C.FORGE})`,
              }}
            />
            <div
              className="font-pixel"
              style={{
                fontSize: 96,
                color: showSplash === "ready" ? C.YELLOW : C.FORGE,
                letterSpacing: 8,
                textShadow: `6px 6px 0 #000, 0 0 48px ${showSplash === "ready" ? C.YELLOW : C.FORGE}`,
                transform: showSplash === "fight" ? "scale(1.1)" : undefined,
              }}
            >
              {showSplash === "ready" ? "READY?" : "FIGHT!"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="relative mx-auto"
        style={{ maxWidth: 1080, padding: "16px 16px 48px" }}
      >
        {/* Top terminal chrome */}
        <div
          style={{
            background: C.PANEL,
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `2px solid ${C.BORDER}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, background: "#FF5F57" }} />
            <span style={{ width: 8, height: 8, background: "#FEBC2E" }} />
            <span style={{ width: 8, height: 8, background: "#28C840" }} />
          </div>
          <span className="font-pixel" style={{ fontSize: 9, color: C.MUTED, letterSpacing: 3 }}>
            <span style={{ color: C.FORGE }}>▸</span> VIBEXFORGE://ARENA — 1v1
          </span>
          <span className="font-pixel" style={{ fontSize: 7, color: C.BORDER }}>━━━</span>
        </div>

        <h1 className="sr-only">{t("arena.battleArena")}</h1>

        {/* ═══ SF-STYLE HP STRIP ═══ */}
        {(inBattle || phase === "flash") && challenger && defender && (
          <div
            style={{
              position: "relative",
              padding: "16px 20px",
              background: `linear-gradient(180deg, ${C.PANEL}, ${C.BG})`,
              border: `3px solid ${C.BORDER}`,
              borderTop: "none",
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 0,
            }}
          >
            <HPStrip
              label="P1"
              name={challenger.title}
              hp={hp.p1}
              side="left"
              color={C.GREEN}
              attacking={attackingSide === "left"}
            />
            {/* Round counter center */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "4px 12px",
                border: `2px solid ${C.YELLOW}`,
                background: `${C.YELLOW}11`,
                boxShadow: `0 0 10px ${C.YELLOW}44`,
                minWidth: 64,
              }}
            >
              <span
                className="font-pixel"
                style={{ fontSize: 7, color: C.YELLOW, letterSpacing: 2 }}
              >
                ROUND
              </span>
              <span
                className="font-pixel"
                style={{
                  fontSize: 20,
                  color: C.YELLOW,
                  lineHeight: 1,
                  textShadow: `2px 2px 0 #000`,
                }}
              >
                {result ? `${Math.max(0, currentRound + 1)}/${result.rounds.length}` : "—"}
              </span>
            </div>
            <HPStrip
              label="P2"
              name={defender.title}
              hp={hp.p2}
              side="right"
              color={C.RED}
              attacking={attackingSide === "right"}
            />
          </div>
        )}

        {/* ═══ STAGE ═══ */}
        <div
          style={{
            position: "relative",
            background: C.PANEL,
            border: `3px solid ${C.BORDER}`,
            borderTop: (inBattle || phase === "flash") ? "none" : undefined,
            padding: "32px 24px 20px",
            overflow: "hidden",
            minHeight: 420,
          }}
        >
          {/* Stage floor (perspective) */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 80,
              background: `linear-gradient(180deg, ${C.FLOOR_TOP} 0%, ${C.FLOOR_BOT} 100%)`,
              borderTop: `2px solid ${C.FORGE}`,
              zIndex: 0,
            }}
          />
          {/* Stage floor tile stripes */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 80,
              background:
                "repeating-linear-gradient(90deg, transparent 0 24px, rgba(0,0,0,0.3) 24px 25px)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
          {/* Ember sparks */}
          <div
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              bottom: 60,
              left: "50%",
              transform: "translateX(-50%)",
              width: 320,
              height: 180,
              background: `radial-gradient(closest-side, ${C.FORGE}33, transparent 60%)`,
              zIndex: 1,
            }}
          />

          <div style={{ position: "relative", zIndex: 2 }}>
            {/* ═══ SELECT PHASE ═══ */}
            {phase === "select" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Title */}
                <div className="text-center" style={{ marginBottom: 24 }}>
                  <div
                    className="font-pixel"
                    style={{ fontSize: 10, color: C.FORGE, letterSpacing: 6, marginBottom: 8 }}
                  >
                    ▸ CHOOSE YOUR FIGHTER
                  </div>
                  <div
                    className="font-pixel"
                    style={{
                      fontSize: 28,
                      color: C.CREAM,
                      letterSpacing: 3,
                      textShadow: `3px 3px 0 #000, 0 0 20px ${C.FORGE}66`,
                    }}
                  >
                    {t("arena.battleArena")}
                  </div>
                </div>

                {/* Portraits row */}
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: "1fr auto 1fr",
                    alignItems: "center",
                    gap: 20,
                    marginBottom: 20,
                  }}
                >
                  {/* P1 portrait + name or empty slot */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    {challenger ? (
                      <>
                        <PortraitTile project={challenger} side="left" color={C.GREEN} />
                        <div
                          className="font-pixel"
                          style={{
                            fontSize: 10,
                            color: C.GREEN,
                            letterSpacing: 2,
                            maxWidth: 160,
                            textAlign: "center",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          P1 · {challenger.title}
                        </div>
                      </>
                    ) : (
                      <div
                        style={{
                          width: 96,
                          height: 96,
                          border: `2px dashed ${C.GREEN}66`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span
                          className="font-pixel"
                          style={{ fontSize: 18, color: C.GREEN, letterSpacing: 2 }}
                        >
                          P1
                        </span>
                      </div>
                    )}
                  </div>

                  {/* VS */}
                  <div
                    className="font-pixel"
                    style={{
                      fontSize: 40,
                      color: C.FORGE,
                      letterSpacing: 4,
                      textShadow: `3px 3px 0 #000, 0 0 24px ${C.FORGE}`,
                    }}
                  >
                    VS
                  </div>

                  {/* P2 */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    {defender ? (
                      <>
                        <PortraitTile project={defender} side="right" color={C.RED} />
                        <div
                          className="font-pixel"
                          style={{
                            fontSize: 10,
                            color: C.RED,
                            letterSpacing: 2,
                            maxWidth: 160,
                            textAlign: "center",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          P2 · {defender.title}
                        </div>
                      </>
                    ) : (
                      <div
                        style={{
                          width: 96,
                          height: 96,
                          border: `2px dashed ${C.RED}66`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span
                          className="font-pixel"
                          style={{ fontSize: 18, color: C.RED, letterSpacing: 2 }}
                        >
                          P2
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mini fighter sheets (show stats) */}
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginBottom: 24,
                  }}
                >
                  <div>
                    {challenger ? (
                      <div
                        style={{
                          background: `${C.GREEN}08`,
                          border: `2px solid ${C.GREEN}66`,
                          padding: 12,
                        }}
                      >
                        <FighterPanel project={challenger} side="left" />
                      </div>
                    ) : (
                      <div
                        style={{
                          border: `2px dashed ${C.BORDER}`,
                          padding: 20,
                          textAlign: "center",
                          background: C.PANEL,
                        }}
                      >
                        <span
                          className="font-pixel"
                          style={{ fontSize: 8, color: C.DIM, letterSpacing: 2 }}
                        >
                          ◌ {t("arena.selectBelow")}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    {defender ? (
                      <div
                        style={{
                          background: `${C.RED}08`,
                          border: `2px solid ${C.RED}66`,
                          padding: 12,
                        }}
                      >
                        <FighterPanel project={defender} side="right" />
                      </div>
                    ) : (
                      <div
                        style={{
                          border: `2px dashed ${C.BORDER}`,
                          padding: 20,
                          textAlign: "center",
                          background: C.PANEL,
                        }}
                      >
                        <span
                          className="font-pixel"
                          style={{ fontSize: 8, color: C.DIM, letterSpacing: 2 }}
                        >
                          ◌ {t("arena.selectBelow")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    justifyContent: "center",
                    flexWrap: "wrap",
                    marginBottom: 28,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      const c = pickRandom();
                      const d = pickRandom(c.id);
                      setChallenger(c);
                      setDefender(d);
                    }}
                    className="font-pixel"
                    style={{
                      fontSize: 11,
                      padding: "12px 24px",
                      color: C.CYAN,
                      background: `${C.CYAN}0F`,
                      border: `2px solid ${C.CYAN}`,
                      letterSpacing: 3,
                      cursor: "pointer",
                      boxShadow: `3px 3px 0 #000`,
                    }}
                  >
                    ⚄ {t("arena.randomMatch")}
                  </button>
                  {challenger && defender && (
                    <motion.button
                      type="button"
                      onClick={startBattle}
                      whileHover={{ scale: 1.05 }}
                      className="font-pixel"
                      style={{
                        fontSize: 15,
                        padding: "14px 36px",
                        color: "#000",
                        background: C.FORGE,
                        border: `3px solid ${C.CREAM}`,
                        letterSpacing: 4,
                        cursor: "pointer",
                        boxShadow: `4px 4px 0 #000, 0 0 24px ${C.FORGE}66`,
                      }}
                    >
                      ▶ {t("arena.fight")}
                    </motion.button>
                  )}
                </div>

                {/* Roster */}
                <div>
                  <div
                    className="font-pixel"
                    style={{ fontSize: 10, color: C.MUTED, letterSpacing: 3, marginBottom: 10 }}
                  >
                    ▸ FIGHTER ROSTER
                  </div>
                  <ProjectRoster
                    available={available}
                    challenger={challenger}
                    defender={defender}
                    onSelect={handleRosterSelect}
                  />
                </div>
              </motion.div>
            )}

            {/* ═══ BATTLE / RESULT ═══ */}
            {inBattle && challenger && defender && (
              <div style={{ position: "relative" }}>
                {/* Portraits facing each other on stage */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginBottom: 20,
                    paddingBottom: 90,
                  }}
                >
                  <motion.div
                    animate={{ x: attackingSide === "left" ? 20 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PortraitTile project={challenger} side="left" color={C.GREEN} />
                  </motion.div>
                  <motion.div
                    animate={{ x: attackingSide === "right" ? -20 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PortraitTile project={defender} side="right" color={C.RED} />
                  </motion.div>
                </div>

                {/* K.O. banner on result */}
                {phase === "result" && result?.winner && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      textAlign: "center",
                      padding: "12px 20px",
                      marginBottom: 16,
                      border: `3px solid ${C.CREAM}`,
                      background: `linear-gradient(90deg, ${C.FORGE}1F, ${C.CREAM}15, ${C.FORGE}1F)`,
                      boxShadow: `0 0 32px ${C.FORGE}88`,
                    }}
                  >
                    <div
                      className="font-pixel"
                      style={{
                        fontSize: 28,
                        color: C.CREAM,
                        letterSpacing: 8,
                        textShadow: `4px 4px 0 #000, 0 0 24px ${C.FORGE}`,
                      }}
                    >
                      ✦ K.O. ✦
                    </div>
                    <div
                      className="font-pixel"
                      style={{
                        fontSize: 10,
                        color: C.YELLOW,
                        letterSpacing: 3,
                        marginTop: 4,
                      }}
                    >
                      WINNER: {result.winner === challenger.id ? challenger.title : defender.title}
                    </div>
                  </motion.div>
                )}

                <BattlePhase
                  challenger={challenger}
                  defender={defender}
                  attackingSide={attackingSide}
                  battleLog={battleLog}
                  phase={phase}
                  onRematch={handleRematch}
                  onNewMatch={handleNewMatch}
                />
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard accordion */}
        <div
          style={{
            position: "relative",
            background: C.PANEL,
            border: `3px solid ${C.BORDER}`,
            borderTop: "none",
            marginTop: 0,
          }}
        >
          <button
            type="button"
            onClick={() => setLeaderboardOpen((v) => !v)}
            className="font-pixel"
            style={{
              width: "100%",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "transparent",
              border: "none",
              color: C.CYAN,
              letterSpacing: 3,
              fontSize: 11,
              cursor: "pointer",
              textShadow: `0 0 6px ${C.CYAN}44`,
            }}
          >
            <span>◆ SEASON LEADERBOARD</span>
            <span style={{ color: C.MUTED }}>{leaderboardOpen ? "▼" : "▶"}</span>
          </button>
          {leaderboardOpen && (
            <div style={{ borderTop: `1px dashed ${C.BORDER}`, padding: "14px 18px" }}>
              <SeasonLeaderboard />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
