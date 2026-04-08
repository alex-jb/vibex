"use client";

import { useState, useEffect, useCallback } from "react";
import { getOnboardingState, toggleViewMode } from "@/lib/onboarding";
import { useLang } from "@/lib/i18n";

/**
 * Toggle between simple (Beginner) and full (Expert) view modes.
 * Simple mode hides complex info like radar charts, detailed stats, tech stack.
 * Place this in the navbar or settings area.
 */
export function ViewModeToggle() {
  const { t } = useLang();
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
      title={mode === "simple" ? t("viewMode.expert") : t("viewMode.simple")}
      style={{
        fontSize: 7,
        color: mode === "simple" ? "#39FF14" : "#9D00FF",
        background: mode === "simple" ? "#39FF1415" : "#9D00FF15",
        border: `1px solid ${mode === "simple" ? "#39FF1430" : "#9D00FF30"}`,
        padding: "3px 8px",
        cursor: "pointer",
      }}
    >
      {mode === "simple" ? t("viewMode.beginner") : t("viewMode.expertLabel")}
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
