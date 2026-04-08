"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/i18n";

/* ─── Terminal Typewriter Hook ─── */
export function useTypewriter(text: string, speed = 30, trigger = true) {
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
export function TermLine({
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

/* ─── Critical Hit Overlay ─── */
export function CriticalHitOverlay({ show }: { show: boolean }) {
  const { t } = useLang();

  return (
    <AnimatePresence>
      {show && (
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
  );
}

/* ─── Flash Overlay ─── */
export function FlashOverlay({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
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
  );
}
