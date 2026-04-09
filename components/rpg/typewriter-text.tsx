"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per character
  className?: string;
  onComplete?: () => void;
  showCursor?: boolean;
}

export function TypewriterText({
  text,
  speed = 12,
  className = "",
  onComplete,
  showCursor = true,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  // Hold the onComplete callback in a ref so changing its identity doesn't
  // restart the interval (was causing the boot sequence to freeze mid-line
  // when the parent re-rendered).
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
        onCompleteRef.current?.();
      }
    }, speed);
    return () => clearInterval(timer);
    // Intentionally exclude onComplete — held in ref above
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed]);

  return (
    <motion.span
      className={`font-retro text-lg leading-relaxed ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {displayed}
      {showCursor && !done && (
        <span className="inline-block w-2 h-4 bg-current ml-0.5 animate-pulse" />
      )}
    </motion.span>
  );
}
