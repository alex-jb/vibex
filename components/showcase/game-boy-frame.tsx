"use client";

import { motion } from "framer-motion";

interface GameBoyFrameProps {
  children: React.ReactNode;
  label?: string;
}

/**
 * Horizontal futuristic retro console frame.
 * Inspired by Game Boy Advance / PSP / handheld arcade terminals.
 *
 * Layout (left → right):
 *   [D-pad + tags]   [BIG SCREEN]   [LIKE / OPEN / INVEST buttons]
 *
 * Style: sleek black shell with neon purple+cyan underglow,
 * not the classic gray plastic Game Boy DMG. Futuristic, premium.
 */
export function GameBoyFrame({ children, label }: GameBoyFrameProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto"
      style={{
        width: "min(94vw, 760px)",
      }}
    >
      {/* ═══ Underglow halo (sits behind the device) ═══ */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "10% -8% -25% -8%",
          background:
            "radial-gradient(ellipse at center, rgba(157,0,255,0.45) 0%, rgba(217,70,239,0.25) 35%, rgba(6,182,212,0.15) 60%, transparent 80%)",
          filter: "blur(30px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* ═══ Main shell — horizontal pill with rounded grips ═══ */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background:
            "linear-gradient(180deg, #1a1a22 0%, #0d0d14 50%, #050508 100%)",
          border: "1px solid #2a2a35",
          borderRadius: "32px",
          padding: "20px 24px",
          boxShadow:
            "0 24px 80px rgba(0,0,0,0.7), 0 0 60px rgba(157,0,255,0.25), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -3px 12px rgba(0,0,0,0.6)",
        }}
      >
        {/* Subtle top highlight strip */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: "20%",
            right: "20%",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
            borderRadius: "0 0 50% 50%",
          }}
        />

        <div className="flex items-stretch gap-4">
          {/* ═══ LEFT GRIP: D-pad + vertical tags ═══ */}
          <div
            className="flex flex-col items-center justify-between shrink-0"
            style={{ width: 84, paddingTop: 4, paddingBottom: 4 }}
          >
            {/* D-Pad */}
            <div
              style={{
                position: "relative",
                width: 56,
                height: 56,
              }}
            >
              {/* Horizontal bar */}
              <div
                style={{
                  position: "absolute",
                  top: "33%",
                  left: 0,
                  right: 0,
                  height: "33%",
                  background: "linear-gradient(180deg, #2a2a35 0%, #0a0a10 100%)",
                  border: "1px solid #050508",
                  borderRadius: 4,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.6)",
                }}
              />
              {/* Vertical bar */}
              <div
                style={{
                  position: "absolute",
                  left: "33%",
                  top: 0,
                  bottom: 0,
                  width: "33%",
                  background: "linear-gradient(90deg, #2a2a35 0%, #0a0a10 100%)",
                  border: "1px solid #050508",
                  borderRadius: 4,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.6)",
                }}
              />
              {/* Center dot with neon glow */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 10,
                  height: 10,
                  transform: "translate(-50%, -50%)",
                  background:
                    "radial-gradient(circle, #c026d3 0%, #7a0c8c 100%)",
                  borderRadius: "50%",
                  boxShadow: "0 0 6px rgba(192,38,211,0.8)",
                  zIndex: 2,
                }}
              />
            </div>

            {/* Vertical tag stickers */}
            <div className="flex flex-col gap-1.5 items-stretch w-full mt-3">
              <div
                className="font-pixel text-center"
                style={{
                  fontSize: 6,
                  letterSpacing: 1,
                  color: "#06b6d4",
                  background: "rgba(6,182,212,0.08)",
                  border: "1px solid rgba(6,182,212,0.4)",
                  padding: "3px 4px",
                  borderRadius: 2,
                }}
              >
                #3 TRENDING
              </div>
              <div
                className="font-pixel text-center"
                style={{
                  fontSize: 6,
                  letterSpacing: 1,
                  color: "#c084fc",
                  background: "rgba(192,132,252,0.08)",
                  border: "1px solid rgba(192,132,252,0.4)",
                  padding: "3px 4px",
                  borderRadius: 2,
                }}
              >
                AI · DESIGN
              </div>
            </div>
          </div>

          {/* ═══ CENTER: SCREEN ═══ */}
          <div className="flex-1 min-w-0">
            {/* Bezel labels (top) */}
            <div
              className="flex items-center justify-between mb-1.5 px-1"
              style={{
                fontFamily: "var(--font-pixel), monospace",
                fontSize: 6,
                color: "#5a5a6a",
                letterSpacing: 1.2,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#39FF14",
                    boxShadow: "0 0 6px #39FF14",
                  }}
                />
                LIVE
              </span>
              <span>VIBEX-OS v2.0</span>
              <span>{"</> RPG"}</span>
            </div>

            {/* Screen bezel */}
            <div
              style={{
                background: "#000",
                borderRadius: 8,
                padding: 4,
                border: "1px solid #1a1a25",
                boxShadow:
                  "inset 0 0 12px rgba(0,0,0,0.9), 0 0 0 2px rgba(157,0,255,0.15), 0 0 24px rgba(157,0,255,0.2)",
              }}
            >
              {/* Actual screen */}
              <div
                style={{
                  position: "relative",
                  background: "#0a0a14",
                  border: "1px solid #2a2a35",
                  borderRadius: 4,
                  aspectRatio: "16 / 10",
                  overflow: "hidden",
                }}
              >
                {/* Scanline overlay */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    background:
                      "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 3px)",
                    zIndex: 10,
                  }}
                />
                {/* Vignette */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    background:
                      "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)",
                    zIndex: 9,
                  }}
                />
                {/* Content slot */}
                <div
                  style={{
                    position: "relative",
                    zIndex: 5,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {children}
                </div>
              </div>
            </div>

            {/* Bezel labels (bottom) */}
            <div
              className="flex items-center justify-between mt-1.5 px-1"
              style={{
                fontFamily: "var(--font-pixel), monospace",
                fontSize: 6,
                color: "#5a5a6a",
                letterSpacing: 1.2,
              }}
            >
              <span>MODE: SHOWCASE</span>
              <span style={{ color: "#9D00FF" }}>VIBE-X CONSOLE</span>
              <span>FPS: 60</span>
            </div>
          </div>

          {/* ═══ RIGHT GRIP: 3 action buttons ═══ */}
          <div className="flex flex-col items-stretch justify-center shrink-0 gap-2.5" style={{ width: 86 }}>
            {[
              { label: "LIKE", color: "#FF4D8D", glow: "rgba(255,77,141,0.6)" },
              { label: "OPEN", color: "#06B6D4", glow: "rgba(6,182,212,0.6)" },
              { label: "INVEST", color: "#FACC15", glow: "rgba(250,204,21,0.6)" },
            ].map((btn) => (
              <div
                key={btn.label}
                className="flex items-center gap-2"
                style={{
                  background: "linear-gradient(180deg, #1a1a25 0%, #0a0a10 100%)",
                  border: "1px solid #2a2a35",
                  borderRadius: 6,
                  padding: "6px 8px",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 35% 35%, ${btn.color} 0%, ${btn.color}88 60%, ${btn.color}44 100%)`,
                    boxShadow: `0 0 8px ${btn.glow}, inset -1px -1px 2px rgba(0,0,0,0.5)`,
                    flexShrink: 0,
                  }}
                />
                <span
                  className="font-pixel"
                  style={{
                    fontSize: 7,
                    letterSpacing: 1,
                    color: "#d4d4d8",
                    fontWeight: "bold",
                  }}
                >
                  {btn.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ Bottom info strip — speaker grille + brand ═══ */}
        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          {/* Left: speaker dots */}
          <div className="flex gap-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: "50%",
                  background: "#2a2a35",
                  boxShadow: "inset 0 1px 1px rgba(0,0,0,0.6)",
                }}
              />
            ))}
          </div>

          {/* Center: brand */}
          <div
            className="font-pixel"
            style={{
              fontSize: 7,
              letterSpacing: 3,
              color: "#9D00FF",
              textShadow: "0 0 8px rgba(157,0,255,0.5)",
            }}
          >
            ▪ VIBEX CONSOLE ▪
          </div>

          {/* Right: power indicator */}
          <div className="flex items-center gap-1.5">
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#FF4500",
                boxShadow: "0 0 6px #FF4500",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            <span
              className="font-pixel"
              style={{ fontSize: 6, color: "#5a5a6a", letterSpacing: 1 }}
            >
              PWR
            </span>
          </div>
        </div>
      </div>

      {/* Optional label below */}
      {label && (
        <div
          className="text-center mt-4 font-pixel"
          style={{ fontSize: 9, color: "#888", letterSpacing: 2 }}
        >
          {label}
        </div>
      )}
    </motion.div>
  );
}
