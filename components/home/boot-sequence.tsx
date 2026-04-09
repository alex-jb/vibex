"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Eye } from "lucide-react";
import Link from "next/link";
import { TypewriterText } from "@/components/rpg/typewriter-text";
import { useLang } from "@/lib/i18n";

interface BootSequenceProps {
  communityStats: ReadonlyArray<{ label: string; value: string; color: string }>;
}

export function BootSequence({ communityStats }: BootSequenceProps) {
  const [bootComplete, setBootComplete] = useState(false);
  const [bootLine, setBootLine] = useState(0);
  const { t } = useLang();

  const bootLines = useMemo(
    () => [t("boot.0"), t("boot.1"), t("boot.2"), t("boot.3"), t("boot.4"), t("boot.5"), t("boot.6")],
    [t],
  );

  const handleBootLineComplete = useCallback(() => {
    if (bootLine < bootLines.length - 1) {
      setBootLine((prev) => prev + 1);
    } else {
      setBootComplete(true);
    }
  }, [bootLine, bootLines.length]);

  // Safety fallback: if boot doesn't complete in 8 seconds, force-complete it.
  // Prevents the page from getting stuck on the terminal animation if anything
  // goes wrong with the typewriter (e.g., slow JS execution, interrupted effects).
  useEffect(() => {
    if (bootComplete) return;
    const timeout = setTimeout(() => setBootComplete(true), 8000);
    return () => clearTimeout(timeout);
  }, [bootComplete]);

  return (
    <section className="relative min-h-[90vh] flex items-center py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="retro-card l-corner p-6 sm:p-10" style={{ background: "var(--bg-panel)" }}>
          <div className="l-corner-inner absolute inset-0 pointer-events-none" />

          {/* Terminal header */}
          <div
            className="flex items-center gap-2 pb-4 mb-6"
            style={{ borderBottom: "2px solid var(--border-metal)" }}
          >
            <div className="w-3 h-3" style={{ background: "var(--neon-orange)", border: "1px solid #000" }} />
            <div className="w-3 h-3" style={{ background: "var(--neon-yellow)", border: "1px solid #000" }} />
            <div className="w-3 h-3" style={{ background: "var(--neon-green)", border: "1px solid #000" }} />
            <span className="font-pixel text-[8px] ml-3 uppercase tracking-widest" style={{ color: "var(--neon-green)" }}>
              VIBECODE_HUNT.EXE
            </span>
          </div>

          {/* Boot sequence */}
          <div className="min-h-[200px] sm:min-h-[260px] relative">
            {!bootComplete && (
              <button
                onClick={() => setBootComplete(true)}
                className="absolute top-0 right-0 font-pixel text-[7px] uppercase px-2 py-1 z-10 transition-opacity hover:opacity-100 opacity-60"
                style={{
                  border: "1px solid var(--border-bolt)",
                  color: "var(--border-bolt)",
                  background: "var(--bg-deep)",
                }}
              >
                SKIP &gt;&gt;
              </button>
            )}
            {bootComplete
              ? bootLines.map((line, i) => (
                  <div key={i} className="mb-2">
                    <span
                      className="font-retro text-lg"
                      style={{ color: i === bootLines.length - 1 ? "var(--neon-yellow)" : "var(--neon-green)" }}
                    >
                      {line}
                    </span>
                  </div>
                ))
              : bootLines.slice(0, bootLine + 1).map((line, i) => (
                  <div key={i} className="mb-2">
                    {i < bootLine ? (
                      <span
                        className="font-retro text-lg"
                        style={{ color: i === bootLines.length - 1 ? "var(--neon-yellow)" : "var(--neon-green)" }}
                      >
                        {line}
                      </span>
                    ) : (
                      <TypewriterText
                        text={line}
                        speed={line === "" ? 10 : 25}
                        className={i === bootLines.length - 1 ? "!text-[var(--neon-yellow)]" : "!text-[var(--neon-green)]"}
                        onComplete={handleBootLineComplete}
                        showCursor={i === bootLine}
                      />
                    )}
                  </div>
                ))}
          </div>

          {/* Action buttons */}
          <AnimatePresence>
            {bootComplete && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="mt-8 flex flex-col sm:flex-row gap-4"
              >
                <Link href="/home">
                  <button className="retro-button retro-button--primary flex items-center gap-2">
                    <Swords size={14} />
                    <span>LAUNCH VIBEX &gt;&gt;</span>
                  </button>
                </Link>
                <Link href="/discover">
                  <button className="retro-button flex items-center gap-2">
                    <Eye size={14} />
                    <span>{t("hero.exploreArena")}</span>
                  </button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Community HUD stats */}
          <AnimatePresence>
            {bootComplete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-8 pt-6 flex flex-wrap gap-8"
                style={{ borderTop: "2px solid var(--border-metal)" }}
              >
                {communityStats.map((stat) => (
                  <div key={stat.label} className="flex flex-col">
                    <span
                      className="font-pixel text-xl sm:text-2xl"
                      style={{ color: stat.color, textShadow: `0 0 20px ${stat.color}40` }}
                    >
                      {stat.value}
                    </span>
                    <span className="font-pixel text-[7px] mt-1" style={{ color: "var(--border-bolt)" }}>
                      {stat.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
