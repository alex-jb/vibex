"use client";

import { motion } from "framer-motion";

interface RetroLoaderProps {
  label?: string;
  fullScreen?: boolean;
}

/**
 * On-brand 16-bit loading indicator.
 * Pixel-art spinner + blinking LOADING... label + scanline background.
 * Used as route-level loading.tsx fallback and inline suspense.
 */
export function RetroLoader({ label = "LOADING", fullScreen = true }: RetroLoaderProps) {
  return (
    <div
      className={`relative flex items-center justify-center ${
        fullScreen ? "min-h-[60vh] w-full" : ""
      }`}
      style={{ background: fullScreen ? "var(--bg-deep)" : "transparent" }}
      role="status"
      aria-live="polite"
      aria-label={`${label}...`}
    >
      {/* Scanline overlay for retro feel */}
      {fullScreen && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(157,0,255,0.05) 2px, rgba(157,0,255,0.05) 3px)",
          }}
        />
      )}

      <div className="relative flex flex-col items-center gap-5">
        {/* Pixel spinner — 8 rotating squares */}
        <div className="relative" style={{ width: 48, height: 48 }}>
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 45 * Math.PI) / 180;
            const radius = 18;
            const x = 24 + Math.cos(angle) * radius - 3;
            const y = 24 + Math.sin(angle) * radius - 3;
            return (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: x,
                  top: y,
                  width: 6,
                  height: 6,
                  background: "var(--neon-purple)",
                  boxShadow: "0 0 6px rgba(157,0,255,0.8)",
                }}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{
                  duration: 1,
                  delay: i * 0.12,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </div>

        {/* Blinking LOADING label */}
        <motion.span
          className="font-pixel"
          style={{
            fontSize: 10,
            letterSpacing: 4,
            color: "var(--neon-green)",
            textShadow: "0 0 8px rgba(57,255,20,0.6)",
          }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
          {label}...
        </motion.span>
      </div>
    </div>
  );
}
