"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  autoFlipInterval?: number; // ms, default 4000
  width?: number | string;
  height?: number | string;
  className?: string;
}

/**
 * 3D flip card with auto-rotation.
 * - Flips every `autoFlipInterval` ms
 * - Hover to pause
 * - Click to flip manually
 */
export function FlipCard({
  front,
  back,
  autoFlipInterval = 4000,
  width = "100%",
  height = "100%",
  className = "",
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = setInterval(() => {
      setIsFlipped((prev) => !prev);
    }, autoFlipInterval);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, autoFlipInterval]);

  return (
    <div
      className={`relative group ${className}`}
      style={{
        width,
        height,
        perspective: 1200,
        cursor: "pointer",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={() => setIsFlipped((prev) => !prev)}
      role="button"
      aria-label={`Showcase card, currently showing ${isFlipped ? "hero form" : "project form"}. Press Enter or Space to flip.`}
      aria-pressed={isFlipped}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsFlipped((prev) => !prev);
        }
      }}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Front face */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {front}
        </div>

        {/* Back face */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {back}
        </div>
      </motion.div>

      {/* Flip affordance — visual hint centered inside card bounds, shows on
          hover/focus. Keyboard users can tab here, see the hint, hit Space.
          Positioned inside the card so it doesn't clip against the Game Boy
          screen overflow. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300"
        style={{
          bottom: 4,
          padding: "3px 8px",
          background: "rgba(0,0,0,0.75)",
          border: "1px solid rgba(157,0,255,0.6)",
          fontFamily: "var(--font-pixel), monospace",
          fontSize: 6,
          letterSpacing: 1.5,
          color: "#E9BDFF",
          textShadow: "0 0 4px rgba(157,0,255,0.6)",
          whiteSpace: "nowrap",
          zIndex: 30,
        }}
      >
        ◂ SPACE TO FLIP ▸
      </div>
    </div>
  );
}
