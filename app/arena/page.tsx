"use client";

import { useState, useCallback } from "react";
import { useLang } from "@/lib/i18n";
import { motion } from "framer-motion";
import { useProjects } from "@/lib/use-data";
import type { Project, BattleResult } from "@/lib/types";
import { simulateBattle, getBattleSummary } from "@/lib/battle-engine";
import { SeasonLeaderboard } from "@/components/arena/season-leaderboard";
import { onBattleWon } from "@/lib/feed-events";
import { FighterPanel } from "@/components/arena/battle-hud-display";
import { ProjectRoster } from "@/components/arena/project-roster";
import { BattlePhase } from "@/components/arena/battle-result";
import { CriticalHitOverlay, FlashOverlay } from "@/components/arena/battle-narrative";

/* ─── Direction A palette ─── */
const C = {
  BG: "#0D0D0D",
  PANEL: "#111114",
  CARD: "#161619",
  BORDER: "#3A3A42",
  WIRE: "#2A2A30",
  TEXT: "#E8E8EC",
  MUTED: "#8B7AA0",
  DIM: "#8A7B9A",
  FORGE: "#FF4500",
  CREAM: "#FFE27D",
  GREEN: "#39FF14",
  YELLOW: "#FACC15",
  CYAN: "#06B6D4",
  PURPLE: "#9D00FF",
};

function LCorner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const isTop = pos.startsWith("t");
  const isLeft = pos.endsWith("l");
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        width: 14,
        height: 14,
        [isTop ? "top" : "bottom"]: -2,
        [isLeft ? "left" : "right"]: -2,
        [isTop ? "borderTop" : "borderBottom"]: `3px solid ${C.FORGE}`,
        [isLeft ? "borderLeft" : "borderRight"]: `3px solid ${C.FORGE}`,
        zIndex: 2,
        pointerEvents: "none",
      }}
    />
  );
}

/* ─── VS medallion (center circle during select phase) ─── */
function VSMedallion() {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      style={{
        position: "relative",
        width: 84,
        height: 84,
        borderRadius: "50%",
        background: `radial-gradient(closest-side, ${C.FORGE}33, transparent 70%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 8,
          border: `3px solid ${C.FORGE}`,
          borderRadius: "50%",
          boxShadow: `0 0 24px ${C.FORGE}66, inset 0 0 12px ${C.FORGE}44`,
        }}
      />
      <span
        className="font-pixel"
        style={{
          fontSize: 22,
          color: C.CREAM,
          letterSpacing: 2,
          textShadow: `3px 3px 0 #000, 0 0 16px ${C.FORGE}`,
          zIndex: 1,
        }}
      >
        VS
      </span>
    </motion.div>
  );
}

