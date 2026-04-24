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
import { TermLine, CriticalHitOverlay, FlashOverlay } from "@/components/arena/battle-narrative";

/* ─── Main Arena Page ─── */
export default function ArenaPage() {
  const { data: projects } = useProjects();
  const [challenger, setChallenger] = useState<Project | null>(null);
  const [defender, setDefender] = useState<Project | null>(null);
  const [phase, setPhase] = useState<"select" | "flash" | "battle" | "result">("select");
  const [, setResult] = useState<BattleResult | null>(null);
  const [, setCurrentRound] = useState(-1);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [showCrit, setShowCrit] = useState(false);
  const [attackingSide, setAttackingSide] = useState<"left" | "right" | null>(null);
  const [, setAiNarrative] = useState<{intro: string; roundNarratives: string[]; conclusion: string; mvpComment: string} | null>(null);
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

    // Post-battle: record outcome + auto-post to feed
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

    // Flash transition
    setPhase("flash");
    setTimeout(() => {
      setPhase("battle");

      // Play rounds
      let idx = 0;
      const playRound = () => {
        if (idx >= res.rounds.length) {
          // Battle complete
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

          // Fetch AI-generated battle narrative
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
            .catch(() => {
              // Silently skip — existing battle log is sufficient
            });

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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* ═══ Critical Hit Overlay ═══ */}
      <CriticalHitOverlay show={showCrit} />

      {/* ═══ Flash Overlay ═══ */}
      <FlashOverlay show={phase === "flash"} />

      {/* ═══ Terminal Header ═══ */}
      <div
        style={{
          background: "#0A0A0C",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "2px solid #2A2A30",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 10, height: 10, background: "#FF4500", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, background: "#FACC15", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, background: "#39FF14", display: "inline-block" }} />
          <span className="rpgui-icon sword small" style={{ width: 16, height: 16, marginLeft: 4 }} />
        </div>
        <span className="font-pixel" style={{ fontSize: 8, color: "#9a9a9a", letterSpacing: 2 }}>
          VIBEXFORGE://ARENA v2.0
        </span>
        <span className="font-pixel" style={{ fontSize: 7, color: "#333" }}>
          ━━━
        </span>
      </div>

      {/* ═══ Main Terminal Body (RPGUI framed) ═══ */}
      <div
        className="rpgui-container framed"
        style={{
          minHeight: "70vh",
          padding: 20,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Scanline effect inside terminal */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        <div style={{ position: "relative", zIndex: 2 }}>
          {/* sr-only H1 so crawlers + screen readers get a proper page heading.
              Visual title lives inside TermLine below as part of the boot-log
              animation and can't carry role=heading without breaking the CRT vibe. */}
          <h1 className="sr-only">{t("arena.battleArena")}</h1>
          {/* ─── BOOT SEQUENCE ─── */}
          <TermLine color="#9a9a9a" prefix="$" delay={0}>
            vibecode-arena --mode battle
          </TermLine>
          <TermLine color="#39FF14" prefix=">" delay={0.1}>
            <span style={{ color: "#39FF14" }}>{t("arena.battleArena")}</span>
            <span style={{ color: "#9a9a9a" }}>{" // "}{t("arena.aiCombat")}</span>
          </TermLine>
          <div style={{ height: 16 }} />

          {/* ═══ SELECT PHASE ═══ */}
          {phase === "select" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Quick actions */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <button
                  aria-label="Random match"
                  className="nes-btn is-error"
                  style={{ fontSize: 10, padding: "10px 16px" }}
                  onClick={() => {
                    const c = pickRandom();
                    const d = pickRandom(c.id);
                    setChallenger(c);
                    setDefender(d);
                  }}
                >
                  {`⚔ ${t("arena.randomMatch")}`}
                </button>
                {challenger && defender && (
                  <button
                    aria-label="Fight"
                    className="nes-btn is-success"
                    style={{ fontSize: 10, padding: "10px 16px" }}
                    onClick={startBattle}
                  >
                    {`▶ ${t("arena.fight")}`}
                  </button>
                )}
              </div>

              {/* Fighter slots */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_60px_1fr] gap-4" style={{ alignItems: "start" }}>
                {/* Challenger */}
                <div>
                  <TermLine color="#39FF14" prefix="P1">
                    {t("arena.challenger")}
                  </TermLine>
                  {challenger ? (
                    <div
                      style={{
                        border: "2px solid #39FF1440",
                        background: "#39FF1408",
                        padding: 12,
                        marginTop: 8,
                      }}
                    >
                      <FighterPanel project={challenger} side="left" />
                    </div>
                  ) : (
                    <div
                      style={{
                        border: "2px dashed #2A2A30",
                        padding: 24,
                        marginTop: 8,
                        textAlign: "center",
                      }}
                    >
                      <span className="font-pixel" style={{ fontSize: 7, color: "#9a9a9a" }}>
                        {t("arena.selectBelow")}
                      </span>
                    </div>
                  )}
                </div>

                {/* VS */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 40 }}>
                  <span
                    className="font-pixel"
                    style={{
                      fontSize: 14,
                      color: "#FF4500",
                      textShadow: "0 0 20px #FF450060",
                    }}
                  >
                    VS
                  </span>
                </div>

                {/* Defender */}
                <div>
                  <TermLine color="#FF4500" prefix="P2">
                    {t("arena.defender")}
                  </TermLine>
                  {defender ? (
                    <div
                      style={{
                        border: "2px solid #FF450040",
                        background: "#FF450008",
                        padding: 12,
                        marginTop: 8,
                      }}
                    >
                      <FighterPanel project={defender} side="right" />
                    </div>
                  ) : (
                    <div
                      style={{
                        border: "2px dashed #2A2A30",
                        padding: 24,
                        marginTop: 8,
                        textAlign: "center",
                      }}
                    >
                      <span className="font-pixel" style={{ fontSize: 7, color: "#9a9a9a" }}>
                        {t("arena.selectBelow")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Project roster */}
              <ProjectRoster
                available={available}
                challenger={challenger}
                defender={defender}
                onSelect={handleRosterSelect}
              />
            </motion.div>
          )}

          {/* ═══ BATTLE PHASE ═══ */}
          {(phase === "battle" || phase === "result") && challenger && defender && (
            <BattlePhase
              challenger={challenger}
              defender={defender}
              attackingSide={attackingSide}
              battleLog={battleLog}
              phase={phase}
              onRematch={handleRematch}
              onNewMatch={handleNewMatch}
            />
          )}

          {/* ─── Terminal prompt at bottom ─── */}
          <div style={{ marginTop: 24 }}>
            <span className="font-retro" style={{ color: "#39FF14", fontSize: 18 }}>
              {">"}{" "}
            </span>
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 16,
                background: "#39FF14",
                animation: "blink-cursor 0.8s step-end infinite",
                verticalAlign: "middle",
              }}
            />
          </div>
        </div>
      </div>

      {/* Season Leaderboard */}
      <SeasonLeaderboard />

      {/* Cursor blink keyframes */}
      <style>{`
        @keyframes blink-cursor {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
