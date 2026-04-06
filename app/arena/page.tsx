"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useLang } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { projects } from "@/lib/mock-data";
import type { Project, BattleResult, BattleRound } from "@/lib/types";
import { simulateBattle, getBattleSummary } from "@/lib/battle-engine";
import { CLASS_CONFIG, EVOLUTION_CONFIG } from "@/lib/rpg-utils";

/* ─── Terminal Typewriter Hook ─── */
function useTypewriter(text: string, speed = 30, trigger = true) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!trigger) { setDisplayed(""); setDone(false); return; }
    setDisplayed("");
    setDone(false);
    let i = 0;
    const t = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(t); setDone(true); }
    }, speed);
    return () => clearInterval(t);
  }, [text, speed, trigger]);

  return { displayed, done };
}

/* ─── Terminal Line Component ─── */
function TermLine({
  prefix = ">",
  color = "#39FF14",
  children,
  delay = 0,
}: {
  prefix?: string;
  color?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.15 }}
      className="font-retro"
      style={{ fontSize: "18px", lineHeight: "1.6", color: "#E8E8EC" }}
    >
      <span style={{ color, marginRight: 8 }}>{prefix}</span>
      {children}
    </motion.div>
  );
}

/* ─── Pixel HP Bar ─── */
function PixelBar({
  label,
  value,
  max,
  type,
}: {
  label: string;
  value: number;
  max: number;
  type: "hp" | "mp" | "exp";
}) {
  const pct = Math.min(100, (value / max) * 100);
  const colors = {
    hp: pct > 50 ? "#39FF14" : pct > 25 ? "#FACC15" : "#FF4500",
    mp: "#06B6D4",
    exp: "#9D00FF",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span className="font-pixel" style={{ fontSize: 7, color: colors[type], width: 24 }}>
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: 12,
          background: "#0A0A0C",
          border: "2px solid #2A2A30",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: "100%",
            background: colors[type],
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "repeating-linear-gradient(90deg, transparent 0, transparent 5px, rgba(0,0,0,0.3) 5px, rgba(0,0,0,0.3) 7px)",
            }}
          />
        </motion.div>
      </div>
      <span className="font-pixel" style={{ fontSize: 7, color: "#8888A0", width: 55, textAlign: "right" }}>
        {value}/{max}
      </span>
    </div>
  );
}

