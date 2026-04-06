"use client";

import { motion, AnimatePresence } from "framer-motion";

interface CriticalHitProps {
  show: boolean;
  text?: string;
  variant?: "critical" | "superEffective" | "expGain";
  className?: string;
}

const VARIANTS = {
  critical: {
    text: "CRITICAL HIT!",
    color: "#facc15",
    shadow: "#ef4444",
  },
  superEffective: {
    text: "SUPER EFFECTIVE!",
    color: "#22c55e",
    shadow: "#059669",
  },
  expGain: {
    text: "+EXP",
    color: "#a855f7",
    shadow: "#7c3aed",
  },
};

export function CriticalHit({
  show,
  text,
  variant = "critical",
  className = "",
}: CriticalHitProps) {
  const config = VARIANTS[variant];
  const displayText = text || config.text;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`pointer-events-none fixed inset-0 z-[9998] flex items-center justify-center ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          <motion.div
            className="font-pixel text-3xl sm:text-5xl uppercase tracking-wider"
            style={{
              color: config.color,
              textShadow: `
                3px 3px 0 ${config.shadow},
                -1px -1px 0 ${config.shadow},
                1px -1px 0 ${config.shadow},
                -1px 1px 0 ${config.shadow}
              `,
              WebkitTextStroke: `1px ${config.shadow}`,
            }}
            initial={{ opacity: 0, scale: 0.3, y: 20 }}
            animate={{
              opacity: [0, 1, 1, 1, 0],
              scale: [0.3, 1.4, 0.95, 1, 1],
              y: [20, -10, 0, 0, -20],
            }}
            transition={{
              duration: 1.2,
              times: [0, 0.25, 0.45, 0.7, 1],
              ease: "easeOut",
            }}
          >
            {displayText}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
