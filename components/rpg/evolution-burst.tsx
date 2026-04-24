"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { EvolutionStage } from "@/lib/types";
import { SPRITE_STAGES } from "@/lib/sprite-config";

interface EvolutionBurstProps {
  /** Set to a new stage to trigger the animation */
  stage: EvolutionStage | null;
  /** Called when animation completes */
  onComplete?: () => void;
  className?: string;
}

/** Individual particle in the burst */
function Particle({ color, delay, angle, distance }: { color: string; delay: number; angle: number; distance: number }) {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * distance;
  const y = Math.sin(rad) * distance;

  return (
    <motion.div
      initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      animate={{ opacity: 0, scale: 0.3, x, y }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      style={{
        position: "absolute",
        width: "6px",
        height: "6px",
        borderRadius: "1px",
        background: color,
        boxShadow: `0 0 8px ${color}`,
        imageRendering: "pixelated",
      }}
    />
  );
}

/** Ring expansion effect */
function ExpandRing({ color, delay }: { color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0.8, scale: 0.1 }}
      animate={{ opacity: 0, scale: 2.5 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      style={{
        position: "absolute",
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        border: `3px solid ${color}`,
        boxShadow: `0 0 20px ${color}40`,
      }}
    />
  );
}

/**
 * Evolution burst animation component.
 * Renders a pixel-art explosion effect when a project reaches a new evolution stage.
 *
 * Usage:
 *   <EvolutionBurst stage={newStage} onComplete={() => setAnimating(false)} />
 */
export function EvolutionBurst({ stage, onComplete, className = "" }: EvolutionBurstProps) {
  const [visible, setVisible] = useState(false);

  const particleCount = stage === "Myth" ? 24 : stage === "Legend" ? 18 : 12;
  const particles = useMemo(() => Array.from({ length: particleCount }, (_, i) => ({
    angle: (360 / particleCount) * i + ((i * 7 + 3) % 15),
    distance: 60 + ((i * 13 + 7) % 40),
    delay: ((i * 11 + 5) % 30) / 100,
  })), [particleCount]);

  useEffect(() => {
    if (stage) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [stage, onComplete]);

  if (!stage) return null;

  const config = SPRITE_STAGES[stage];

  return (
    <AnimatePresence>
      {visible && (
        <div
          className={`pointer-events-none fixed inset-0 z-[70] flex items-center justify-center ${className}`}
        >
          {/* Dark overlay flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-black"
          />

          {/* Center burst area */}
          <div className="relative flex items-center justify-center">
            {/* Expanding rings */}
            <ExpandRing color={config.color} delay={0} />
            <ExpandRing color={config.color} delay={0.15} />
            {(stage === "Legend" || stage === "Myth") && (
              <ExpandRing color="#FFD700" delay={0.3} />
            )}

            {/* Particles */}
            {particles.map((p, i) => (
              <Particle
                key={i}
                color={config.color}
                delay={p.delay}
                angle={p.angle}
                distance={p.distance}
              />
            ))}

            {/* Center emoji + label */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 1] }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col items-center gap-3 z-10"
            >
              {/* Glow behind emoji */}
              <div
                className="absolute inset-0 rounded-full blur-[40px]"
                style={{ background: config.glowColor, transform: "scale(3)" }}
              />

              {/* Smith-happy mascot celebrating the evolution, with the
                  stage emoji floating to its right. The mascot anchors the
                  moment on a familiar face; the emoji still conveys rarity. */}
              <motion.div
                animate={{ scale: [1, 1.08, 1], y: [0, -4, 0] }}
                transition={{ duration: 1, repeat: 2, repeatType: "reverse" }}
                style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 12 }}
              >
                <Image
                  src="/generated/smith-happy.png"
                  alt=""
                  width={96}
                  height={96}
                  unoptimized
                  style={{
                    imageRendering: "pixelated",
                    filter: `drop-shadow(0 0 16px ${config.glowColor})`,
                  }}
                />
                <span style={{ fontSize: "56px" }}>{config.emoji}</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col items-center gap-1"
              >
                <span
                  className="font-pixel text-[10px] uppercase tracking-[4px]"
                  style={{ color: config.color, textShadow: `0 0 12px ${config.glowColor}` }}
                >
                  EVOLVED TO
                </span>
                <span
                  className="font-pixel text-[16px] uppercase tracking-[3px] font-bold"
                  style={{ color: config.color, textShadow: `0 0 16px ${config.glowColor}` }}
                >
                  {config.label}
                </span>
                <span className="font-pixel text-[8px] text-muted-foreground mt-1">
                  {config.rarity}
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to detect evolution stage changes and trigger the burst.
 * Compare previous vs current stage to detect upgrades.
 */
export function useEvolutionDetector(currentStage: EvolutionStage | undefined) {
  const [prevStage, setPrevStage] = useState<EvolutionStage | undefined>(undefined);
  const [burstStage, setBurstStage] = useState<EvolutionStage | null>(null);

  useEffect(() => {
    if (prevStage && currentStage && prevStage !== currentStage) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBurstStage(currentStage);
    }
    setPrevStage(currentStage);
  }, [currentStage, prevStage]);

  const clearBurst = useCallback(() => setBurstStage(null), []);

  return { burstStage, clearBurst };
}