/* ─── Fighter Panel (Pokemon Battle Style) ─── */
function FighterPanel({
  project,
  side,
  isAttacking,
}: {
  project: Project;
  side: "left" | "right";
  isAttacking?: boolean;
}) {
  const hero = project.hero!;
  const cls = CLASS_CONFIG[hero.heroClass];
  const evo = EVOLUTION_CONFIG[hero.evolutionStage];

  return (
    <div style={{ textAlign: side === "right" ? "right" : "left" }}>
      {/* Name + Level */}
      <div
        style={{
          display: "flex",
          alignItems: side === "right" ? "flex-end" : "flex-start",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {side === "left" && (
            <span className="font-pixel" style={{ fontSize: 10, color: "#E8E8EC" }}>
              {project.title}
            </span>
          )}
          <span
            className="font-pixel"
            style={{
              fontSize: 8,
              color: "#0D0D0D",
              background: cls.color,
              padding: "2px 6px",
            }}
          >
            Lv{hero.level}
          </span>
          {side === "right" && (
            <span className="font-pixel" style={{ fontSize: 10, color: "#E8E8EC" }}>
              {project.title}
            </span>
          )}
        </div>

        <span className="font-pixel" style={{ fontSize: 7, color: cls.color }}>
          {hero.heroClass} · {evo.label}
        </span>
      </div>

      {/* HP/MP bars */}
      <div style={{ marginTop: 8, maxWidth: 280 }}>
        <PixelBar label="HP" value={hero.hp} max={hero.maxHp} type="hp" />
        <div style={{ height: 3 }} />
        <PixelBar label="MP" value={hero.mp} max={hero.maxMp} type="mp" />
      </div>

      {/* Sprite area */}
      <motion.div
        animate={
          isAttacking
            ? { x: side === "left" ? [0, 20, 0] : [0, -20, 0] }
            : { y: [0, -4, 0] }
        }
        transition={
          isAttacking
            ? { duration: 0.3, ease: "easeInOut" }
            : { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }
        style={{
          width: 64,
          height: 64,
          margin: side === "right" ? "12px 0 0 auto" : "12px 0 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `2px solid ${cls.color}40`,
          background: `${cls.color}08`,
          fontSize: 32,
        }}
      >
        {hero.heroClass === "Architect" && "🏗️"}
        {hero.heroClass === "Artisan" && "🎨"}
        {hero.heroClass === "Enchanter" && "✨"}
        {hero.heroClass === "Alchemist" && "🧪"}
        {hero.heroClass === "Sentinel" && "🛡️"}
      </motion.div>
    </div>
  );
}

/* ─── Main Arena Page ─── */
export default function ArenaPage() {
  const [challenger, setChallenger] = useState<Project | null>(null);
  const [defender, setDefender] = useState<Project | null>(null);
  const [phase, setPhase] = useState<"select" | "flash" | "battle" | "result">("select");
  const [result, setResult] = useState<BattleResult | null>(null);
  const [currentRound, setCurrentRound] = useState(-1);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [showCrit, setShowCrit] = useState(false);
  const [attackingSide, setAttackingSide] = useState<"left" | "right" | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
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

  // Auto-scroll battle log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [battleLog]);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
      {/* ═══ Critical Hit Overlay ═══ */}
      <AnimatePresence>
        {showCrit && (
          <motion.div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9998,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="font-pixel"
              style={{
                fontSize: 36,
                color: "#FACC15",
                textShadow:
                  "3px 3px 0 #B8860B, -2px -2px 0 #B8860B, 0 0 40px rgba(250,204,21,0.5)",
                letterSpacing: 4,
              }}
              initial={{ scale: 0.3, y: 20 }}
              animate={{ scale: [0.3, 1.5, 1], y: [20, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              {t("arena.criticalHit")}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Flash Overlay ═══ */}
      <AnimatePresence>
        {phase === "flash" && (
          <motion.div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "white",
              pointerEvents: "none",
            }}
            animate={{ opacity: [0, 1, 0, 1, 0, 0.8, 0] }}
            transition={{ duration: 1, times: [0, 0.12, 0.2, 0.32, 0.4, 0.52, 0.6] }}
          />
        )}
      </AnimatePresence>

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
        <span className="font-pixel" style={{ fontSize: 8, color: "#555", letterSpacing: 2 }}>
          VIBECODE://ARENA v2.0
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
          {/* ─── BOOT SEQUENCE ─── */}
          <TermLine color="#555" prefix="$" delay={0}>
            vibecode-arena --mode battle
          </TermLine>
          <TermLine color="#39FF14" prefix=">" delay={0.1}>
            <span style={{ color: "#39FF14" }}>{t("arena.battleArena")}</span>
            <span style={{ color: "#555" }}> // {t("arena.aiCombat")}</span>
          </TermLine>
          <div style={{ height: 16 }} />

          {/* ═══ SELECT PHASE ═══ */}
          {phase === "select" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Quick actions */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <button
                  className="nes-btn is-error"
                  style={{ fontSize: 10, padding: "6px 16px" }}
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
                    className="nes-btn is-success"
                    style={{ fontSize: 10, padding: "6px 16px" }}
                    onClick={startBattle}
                  >
                    {`▶ ${t("arena.fight")}`}
                  </button>
                )}
              </div>

              {/* Fighter slots */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 1fr", gap: 16, alignItems: "start" }}>
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
                      <span className="font-pixel" style={{ fontSize: 7, color: "#555" }}>
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
                      <span className="font-pixel" style={{ fontSize: 7, color: "#555" }}>
                        {t("arena.selectBelow")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Project roster */}
              <div style={{ marginTop: 24 }}>
                <TermLine color="#9D00FF" prefix="[">
                  {`${t("arena.roster")} ]`}
                </TermLine>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: 6,
                    marginTop: 8,
                  }}
                >
                  {available.map((p) => {
                    const hero = p.hero!;
                    const cls = CLASS_CONFIG[hero.heroClass];
                    const selected = p.id === challenger?.id || p.id === defender?.id;

                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (selected) return;
                          if (!challenger) setChallenger(p);
                          else if (!defender) setDefender(p);
                          else { setChallenger(p); setDefender(null); }
                        }}
                        style={{
                          background: selected ? `${cls.color}15` : "#111114",
                          border: `2px solid ${selected ? cls.color : "#2A2A30"}`,
                          padding: "8px 10px",
                          textAlign: "left",
                          cursor: selected ? "default" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          transition: "border-color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          if (!selected) (e.currentTarget.style.borderColor = cls.color);
                        }}
                        onMouseLeave={(e) => {
                          if (!selected) (e.currentTarget.style.borderColor = "#2A2A30");
                        }}
                      >
                        <span
                          className="font-pixel"
                          style={{ fontSize: 7, color: "#0D0D0D", background: cls.color, padding: "1px 4px" }}
                        >
                          {hero.level}
                        </span>
                        <span className="font-pixel" style={{ fontSize: 7, color: "#E8E8EC", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.title}
                        </span>
                        <span className="font-pixel" style={{ fontSize: 6, color: cls.color }}>
                          {hero.heroClass.slice(0, 3).toUpperCase()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ BATTLE PHASE ═══ */}
          {(phase === "battle" || phase === "result") && challenger && defender && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Fighter HUDs */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", gap: 12, marginBottom: 20 }}>
                <FighterPanel project={challenger} side="left" isAttacking={attackingSide === "left"} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="font-pixel" style={{ fontSize: 10, color: "#FF4500" }}>VS</span>
                </div>
                <FighterPanel project={defender} side="right" isAttacking={attackingSide === "right"} />
              </div>

              {/* Battle Log (RPGUI golden frame) */}
              <div
                ref={logRef}
                className="rpgui-container framed-golden"
                style={{
                  maxHeight: 320,
                  overflowY: "auto",
                  fontFamily: "var(--font-retro)",
                  fontSize: 18,
                  lineHeight: 1.5,
                  padding: 16,
                }}
              >
                {battleLog.map((line, i) => {
                  let color = "#8888A0";
                  if (line.includes("[SYSTEM]")) color = "#555";
                  else if (line.includes("CRITICAL")) color = "#FACC15";
                  else if (line.includes("WIN") || line.includes("defeats")) color = "#39FF14";
                  else if (line.includes("LOSE")) color = "#FF4500";
                  else if (line.includes("Round")) color = "#9D00FF";
                  else if (line.includes("═")) color = "#333";
                  else if (line.includes("EXP")) color = "#9D00FF";
                  else if (line.includes("vs")) color = "#E8E8EC";

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.05 }}
                      style={{ color, whiteSpace: "pre-wrap" }}
                    >
                      {line || "\u00A0"}
                    </motion.div>
                  );
                })}
                {phase === "battle" && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 16,
                      background: "#FF4500",
                      animation: "blink-cursor 0.6s step-end infinite",
                    }}
                  />
                )}
              </div>

              {/* Result actions */}
              {phase === "result" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  style={{ marginTop: 16, display: "flex", gap: 8 }}
                >
                  <button
                    className="nes-btn is-error"
                    style={{ fontSize: 10, padding: "6px 16px" }}
                    onClick={() => {
                      setPhase("select");
                      setResult(null);
                      setBattleLog([]);
                      setCurrentRound(-1);
                    }}
                  >
                    {`⚔ ${t("arena.rematch")}`}
                  </button>
                  <button
                    className="nes-btn"
                    style={{ fontSize: 10, padding: "6px 16px" }}
                    onClick={() => {
                      setPhase("select");
                      setResult(null);
                      setBattleLog([]);
                      setCurrentRound(-1);
                      setChallenger(null);
                      setDefender(null);
                    }}
                  >
                    {`↻ ${t("arena.newMatch")}`}
                  </button>
                </motion.div>
              )}
            </motion.div>
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

      {/* Cursor blink keyframes */}
      <style>{`
        @keyframes blink-cursor {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
