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
      className={`relative ${className}`}
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
      aria-label="Flip card"
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
    </div>
  );
}
