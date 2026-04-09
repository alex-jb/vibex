"use client";

import { motion } from "framer-motion";

interface GameBoyFrameProps {
  children: React.ReactNode;
  label?: string;
}

/**
 * Nintendo Game Boy (DMG-01) inspired frame, pixel-art styling.
 * Inspired by mGBA emulator's classic DMG rendering.
 *
 * Layout:
 *   - Grey shell with rounded top, flat bottom
 *   - Power LED + "VIBEX BOY" branding strip
 *   - Large recessed screen area (children goes here)
 *   - D-pad (left) + A/B buttons (right)
 *   - Start/Select pill buttons
 *   - Speaker grille (diagonal lines)
 *   - "Nintendo" style logo replaced with "VIBEX"
 */
export function GameBoyFrame({ children, label }: GameBoyFrameProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto"
      style={{
        width: "min(92vw, 520px)",
        // Classic DMG proportions
      }}
    >
      {/* ─── Main shell ─── */}
      <div
        style={{
          position: "relative",
          background: "linear-gradient(180deg, #B8B9C3 0%, #9FA0AA 50%, #8B8C97 100%)",
          borderTop: "4px solid #D4D5E0",
          borderLeft: "4px solid #C8C9D4",
          borderRight: "4px solid #6E6F7A",
          borderBottom: "4px solid #52535E",
          borderRadius: "16px 16px 40px 16px",
          padding: "28px 24px 48px",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.6), 0 8px 24px rgba(157,0,255,0.15), inset 0 2px 0 rgba(255,255,255,0.3)",
          imageRendering: "pixelated",
        }}
      >
        {/* Top branding strip */}
        <div
          className="flex items-center justify-between mb-4"
          style={{
            fontFamily: "var(--font-pixel), monospace",
          }}
        >
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#FF4500",
                boxShadow: "0 0 6px #FF4500, inset 0 0 2px #fff",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontSize: 7,
                color: "#3A3B46",
                letterSpacing: 2,
              }}
            >
              BATTERY
            </span>
          </div>
          <div
            style={{
              fontSize: 9,
              color: "#3A3B46",
              letterSpacing: 3,
              fontWeight: "bold",
            }}
          >
            VIBEX-BOY
          </div>
          <div style={{ width: 60 }} />
        </div>

        {/* ─── Screen bezel (dark plastic surround) ─── */}
        <div
          style={{
            background: "#2A2B36",
            borderRadius: "12px 12px 36px 12px",
            padding: "20px 22px 28px",
            boxShadow: "inset 0 4px 12px rgba(0,0,0,0.8), 0 2px 0 rgba(255,255,255,0.2)",
            border: "2px solid #1A1B24",
          }}
        >
          {/* Screen labels row */}
          <div
            className="flex items-center justify-between mb-2"
            style={{
              fontFamily: "var(--font-pixel), monospace",
              fontSize: 6,
              color: "#6A6B76",
              letterSpacing: 1.5,
            }}
          >
            <span>{"\u25C4 DOT MATRIX WITH STEREO SOUND \u25BA"}</span>
          </div>

          {/* Actual screen (where content lives) */}
          <div
            style={{
              position: "relative",
              background: "linear-gradient(180deg, #0d1410 0%, #0a1a0e 100%)",
              border: "3px solid #1a1f18",
              borderRadius: 4,
              padding: 14,
              aspectRatio: "10 / 11",
              boxShadow:
                "inset 0 0 20px rgba(57,255,20,0.08), inset 0 2px 8px rgba(0,0,0,0.9)",
              overflow: "hidden",
            }}
          >
            {/* Scanline overlay on screen */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 3px)",
                zIndex: 10,
              }}
            />
            {/* Screen glow */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                  "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)",
                zIndex: 9,
              }}
            />
            {/* Content */}
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

          {/* Bottom screen branding */}
          <div
            className="flex items-center justify-between mt-3"
            style={{
              fontFamily: "var(--font-pixel), monospace",
              fontSize: 7,
              color: "#8B8C97",
              letterSpacing: 2,
            }}
          >
            <span
              style={{
                fontStyle: "italic",
                fontSize: 10,
                fontWeight: "bold",
                color: "#9D00FF",
                letterSpacing: 1,
              }}
            >
              VibeX
            </span>
            <span>GROWTH ENGINE</span>
          </div>
        </div>

        {/* ─── Control area below screen ─── */}
        <div
          className="mt-6 grid grid-cols-2 gap-4 items-center"
          style={{ minHeight: 90 }}
        >
          {/* Left: D-pad */}
          <div className="flex items-center justify-center">
            <div
              style={{
                position: "relative",
                width: 70,
                height: 70,
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
                  background: "linear-gradient(180deg, #3A3B46 0%, #1A1B24 100%)",
                  border: "2px solid #0a0a0c",
                  borderRadius: 2,
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
                  background: "linear-gradient(90deg, #3A3B46 0%, #1A1B24 100%)",
                  border: "2px solid #0a0a0c",
                  borderRadius: 2,
                }}
              />
              {/* Center dot */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 8,
                  height: 8,
                  transform: "translate(-50%, -50%)",
                  background: "#52535E",
                  borderRadius: "50%",
                  zIndex: 2,
                }}
              />
            </div>
          </div>

          {/* Right: A / B buttons */}
          <div className="flex items-center justify-center gap-3 relative" style={{ paddingTop: 12 }}>
            <div className="flex flex-col items-center gap-1">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 35%, #C026D3 0%, #7A0C8C 70%, #450552 100%)",
                  border: "3px solid #2A0030",
                  boxShadow:
                    "inset -2px -2px 4px rgba(0,0,0,0.5), 0 3px 0 #2A0030, 0 0 12px rgba(157,0,255,0.4)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-pixel), monospace",
                  fontSize: 8,
                  color: "#3A3B46",
                  fontWeight: "bold",
                }}
              >
                B
              </span>
            </div>
            <div className="flex flex-col items-center gap-1" style={{ marginTop: -12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 35%, #39FF14 0%, #1B8C0A 70%, #0A4504 100%)",
                  border: "3px solid #0A2500",
                  boxShadow:
                    "inset -2px -2px 4px rgba(0,0,0,0.5), 0 3px 0 #0A2500, 0 0 12px rgba(57,255,20,0.4)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-pixel), monospace",
                  fontSize: 8,
                  color: "#3A3B46",
                  fontWeight: "bold",
                }}
              >
                A
              </span>
            </div>
          </div>
        </div>

        {/* ─── Start / Select pills ─── */}
        <div className="flex items-center justify-center gap-4 mt-4">
          {["SELECT", "START"].map((label) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div
                style={{
                  width: 30,
                  height: 6,
                  background: "#3A3B46",
                  borderRadius: 10,
                  border: "1px solid #0a0a0c",
                  transform: "rotate(-25deg)",
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-pixel), monospace",
                  fontSize: 6,
                  color: "#3A3B46",
                  fontWeight: "bold",
                  letterSpacing: 1,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* ─── Speaker grille (diagonal lines) ─── */}
        <div
          className="flex justify-end mt-6"
          style={{ transform: "rotate(-25deg)" }}
        >
          <div className="flex flex-col gap-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                style={{
                  width: 40,
                  height: 3,
                  background: "#3A3B46",
                  borderRadius: 2,
                  boxShadow: "inset 0 1px 1px rgba(0,0,0,0.4)",
                }}
              />
            ))}
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
