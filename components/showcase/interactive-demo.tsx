"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Project } from "@/lib/types";
import { ProjectDemoCard } from "./project-demo-card";

/* ═══════════════════════════════════════════════════════════════════════════
   Interactive Demo — lives inside the Game Boy screen on the landing page.

   Two modes:
   - AUTO: cycles through example prompts. Each cycle = typewriter → generating
     → card reveal → hold → fade → next prompt.
   - USER: user clicked the screen. Terminal waits for their input, generates
     a mock card from whatever they type, and notifies the parent so the
     LAUNCH button can deep-link to /launch with their idea as a seed.

   Exits of USER mode:
   - Escape key → back to AUTO
   - Click outside the demo region → stay in USER mode (don't surprise)
   ═══════════════════════════════════════════════════════════════════════════ */

const EXAMPLES = [
  "Pomodoro timer with angry cats",
  "VC pitch auto-rejector",
  "AI chef from fridge photos",
  "Cyberpunk meditation app",
  "Remix Spotify into a time machine",
] as const;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type Phase = "idle" | "typing" | "generating" | "reveal";
type Mode = "auto" | "user";

interface InteractiveDemoProps {
  /** Called with the user's idea once they submit in user-mode, or "" when cleared. */
  onIdeaSubmit?: (idea: string) => void;
}

function buildMockProject(title: string): Project {
  const trimmed = title.trim() || "Your Idea";
  // Downstream ProjectDemoCard renders title with CSS `truncate`, which ellipsises
  // correctly at any width and handles multi-byte graphemes (Chinese, emoji).
  // Slicing at char 37 here breaks mid-word and mid-grapheme, so we pass the full
  // string and let CSS truncate visually.
  return {
    id: "demo-preview",
    title: trimmed,
    tagline: "Generated live from your prompt",
    description: trimmed,
    category: "AI Tool",
    creatorId: "you",
    creatorName: "YOU",
    tags: ["live", "demo"],
    thumbnail: "",
    views: 1337,
    upvotes: 42,
    plays: 108,
    shares: 12,
    remixCount: 3,
    score: 87,
    behaviorScore: {
      plays: 108,
      avgStaySeconds: 45,
      shareRate: 0.11,
      remixCount: 3,
      aiScore: 87,
      compound: 78,
    },
    createdAt: new Date().toISOString(),
    featured: true,
    aiReview: {
      originality: 8,
      clarity: 8,
      uxPotential: 8,
      viralityPotential: 8,
      investorCuriosity: 7,
      strengths: ["fresh concept"],
      weaknesses: [],
      suggestions: [],
    },
    demoType: "preview",
  };
}

