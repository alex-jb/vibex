"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Candy } from "lucide-react";

interface RareCandyButtonProps {
  projectTitle: string;
  currentDonors?: number;
  className?: string;
}

export function RareCandyButton({
  projectTitle,
  currentDonors = 0,
  className = "",
}: RareCandyButtonProps) {
  const [fed, setFed] = useState(false);
  const [count, setCount] = useState(currentDonors);
  const [showEffect, setShowEffect] = useState(false);

  const handleFeed = () => {
    if (fed) return;
    setFed(true);
    setCount((c) => c + 1);
    setShowEffect(true);
    setTimeout(() => setShowEffect(false), 1200);
  };

  return (
    <div className={`relative inline-flex flex-col items-center gap-1 ${className}`}>
      <button
        onClick={handleFeed}
        disabled={fed}
        className={`retro-button retro-button--primary flex items-center gap-2 ${
          fed ? "opacity-60 cursor-not-allowed" : ""
        }`}
        title={`Feed a Rare Candy to ${projectTitle}`}
      >
        <Candy size={14} />
        <span>{fed ? "Fed!" : "Rare Candy"}</span>
      </button>

      <span className="font-pixel text-[7px] text-muted-foreground">
        {count} trainer{count !== 1 ? "s" : ""} fed
      </span>

      {/* +EXP float effect */}
      <AnimatePresence>
        {showEffect && (
          <motion.span
            className="absolute -top-4 font-pixel text-[10px] pointer-events-none"
            style={{ color: "#a855f7" }}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -30 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            +50 EXP
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
