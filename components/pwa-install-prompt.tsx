"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   PWA Install Prompt — shows a retro install card on 3rd visit for eligible
   browsers (Chrome/Edge desktop + Android). Safari/iOS is excluded because
   it doesn't fire beforeinstallprompt (those users need manual "Add to Home").
   ═══════════════════════════════════════════════════════════════════════════ */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

const VISIT_COUNT_KEY = "vibex.pwaVisits.v1";
const PROMPT_DISMISSED_KEY = "vibex.pwaPromptDismissed.v1";
const MIN_VISITS_BEFORE_PROMPT = 3;

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  // Bump visit counter on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const dismissedAt = localStorage.getItem(PROMPT_DISMISSED_KEY);
      if (dismissedAt) {
        const daysSinceDismiss = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
        // Don't re-prompt within 7 days of a dismissal
        if (daysSinceDismiss < 7) return;
      }
      const visits = Number(localStorage.getItem(VISIT_COUNT_KEY) ?? "0") + 1;
      localStorage.setItem(VISIT_COUNT_KEY, String(visits));
    } catch {
      // ignore storage errors
    }
  }, []);

  // Listen for install-available event
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already running as installed PWA? skip.
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Only show after N visits
      try {
        const visits = Number(localStorage.getItem(VISIT_COUNT_KEY) ?? "0");
        if (visits >= MIN_VISITS_BEFORE_PROMPT) {
          // Delay to avoid interfering with first paint
          setTimeout(() => setVisible(true), 2500);
        }
      } catch {
        // If storage fails, still show after delay on eligible browser
        setTimeout(() => setVisible(true), 4000);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Listen for successful install
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      setVisible(false);
      setDeferredPrompt(null);
      try {
        localStorage.setItem(PROMPT_DISMISSED_KEY, String(Date.now()));
      } catch {
        // ignore
      }
    };
    window.addEventListener("appinstalled", handler);
    return () => window.removeEventListener("appinstalled", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "dismissed") {
        localStorage.setItem(PROMPT_DISMISSED_KEY, String(Date.now()));
      }
    } catch {
      // prompt() can throw if already used — swallow
    } finally {
      setVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(PROMPT_DISMISSED_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="pwa-prompt"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className="fixed z-[70] left-4 right-4 md:left-auto md:right-6"
          style={{
            bottom: "calc(env(safe-area-inset-bottom, 0) + 80px)",
            maxWidth: 380,
            marginLeft: "auto",
          }}
          role="dialog"
          aria-labelledby="pwa-install-title"
          aria-describedby="pwa-install-desc"
        >
          <div
            className="relative p-4"
            style={{
              background:
                "linear-gradient(180deg, #15081f 0%, #1a0a25 50%, #12061a 100%)",
              border: "3px solid var(--neon-purple)",
              boxShadow:
                "4px 4px 0 #000, 0 0 24px rgba(157,0,255,0.35), 0 16px 40px rgba(0,0,0,0.8)",
            }}
          >
            {/* Dismiss button */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss install prompt"
              className="absolute top-2 right-2 p-1 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
              style={{
                color: "#C9B8E8",
                cursor: "pointer",
              }}
            >
              <X className="size-4" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-3 mb-3 pr-6">
              <div
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 36,
                  height: 36,
                  background:
                    "linear-gradient(135deg, var(--neon-purple), #C026D3)",
                  border: "2px solid #FFF",
                  boxShadow: "2px 2px 0 #000, 0 0 12px rgba(157,0,255,0.5)",
                }}
              >
                <Smartphone className="size-4" style={{ color: "#FFF" }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  id="pwa-install-title"
                  className="font-pixel"
                  style={{
                    fontSize: 11,
                    letterSpacing: 1.5,
                    color: "#FFF",
                    textShadow: "1px 1px 0 var(--neon-purple)",
                    lineHeight: 1.3,
                  }}
                >
                  LOAD VIBEX ONTO DEVICE
                </h3>
                <p
                  id="pwa-install-desc"
                  className="font-retro mt-1"
                  style={{
                    fontSize: 13,
                    color: "#C9B8E8",
                    lineHeight: 1.4,
                  }}
                >
                  One tap to launch. No browser. Pure arcade.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={handleInstall}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 font-pixel transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/50"
                style={{
                  background:
                    "linear-gradient(135deg, var(--neon-purple), #C026D3)",
                  border: "2px solid #FFF",
                  boxShadow: "3px 3px 0 #000, 0 0 12px rgba(157,0,255,0.5)",
                  color: "#FFF",
                  minHeight: 40,
                  fontSize: 10,
                  letterSpacing: 1.5,
                  cursor: "pointer",
                }}
              >
                <Download className="size-3.5" />
                INSTALL
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-2 font-pixel transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/30"
                style={{
                  background: "rgba(0,0,0,0.5)",
                  border: "2px solid rgba(157,0,255,0.4)",
                  boxShadow: "3px 3px 0 #000",
                  color: "#C9B8E8",
                  minHeight: 40,
                  fontSize: 10,
                  letterSpacing: 1.5,
                  cursor: "pointer",
                }}
              >
                NOT NOW
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