export function InteractiveDemo({ onIdeaSubmit }: InteractiveDemoProps) {
  const [mode, setMode] = useState<Mode>("auto");
  const [phase, setPhase] = useState<Phase>("idle");
  const [displayText, setDisplayText] = useState("");
  const [revealedTitle, setRevealedTitle] = useState("");
  const [userInput, setUserInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  // Animated progress bar length during `generating` phase. Previously
  // `Math.random()` was called inline during render — impure + would produce
  // different values on every parent re-render. Driven by a setInterval here
  // so the animation is visible without violating react-hooks/purity.
  const [progressBarLen, setProgressBarLen] = useState(5);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const cancelRef = useRef(false);

  /* ─── Auto-demo state machine ─────────────────────────────────────────── */
  useEffect(() => {
    if (mode !== "auto") {
      cancelRef.current = true;
      return;
    }
    cancelRef.current = false;
    let idx = 0;

    async function loop() {
      while (!cancelRef.current) {
        const prompt = EXAMPLES[idx % EXAMPLES.length];

        // typing
        setPhase("typing");
        setRevealedTitle("");
        for (let i = 0; i <= prompt.length; i++) {
          if (cancelRef.current) return;
          setDisplayText(prompt.slice(0, i));
          await sleep(55);
        }
        if (cancelRef.current) return;
        await sleep(700);

        // generating
        setPhase("generating");
        await sleep(1400);
        if (cancelRef.current) return;

        // reveal
        setRevealedTitle(prompt);
        setPhase("reveal");
        await sleep(3200);
        if (cancelRef.current) return;

        // reset for next prompt
        setPhase("idle");
        setDisplayText("");
        setRevealedTitle("");
        await sleep(450);

        idx++;
      }
    }

    loop();
    return () => {
      cancelRef.current = true;
    };
  }, [mode]);

  /* ─── User mode ──────────────────────────────────────────────────────── */
  const enterUserMode = useCallback(() => {
    if (mode === "user") return;
    cancelRef.current = true;
    setMode("user");
    setPhase("idle");
    setDisplayText("");
    setRevealedTitle("");
    setUserInput("");
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [mode]);

  const handleUserSubmit = useCallback(async () => {
    const trimmed = userInput.trim();
    if (!trimmed) {
      // Empty submit → flash a validation message so the user knows Enter did
      // something. Auto-clears after 1.6s so the terminal returns to idle.
      setValidationError("NEED AT LEAST ONE WORD");
      setTimeout(() => setValidationError(null), 1600);
      return;
    }
    setValidationError(null);
    setPhase("generating");
    onIdeaSubmit?.(trimmed);
    await sleep(1100);
    setRevealedTitle(trimmed);
    setPhase("reveal");
  }, [userInput, onIdeaSubmit]);

  const resetToAuto = useCallback(() => {
    setMode("auto");
    setUserInput("");
    setRevealedTitle("");
    setDisplayText("");
    setPhase("idle");
    onIdeaSubmit?.("");
  }, [onIdeaSubmit]);

  /* ─── Mock project for card rendering ────────────────────────────────── */
  const cardTitle = revealedTitle || userInput || "Your Idea";
  const mockProject = useMemo(() => buildMockProject(cardTitle), [cardTitle]);

  /* ─── Terminal display text (varies by mode/phase) ───────────────────── */
  const terminalHeader =
    mode === "auto" ? "> VIBEX TERMINAL v1.0" : "> USER MODE · ENTER YOUR IDEA";
  const terminalBody = mode === "auto" ? displayText : userInput;

  // Pulse progressBarLen while generating (drives the "▓▓▓▓▓░░░" terminal feel).
  useEffect(() => {
    if (phase !== "generating") return;
    const t = setInterval(() => {
      setProgressBarLen(Math.floor(Math.random() * 4) + 3);
    }, 200);
    return () => clearInterval(t);
  }, [phase]);

  const progressBar =
    phase === "generating" ? "▓".repeat(progressBarLen).padEnd(8, "░") : "";

  return (
    <div
      className="relative w-full h-full cursor-pointer"
      onClick={enterUserMode}
      role="application"
      aria-label="VibeX interactive prompt demo. Click to enter your own idea."
    >
      {/* ═══ TERMINAL LAYER (visible in idle/typing/generating) ═══ */}
      <AnimatePresence>
        {phase !== "reveal" && (
          <motion.div
            key="terminal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col items-start justify-center"
            style={{
              padding: "10px 14px",
              fontFamily: "var(--font-retro, monospace)",
            }}
          >
            {/* Terminal header */}
            <div
              style={{
                fontSize: 9,
                color: "#39FF14",
                letterSpacing: 1,
                textShadow: "0 0 4px rgba(57,255,20,0.6)",
                marginBottom: 6,
                fontFamily: "var(--font-pixel), monospace",
              }}
            >
              {terminalHeader}
            </div>

            {/* User-mode helper line */}
            {mode === "user" && phase === "idle" && (
              <div
                style={{
                  fontSize: 11,
                  color: "#A7F3D0",
                  lineHeight: 1.3,
                  marginBottom: 4,
                }}
              >
                {">"} type anything, press ENTER
              </div>
            )}

            {/* The prompt / user text */}
            <div
              style={{
                fontSize: 14,
                color: "#E8F8E8",
                lineHeight: 1.3,
                letterSpacing: 0.3,
                minHeight: 22,
                wordBreak: "break-word",
              }}
            >
              <span style={{ color: "#39FF14" }}>{">"}</span> {terminalBody}
              {phase !== "generating" && (
                <span
                  aria-hidden="true"
                  className="inline-block align-middle"
                  style={{
                    width: 7,
                    height: 14,
                    background: "#39FF14",
                    marginLeft: 2,
                    animation: "pulse 1s steps(2) infinite",
                  }}
                />
              )}
            </div>

            {/* Generating progress */}
            {phase === "generating" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3"
                style={{
                  fontFamily: "var(--font-pixel), monospace",
                  fontSize: 9,
                  color: "var(--neon-yellow, #FACC15)",
                  letterSpacing: 1,
                }}
              >
                GENERATING [{progressBar}]
              </motion.div>
            )}

            {/* Validation error (empty submit in user mode) */}
            {validationError && (
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2"
                style={{
                  fontFamily: "var(--font-pixel), monospace",
                  fontSize: 9,
                  color: "#F97316",
                  letterSpacing: 1,
                  textShadow: "0 0 6px rgba(249,115,22,0.6)",
                }}
                role="alert"
              >
                ⚠ {validationError}
              </motion.div>
            )}

            {/* User-mode escape hint (only in user mode) */}
            {mode === "user" && (
              <div
                className="absolute left-0 right-0 text-center"
                style={{
                  bottom: 6,
                  fontFamily: "var(--font-pixel), monospace",
                  fontSize: 6,
                  letterSpacing: 1.5,
                  color: "rgba(167,243,208,0.45)",
                }}
              >
                ▸ ESC TO RESET · ENTER TO GENERATE ◂
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ CARD REVEAL LAYER ═══ */}
      <AnimatePresence>
        {phase === "reveal" && (
          <motion.div
            key="card-reveal"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ padding: 6 }}
          >
            <div style={{ width: "62%", maxWidth: 220, height: "94%", maxHeight: 280 }}>
              <ProjectDemoCard project={mockProject} />
            </div>

            {/* Contextual hints during reveal:
                - In AUTO mode: invite user to try their own idea
                - In USER mode: point them at the LAUNCH button below the screen */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="absolute left-0 right-0 text-center"
              style={{
                bottom: 2,
                fontFamily: "var(--font-pixel), monospace",
                fontSize: 6,
                letterSpacing: 1.5,
                color:
                  mode === "user"
                    ? "rgba(57,255,20,0.95)"
                    : "rgba(167,243,208,0.75)",
                textShadow:
                  mode === "user"
                    ? "0 0 6px rgba(57,255,20,0.8)"
                    : "0 0 4px rgba(157,0,255,0.5)",
                animation: "pulse 1.4s ease-in-out infinite",
              }}
              aria-hidden="true"
            >
              {mode === "user"
                ? "▼ LAUNCH BELOW ▼"
                : "▸ CLICK TO ENTER YOUR OWN IDEA ◂"}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ HIDDEN INPUT (user mode) ═══
          Uses the standard visually-hidden pattern instead of
          opacity-0 + pointer-events-none because iOS Safari won't focus
          an element with zero pointer events. Still invisible to sighted
          users and picked up by screen readers. */}
      {mode === "user" && (
        <textarea
          ref={inputRef}
          value={userInput}
          onChange={(e) => {
            setUserInput(e.target.value.slice(0, 80));
            if (validationError) setValidationError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleUserSubmit();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              resetToAuto();
            }
          }}
          aria-label="Your idea — type and press Enter to generate a preview card"
          maxLength={80}
          className="absolute"
          style={{
            left: 0,
            top: 0,
            width: 2,
            height: 2,
            clip: "rect(0 0 0 0)",
            clipPath: "inset(50%)",
            overflow: "hidden",
            whiteSpace: "nowrap",
            border: 0,
            padding: 0,
            margin: 0,
          }}
        />
      )}
    </div>
  );
}
