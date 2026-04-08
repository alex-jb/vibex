"use client";

import { useState, useEffect, useCallback } from "react";
import { getOnboardingState, toggleViewMode } from "@/lib/onboarding";

/**
 * Toggle between simple (新手) and full (专家) view modes.
 * Simple mode hides complex info like radar charts, detailed stats, tech stack.
 * Place this in the navbar or settings area.
 */
export function ViewModeToggle() {
  const [mode, setMode] = useState<"simple" | "full">("simple");

  useEffect(() => {
    setMode(getOnboardingState().viewMode);
  }, []);

  const handleToggle = useCallback(() => {
    const newMode = toggleViewMode();
    setMode(newMode);
    // Dispatch custom event so other components can react
    window.dispatchEvent(new CustomEvent("vibex-viewmode", { detail: newMode }));
  }, []);

  return (
    <button
      onClick={handleToggle}
      className="font-pixel"
      title={mode === "simple" ? "\u5207\u6362\u5230\u4E13\u5BB6\u6A21\u5F0F" : "\u5207\u6362\u5230\u7B80\u6D01\u6A21\u5F0F"}
      style={{
        fontSize: 7,
        color: mode === "simple" ? "#39FF14" : "#9D00FF",
        background: mode === "simple" ? "#39FF1415" : "#9D00FF15",
        border: `1px solid ${mode === "simple" ? "#39FF1430" : "#9D00FF30"}`,
        padding: "3px 8px",
        cursor: "pointer",
      }}
    >
      {mode === "simple" ? "\uD83C\uDFAE \u65B0\u624B" : "\u2699\uFE0F \u4E13\u5BB6"}
    </button>
  );
}

/**
 * Hook: subscribe to view mode changes.
 */
export function useViewMode() {
  const [mode, setMode] = useState<"simple" | "full">("simple");

  useEffect(() => {
    setMode(getOnboardingState().viewMode);
    const handler = (e: Event) => setMode((e as CustomEvent).detail);
    window.addEventListener("vibex-viewmode", handler);
    return () => window.removeEventListener("vibex-viewmode", handler);
  }, []);

  return mode;
}
