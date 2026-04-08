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
    title: "\u6B22\u8FCE\u6765\u5230 VibeX!",
    description: "\u8FD9\u662F AI \u521B\u4F5C\u8005\u7684\u53D1\u5E03\u4E0E\u589E\u957F\u5E73\u53F0\u3002\u63A2\u7D22\u9879\u76EE\u3001\u53C2\u4E0E\u6218\u6597\u3001\u53EC\u5524 Buddy\u3001\u53D1\u5E03\u4F60\u7684 AI \u4F5C\u54C1\u3002",
  },
  {
    emoji: "\uD83D\uDE80",
    title: "\u4F60\u7684\u7B2C\u4E00\u6B65",
    description: "\u70B9\u51FB\u201C\u63A2\u7D22\u201D\u53D1\u73B0\u70ED\u95E8 AI \u9879\u76EE\uFF0C\u7528 \uD83D\uDD25\uD83C\uDFAE\uD83C\uDFA8\uD83E\uDD2F \u53CD\u5E94\u8868\u8FBE\u4F60\u7684\u770B\u6CD5\uFF0C\u5728 Feed \u5206\u4EAB\u4F60\u7684\u60F3\u6CD5\u3002",
  },
  {
    emoji: "\u2B50",
    title: "\u5347\u7EA7\u4F60\u7684\u5F81\u7A0B",
    description: "\u5B8C\u6210\u4EFB\u52A1\u83B7\u5F97 XP\uFF0C\u5347\u7EA7\u4F60\u7684 Creator \u7B49\u7EA7 (Lv.1\u219250)\uFF0C\u53EC\u5524\u50CF\u7D20\u5B0D\u7269\uFF0C\u5728 Arena \u6311\u6218\u5176\u4ED6\u9879\u76EE\uFF01",
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
              {"\u8DF3\u8FC7"}
            </button>
            <button
              className="nes-btn is-primary"
              onClick={handleNext}
              style={{ fontSize: 8, padding: "4px 14px" }}
            >
              {step < STEPS.length - 1 ? "\u4E0B\u4E00\u6B65 \u2192" : "\u5F00\u59CB\u5192\u9669\uFF01"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
