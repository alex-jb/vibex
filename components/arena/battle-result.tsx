"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import type { Project } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import { FighterPanel } from "./battle-hud-display";

export function BattlePhase({
  challenger,
  defender,
  attackingSide,
  battleLog,
  phase,
  onRematch,
  onNewMatch,
}: {
  challenger: Project;
  defender: Project;
  attackingSide: "left" | "right" | null;
  battleLog: string[];
  phase: "battle" | "result";
  onRematch: () => void;
  onNewMatch: () => void;
}) {
  const { t } = useLang();
  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll battle log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [battleLog]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Fighter HUDs */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_40px_1fr] gap-3" style={{ marginBottom: 20 }}>
        <FighterPanel project={challenger} side="left" isAttacking={attackingSide === "left"} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span className="font-pixel" style={{ fontSize: 10, color: "#FF4500" }}>VS</span>
        </div>
        <FighterPanel project={defender} side="right" isAttacking={attackingSide === "right"} />
      </div>

      {/* Battle Log (RPGUI golden frame) */}
      <div
        ref={logRef}
        role="log"
        className="rpgui-container framed-golden max-h-52 sm:max-h-64 md:max-h-80"
        style={{
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
          else if (line.includes("AI Battle Commentary")) color = "#06B6D4";
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
            style={{ fontSize: 10, padding: "10px 16px" }}
            onClick={onRematch}
          >
            {`⚔ ${t("arena.rematch")}`}
          </button>
          <button
            className="nes-btn"
            style={{ fontSize: 10, padding: "10px 16px" }}
            onClick={onNewMatch}
          >
            {`↻ ${t("arena.newMatch")}`}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
