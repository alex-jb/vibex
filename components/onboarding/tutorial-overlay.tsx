"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { completeTutorial, getOnboardingState } from "@/lib/onboarding";

interface TutorialStep {
  emoji: string;
  title: string;
  description: string;
}

const STEPS: TutorialStep[] = [
  {
    emoji: "\uD83C\uDFAE",
    title: "Welcome to VibeX!",
    description: "This is the launch and growth platform for AI creators. Explore projects, join battles, summon Buddies, and publish your AI creations.",
  },
  {
    emoji: "\uD83D\uDE80",
    title: "Your First Step",
    description: "Click 'Explore' to discover trending AI projects, react with emojis to share your thoughts, and post your ideas in the Feed.",
  },
  {
    emoji: "\u2B50",
    title: "Level Up Your Journey",
    description: "Complete quests to earn XP, level up your Creator rank (Lv.1-50), summon pixel pets, and challenge other projects in the Arena!",
  },
];

export function TutorialOverlay() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const state = getOnboardingState();
    if (!state.tutorialCompleted && state.firstVisit) {
      setVisible(true);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      completeTutorial();
      setVisible(false);
    }
  }, [step]);

  const handleSkip = useCallback(() => {
    completeTutorial();
    setVisible(false);
  }, []);

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.85)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="rpgui-container framed"
          style={{ maxWidth: 420, width: "100%", padding: 24, textAlign: "center" }}
        >
          {/* Step indicator */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
            {STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  width: 24,
                  height: 4,
                  background: i <= step ? "#9D00FF" : "#2A2A30",
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div style={{ fontSize: 40, marginBottom: 12 }}>{current.emoji}</div>
          <div className="font-pixel" style={{ fontSize: 12, color: "#FACC15", marginBottom: 10 }}>
            {current.title}
          </div>
          <div className="font-retro" style={{ fontSize: 14, color: "#E8E8EC", lineHeight: 1.6, marginBottom: 20 }}>
            {current.description}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
            <button
              className="nes-btn"
              onClick={handleSkip}
              style={{ fontSize: 8, padding: "4px 14px", opacity: 0.6 }}
            >
              {"Skip"}
            </button>
            <button
              className="nes-btn is-primary"
              onClick={handleNext}
              style={{ fontSize: 8, padding: "4px 14px" }}
            >
              {step < STEPS.length - 1 ? "Next \u2192" : "Start Adventure!"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
