"use client";

import { MotionConfig } from "framer-motion";

/**
 * Framer Motion global config.
 * `reducedMotion="user"` = honor the OS/browser prefers-reduced-motion setting.
 * Users who opt out get static content; everyone else gets the full arcade feel.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