export default function ArenaPage() {
  const { data: projects } = useProjects();
  const [challenger, setChallenger] = useState<Project | null>(null);
  const [defender, setDefender] = useState<Project | null>(null);
  const [phase, setPhase] = useState<"select" | "flash" | "battle" | "result">("select");
  const [result, setResult] = useState<BattleResult | null>(null);
  const [, setCurrentRound] = useState(-1);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [showCrit, setShowCrit] = useState(false);
  const [attackingSide, setAttackingSide] = useState<"left" | "right" | null>(null);
  const [, setAiNarrative] = useState<{intro: string; roundNarratives: string[]; conclusion: string; mvpComment: string} | null>(null);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const { t } = useLang();

  const available = projects.filter((p) => p.hero);

  const pickRandom = (exclude?: string) => {
    const pool = exclude ? available.filter((p) => p.id !== exclude) : available;
    return pool[Math.floor(Math.random() * pool.length)];
  };

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
            .then((resp) => {
              if (!resp.ok) throw new Error("AI narrative request failed");
              return resp.json();
            })
            .then((data) => {
              setAiNarrative(data);
              const narrativeLines: string[] = [
                ``,
                `═══ AI Battle Commentary ═══`,
                data.intro,
                ...data.roundNarratives,
                data.conclusion,
                data.mvpComment,
              ];
              setBattleLog((l) => [...l, ...narrativeLines]);
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
    }, 1000);
  }, [challenger, defender]);

  const handleRosterSelect = (p: Project) => {
    if (!challenger) setChallenger(p);
    else if (!defender) setDefender(p);
    else { setChallenger(p); setDefender(null); }
  };

  const handleRematch = () => {
    setPhase("select");
    setResult(null);
    setBattleLog([]);
    setCurrentRound(-1);
  };

  const handleNewMatch = () => {
    setPhase("select");
    setResult(null);
    setBattleLog([]);
    setCurrentRound(-1);
    setChallenger(null);
    setDefender(null);
  };

  const totalRounds = result?.rounds.length ?? 0;
  const isLegendVictory =
    phase === "result" && result?.winner && totalRounds >= 5;

  return (
    <div
      className="relative min-h-full overflow-hidden"
      style={{ background: C.BG, color: C.TEXT }}
    >
      <CriticalHitOverlay show={showCrit} />
      <FlashOverlay show={phase === "flash"} />

      {/* Coliseum ember glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[420px] w-[620px] rounded-full"
        style={{ background: `radial-gradient(closest-side, ${C.FORGE}2A, transparent 70%)` }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Terminal header */}
        <div
          style={{
            background: C.PANEL,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `2px solid ${C.BORDER}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, background: "#FF5F57", display: "inline-block" }} />
            <span style={{ width: 10, height: 10, background: "#FEBC2E", display: "inline-block" }} />
            <span style={{ width: 10, height: 10, background: "#28C840", display: "inline-block" }} />
          </div>
          <span className="font-pixel" style={{ fontSize: 9, color: C.MUTED, letterSpacing: 3 }}>
            <span style={{ color: C.FORGE }}>▸</span> VIBEXFORGE://ARENA v2.0
          </span>
          <span className="font-pixel" style={{ fontSize: 7, color: C.BORDER }}>━━━</span>
        </div>

        <h1 className="sr-only">{t("arena.battleArena")}</h1>

        {/* ═══ ARENA STAGE ═══ */}
        <div
          style={{
            position: "relative",
            background: C.PANEL,
            border: `1px solid ${C.BORDER}`,
            borderTop: "none",
            padding: "28px 24px",
            marginBottom: 16,
            minHeight: "60vh",
          }}
        >
          <LCorner pos="tl" />
          <LCorner pos="tr" />
          <LCorner pos="bl" />
          <LCorner pos="br" />

          {/* Scanline */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,0.08) 2px 4px)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 2 }}>
            {/* Hero title */}
            <div className="text-center mb-6">
              <div
                className="font-pixel"
                style={{ fontSize: 10, color: C.FORGE, letterSpacing: 6, marginBottom: 8 }}
              >
                ▸ THE COLISEUM
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

            {/* ═══ SELECT PHASE ═══ */}
            {phase === "select" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Action bar */}
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
                    aria-label="Random match"
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
                    <button
                      type="button"
                      aria-label="Fight"
                      onClick={startBattle}
                      className="font-pixel"
                      style={{
                        fontSize: 13,
                        padding: "12px 32px",
                        color: "#000",
                        background: C.FORGE,
                        border: `2px solid ${C.CREAM}`,
                        letterSpacing: 4,
                        cursor: "pointer",
                        boxShadow: `3px 3px 0 #000, 0 0 20px ${C.FORGE}66`,
                      }}
                    >
                      ▶ {t("arena.fight")}
                    </button>
                  )}
                </div>

                {/* Fighter sheets flanking VS medallion */}
                <div
                  className="grid items-start"
                  style={{
                    gridTemplateColumns: "1fr auto 1fr",
                    gap: 20,
                  }}
                >
                  {/* Challenger (P1) */}
                  <div style={{ position: "relative" }}>
                    <div
                      className="font-pixel"
                      style={{ fontSize: 10, color: C.GREEN, letterSpacing: 3, marginBottom: 10 }}
                    >
                      <span style={{ color: C.GREEN }}>▸</span> P1 · {t("arena.challenger")}
                    </div>
                    {challenger ? (
                      <div
                        style={{
                          position: "relative",
                          border: `2px solid ${C.GREEN}`,
                          background: `${C.GREEN}08`,
                          padding: 14,
                          boxShadow: `3px 3px 0 #000, 0 0 16px ${C.GREEN}33`,
                        }}
                      >
                        <FighterPanel project={challenger} side="left" />
                      </div>
                    ) : (
                      <div
                        style={{
                          border: `2px dashed ${C.BORDER}`,
                          padding: 28,
                          textAlign: "center",
                          background: `${C.PANEL}`,
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

                  {/* VS medallion */}
                  <div style={{ display: "flex", alignItems: "center", paddingTop: 36 }}>
                    <VSMedallion />
                  </div>

                  {/* Defender (P2) */}
                  <div style={{ position: "relative" }}>
                    <div
                      className="font-pixel"
                      style={{
                        fontSize: 10,
                        color: C.FORGE,
                        letterSpacing: 3,
                        marginBottom: 10,
                        textAlign: "right",
                      }}
                    >
                      P2 · {t("arena.defender")} <span style={{ color: C.FORGE }}>◂</span>
                    </div>
                    {defender ? (
                      <div
                        style={{
                          position: "relative",
                          border: `2px solid ${C.FORGE}`,
                          background: `${C.FORGE}08`,
                          padding: 14,
                          boxShadow: `3px 3px 0 #000, 0 0 16px ${C.FORGE}33`,
                        }}
                      >
                        <FighterPanel project={defender} side="right" />
                      </div>
                    ) : (
                      <div
                        style={{
                          border: `2px dashed ${C.BORDER}`,
                          padding: 28,
                          textAlign: "center",
                          background: `${C.PANEL}`,
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

                {/* Roster */}
                <div style={{ marginTop: 28 }}>
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

            {/* ═══ BATTLE / RESULT PHASES ═══ */}
            {(phase === "battle" || phase === "result") && challenger && defender && (
              <div>
                {/* Round counter chip */}
                {phase === "battle" && totalRounds > 0 && (
                  <div
                    className="font-pixel"
                    style={{
                      display: "inline-block",
                      fontSize: 10,
                      color: C.YELLOW,
                      padding: "6px 14px",
                      border: `2px solid ${C.YELLOW}`,
                      background: `${C.YELLOW}11`,
                      letterSpacing: 3,
                      marginBottom: 16,
                      boxShadow: `0 0 12px ${C.YELLOW}44`,
                    }}
                  >
                    ▸ ROUND · {totalRounds} TOTAL
                  </div>
                )}

                {/* Victory banner */}
                {isLegendVictory && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{
                      marginBottom: 16,
                      padding: "14px 20px",
                      border: `2px solid ${C.CREAM}`,
                      background: `linear-gradient(90deg, ${C.FORGE}1F, ${C.CREAM}15, ${C.FORGE}1F)`,
                      textAlign: "center",
                      boxShadow: `0 0 24px ${C.FORGE}66`,
                    }}
                  >
                    <span
                      className="font-pixel"
                      style={{
                        fontSize: 14,
                        color: C.CREAM,
                        letterSpacing: 6,
                        textShadow: `2px 2px 0 #000, 0 0 12px ${C.FORGE}`,
                      }}
                    >
                      ✦ LEGENDARY BATTLE ✦
                    </span>
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

        {/* ═══ Season Leaderboard — accordion ═══ */}
        <div
          style={{
            position: "relative",
            background: C.PANEL,
            border: `1px solid ${C.BORDER}`,
            overflow: "hidden",
          }}
        >
          <LCorner pos="tl" />
          <LCorner pos="tr" />
          <LCorner pos="bl" />
          <LCorner pos="br" />
          <button
            type="button"
            onClick={() => setLeaderboardOpen((v) => !v)}
            aria-expanded={leaderboardOpen}
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
            <div
              style={{
                borderTop: `1px dashed ${C.BORDER}`,
                padding: "14px 18px",
              }}
            >
              <SeasonLeaderboard />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
